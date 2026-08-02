"""Fetch one Kalimati daily price snapshot and store it in Supabase.

The script intentionally does not write a local CSV.  Run it from the
``backend`` directory, or set ``KALIMATI_DATE`` when replaying a specific
published date (YYYY-MM-DD).
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Iterable
from zoneinfo import ZoneInfo

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv


PRICE_URL = "https://kalimatimarket.gov.np/price"
NEPAL_TIMEZONE = ZoneInfo("Asia/Kathmandu")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
USER_AGENT = "Anvaya-Market-Research/0.2"

logger = logging.getLogger("kalimati_prices")
DEFAULT_RETENTION_DAYS = 7
DEVANAGARI_PATTERN = re.compile(r"[\u0900-\u097F]")


def load_environment() -> None:
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def get_csrf_token(session: requests.Session) -> str:
    response = session.get(
        PRICE_URL,
        timeout=30,
        headers={"User-Agent": USER_AGENT},
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    token_input = soup.find("input", {"name": "_token"})
    if token_input is None or not token_input.get("value"):
        raise RuntimeError("Could not find the Kalimati CSRF token.")
    return str(token_input["value"])


def fetch_price_page(
    session: requests.Session,
    selected_date: date,
    csrf_token: str,
) -> str:
    response = session.post(
        PRICE_URL,
        data={"_token": csrf_token, "datePricing": selected_date.isoformat()},
        timeout=30,
        headers={
            "User-Agent": USER_AGENT,
            "Referer": PRICE_URL,
            "Origin": "https://kalimatimarket.gov.np",
        },
    )
    response.raise_for_status()
    return response.text


def nepali_digits_to_ascii(value: str) -> str:
    return value.translate(str.maketrans("०१२३४५६७८९", "0123456789"))


def parse_npr(value: str) -> float:
    cleaned = nepali_digits_to_ascii(value).replace(",", "")
    match = re.search(r"\d+(?:\.\d+)?", cleaned)
    if not match:
        raise ValueError(f"Could not parse numeric price: {value!r}")
    return float(match.group(0))


def parse_price_table(html: str, selected_date: date) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.select_one("#commodityPriceParticular")
    if table is None:
        raise RuntimeError("Could not find the Kalimati commodity-price table.")

    collected_at = datetime.now(NEPAL_TIMEZONE).isoformat()
    records: list[dict] = []

    for row in table.select("tbody tr"):
        cells = [cell.get_text(" ", strip=True) for cell in row.select("td")]
        if len(cells) < 5:
            continue

        records.append(
            {
                "price_date": selected_date.isoformat(),
                "commodity_name_ne": cells[0],
                "unit_ne": cells[1],
                "minimum_price_npr": parse_npr(cells[2]),
                "maximum_price_npr": parse_npr(cells[3]),
                "average_price_npr": parse_npr(cells[4]),
                "market": "Kalimati",
                "source": "Kalimati Market Development Board",
                "source_url": PRICE_URL,
                "collected_at": collected_at,
            }
        )

    if not records:
        raise RuntimeError(
            "The request succeeded, but no price records were found. "
            "The selected date may not have published market data."
        )
    return records


def chunks(values: list[str], size: int) -> Iterable[list[str]]:
    for start in range(0, len(values), size):
        yield values[start : start + size]


def extract_gemini_text(payload: dict) -> str:
    try:
        return payload["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError("Gemini returned no text content.") from exc


def parse_json_object(text: str) -> dict[str, str]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE)
    parsed = json.loads(cleaned)
    if not isinstance(parsed, dict):
        raise ValueError("Gemini translation response was not a JSON object.")
    return {str(key): str(value).strip() for key, value in parsed.items()}


def translate_names_with_gemini(names: list[str]) -> dict[str, str]:
    """Translate new names strictly; never silently fall back to Nepali."""
    if not names:
        return {}
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is required when new commodity names need translation."
        )

    model = os.getenv("GEMINI_MODEL") or "gemini-3.6-flash"
    translated: dict[str, str] = {}
    for name_batch in chunks(names, 50):
        prompt = (
            "Translate each Nepali agricultural commodity name into concise, "
            "natural English. Preserve variety, locality, and parenthetical "
            "qualifiers. Do not transliterate. Return ONLY a JSON object with "
            "exactly one key for every input string and an English value for "
            "each key.\n\n"
            f"Input names: {json.dumps(name_batch, ensure_ascii=False)}"
        )
        response = requests.post(
            GEMINI_ENDPOINT.format(model=model),
            headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0,
                    "responseMimeType": "application/json",
                },
            },
            timeout=60,
        )
        if not response.ok:
            raise RuntimeError(
                f"Gemini translation failed ({response.status_code}): {response.text[:300]}"
            )
        try:
            batch_translations = parse_json_object(
                extract_gemini_text(response.json())
            )
        except (ValueError, RuntimeError, json.JSONDecodeError) as exc:
            raise RuntimeError("Could not parse Gemini translation response.") from exc

        if set(batch_translations) != set(name_batch):
            missing = sorted(set(name_batch) - set(batch_translations))
            raise RuntimeError(
                f"Gemini did not return an exact translation map; missing: {missing}"
            )
        for source_name in name_batch:
            english_name = batch_translations[source_name]
            if not english_name or DEVANAGARI_PATTERN.search(english_name):
                raise RuntimeError(
                    f"Gemini returned an invalid English translation for {source_name!r}."
                )
            translated[source_name] = english_name

    return translated


def supabase_credentials() -> tuple[str, str]:
    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not supabase_url or not service_key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
        )
    return supabase_url, service_key


def get_translation_cache() -> dict[str, str]:
    """Read permanent commodity translations without reading price history."""
    supabase_url, service_key = supabase_credentials()
    response = requests.get(
        f"{supabase_url}/rest/v1/kalimati_commodity_translations",
        params={"select": "commodity_name_ne,commodity_name_en", "limit": 5000},
        headers={"apikey": service_key, "Authorization": f"Bearer {service_key}"},
        timeout=60,
    )
    if not response.ok:
        raise RuntimeError(
            f"Could not read the translation cache ({response.status_code}): "
            f"{response.text[:500]}"
        )
    return {
        row["commodity_name_ne"]: row["commodity_name_en"]
        for row in response.json()
        if row.get("commodity_name_ne") and row.get("commodity_name_en")
    }


def save_translations(translations: dict[str, str]) -> None:
    if not translations:
        return
    supabase_url, service_key = supabase_credentials()
    model = os.getenv("GEMINI_MODEL") or "gemini-3.6-flash"
    payload = [
        {
            "commodity_name_ne": source_name,
            "commodity_name_en": english_name,
            "translation_model": model,
        }
        for source_name, english_name in translations.items()
    ]
    response = requests.post(
        f"{supabase_url}/rest/v1/kalimati_commodity_translations",
        params={"on_conflict": "commodity_name_ne"},
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        json=payload,
        timeout=60,
    )
    if not response.ok:
        raise RuntimeError(
            f"Could not save translations ({response.status_code}): {response.text[:500]}"
        )


def add_english_fields(records: list[dict]) -> list[dict]:
    names = list(dict.fromkeys(record["commodity_name_ne"] for record in records))
    translations = get_translation_cache()
    missing_names = [name for name in names if name not in translations]
    if missing_names:
        new_translations = translate_names_with_gemini(missing_names)
        save_translations(new_translations)
        translations.update(new_translations)

    unit_names = {
        "के.जी.": "kg",
        "केजी": "kg",
        "के जी": "kg",
        "के.जी": "kg",
        "दर्जन": "dozen",
        "प्रति गोटा": "piece",
    }
    for record in records:
        record["commodity_name_en"] = translations[record["commodity_name_ne"]]
        record["unit_en"] = unit_names.get(record["unit_ne"], record["unit_ne"])
    return records


def upsert_to_supabase(records: list[dict]) -> None:
    supabase_url, service_key = supabase_credentials()

    endpoint = f"{supabase_url}/rest/v1/kalimati_daily_prices"
    response = requests.post(
        endpoint,
        params={"on_conflict": "price_date,commodity_name_ne,unit_ne"},
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        json=records,
        timeout=60,
    )
    if not response.ok:
        raise RuntimeError(
            f"Supabase price upsert failed ({response.status_code}): {response.text[:500]}"
        )


def prune_old_snapshots() -> None:
    """Keep only the latest seven published Kalimati dates in Supabase."""
    supabase_url, service_key = supabase_credentials()
    retention_days = max(
        1, int(os.getenv("KALIMATI_RETENTION_DAYS", str(DEFAULT_RETENTION_DAYS)))
    )
    endpoint = f"{supabase_url}/rest/v1/kalimati_daily_prices"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
    }

    response = requests.get(
        endpoint,
        params={"select": "price_date", "order": "price_date.desc", "limit": 1000},
        headers=headers,
        timeout=60,
    )
    if not response.ok:
        raise RuntimeError(
            f"Could not inspect Kalimati retention window ({response.status_code}): "
            f"{response.text[:500]}"
        )

    published_dates = sorted(
        {row["price_date"] for row in response.json() if row.get("price_date")},
        reverse=True,
    )
    if len(published_dates) <= retention_days:
        return

    oldest_retained_date = published_dates[retention_days - 1]
    delete_response = requests.delete(
        endpoint,
        params={"price_date": f"lt.{oldest_retained_date}"},
        headers={**headers, "Prefer": "return=minimal"},
        timeout=60,
    )
    if not delete_response.ok:
        raise RuntimeError(
            f"Could not prune old Kalimati snapshots ({delete_response.status_code}): "
            f"{delete_response.text[:500]}"
        )
    logger.info(
        "Pruned Kalimati history before %s; retained %s published dates.",
        oldest_retained_date,
        retention_days,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--date",
        dest="selected_date",
        help="Published Kalimati date in YYYY-MM-DD format; defaults to Nepal today.",
    )
    parser.add_argument(
        "--check-gemini",
        action="store_true",
        help="Make one small translation request to verify Gemini credentials/model.",
    )
    return parser.parse_args()


def check_gemini() -> None:
    result = translate_names_with_gemini(["आलु रातो(लाम्चो)"])
    print(f"Gemini is working with {os.getenv('GEMINI_MODEL') or 'gemini-3.6-flash'}: {result}")


def main() -> None:
    load_environment()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
    args = parse_args()
    if args.check_gemini:
        check_gemini()
        return
    selected_date = date.fromisoformat(
        args.selected_date or os.getenv("KALIMATI_DATE") or datetime.now(NEPAL_TIMEZONE).date().isoformat()
    )

    with requests.Session() as session:
        csrf_token = get_csrf_token(session)
        dates_to_try = [selected_date]
        if not args.selected_date and not os.getenv("KALIMATI_DATE"):
            # Kalimati may publish the next snapshot after midnight. Keep the
            # midnight job useful by falling back to the latest prior date.
            dates_to_try.append(selected_date - timedelta(days=1))

        records = None
        for candidate_date in dates_to_try:
            html = fetch_price_page(session, candidate_date, csrf_token)
            try:
                records = parse_price_table(html, candidate_date)
                if candidate_date != selected_date:
                    logger.warning("No prices for %s; using latest published date %s.", selected_date, candidate_date)
                break
            except RuntimeError:
                if candidate_date == dates_to_try[-1]:
                    raise

    if records is None:
        raise RuntimeError("No Kalimati records were collected.")
    records = add_english_fields(records)
    upsert_to_supabase(records)
    prune_old_snapshots()
    logger.info("Saved %s Kalimati records for %s to Supabase.", len(records), selected_date)


if __name__ == "__main__":
    main()
