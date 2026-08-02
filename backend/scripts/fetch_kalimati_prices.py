from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pandas as pd
import requests
from bs4 import BeautifulSoup


PRICE_URL = "https://kalimatimarket.gov.np/price"
NEPAL_TIMEZONE = ZoneInfo("Asia/Kathmandu")

RAW_DIRECTORY = Path("data/raw/kalimati")
PROCESSED_DIRECTORY = Path("data/processed/kalimati")


def get_csrf_token(session: requests.Session) -> str:
    """
    Open the Kalimati price page and extract a fresh CSRF token.

    The website requires the token and matching session cookies before
    accepting a POST request for a selected market-price date.
    """
    response = session.get(
        PRICE_URL,
        timeout=30,
        headers={
            "User-Agent": (
                "Mozilla/5.0 "
                "(Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 "
                "(KHTML, like Gecko) "
                "Chrome/150.0.0.0 Safari/537.36 "
                "Anvaya-Market-Research/0.1"
            )
        },
    )

    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    token_input = soup.find("input", {"name": "_token"})

    if token_input is None or not token_input.get("value"):
        raise RuntimeError(
            "Could not find the CSRF token on the Kalimati price page."
        )

    return str(token_input["value"])


def fetch_price_page(
    session: requests.Session,
    selected_date: date,
    csrf_token: str,
) -> str:
    """
    Submit the selected date and return the populated HTML price page.
    """
    response = session.post(
        PRICE_URL,
        data={
            "_token": csrf_token,
            "datePricing": selected_date.isoformat(),
        },
        timeout=30,
        headers={
            "User-Agent": (
                "Mozilla/5.0 "
                "(Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 "
                "(KHTML, like Gecko) "
                "Chrome/150.0.0.0 Safari/537.36 "
                "Anvaya-Market-Research/0.1"
            ),
            "Referer": PRICE_URL,
            "Origin": "https://kalimatimarket.gov.np",
        },
    )

    response.raise_for_status()

    return response.text


def parse_price_table(
    html: str,
    selected_date: date,
) -> pd.DataFrame:
    """
    Parse the populated Kalimati commodity-price table.

    Prices are kept as raw text for now because the source contains Nepali
    currency text and Nepali digits. Numeric cleaning will be added in the
    next pipeline stage.
    """
    soup = BeautifulSoup(html, "html.parser")

    table = soup.select_one("#commodityPriceParticular")

    if table is None:
        raise RuntimeError(
            "Could not find the Kalimati commodity-price table."
        )

    rows = table.select("tbody tr")

    collected_at = datetime.now(NEPAL_TIMEZONE).isoformat()

    records: list[dict] = []

    for row in rows:
        cells = [
            cell.get_text(" ", strip=True)
            for cell in row.select("td")
        ]

        if len(cells) < 5:
            continue

        records.append(
            {
                "commodity": cells[0],
                "unit": cells[1],
                "minimum_price_raw": cells[2],
                "maximum_price_raw": cells[3],
                "average_price_raw": cells[4],
                "market": "Kalimati",
                "price_date": selected_date.isoformat(),
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

    return pd.DataFrame(records)


def save_results(
    html: str,
    dataframe: pd.DataFrame,
    selected_date: date,
) -> None:
    """
    Save the raw HTML response and the parsed CSV snapshot.

    Raw HTML is preserved so the source response can be inspected if the
    parser breaks or the website structure changes later.
    """
    RAW_DIRECTORY.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIRECTORY.mkdir(parents=True, exist_ok=True)

    date_text = selected_date.isoformat()

    raw_path = RAW_DIRECTORY / f"{date_text}.html"
    csv_path = PROCESSED_DIRECTORY / f"{date_text}.csv"

    raw_path.write_text(
        html,
        encoding="utf-8",
    )

    dataframe.to_csv(
        csv_path,
        index=False,
        encoding="utf-8-sig",
    )

    print(f"Selected Nepal date: {date_text}")
    print(f"Collected records: {len(dataframe)}")
    print(f"Raw HTML saved to: {raw_path}")
    print(f"Parsed CSV saved to: {csv_path}")
    print()
    print(dataframe.head())


def main() -> None:
    """
    Run one Kalimati daily-price ingestion operation.
    """
    selected_date = datetime.now(NEPAL_TIMEZONE).date()

    with requests.Session() as session:
        csrf_token = get_csrf_token(session)

        populated_html = fetch_price_page(
            session=session,
            selected_date=selected_date,
            csrf_token=csrf_token,
        )

    dataframe = parse_price_table(
        html=populated_html,
        selected_date=selected_date,
    )

    save_results(
        html=populated_html,
        dataframe=dataframe,
        selected_date=selected_date,
    )


if __name__ == "__main__":
    main()