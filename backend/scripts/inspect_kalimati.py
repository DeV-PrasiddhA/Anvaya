from pathlib import Path

import requests


URL = "https://kalimatimarket.gov.np/price"


def main() -> None:
    response = requests.get(
        URL,
        timeout=30,
        headers={
            "User-Agent": (
                "Anvaya-Market-Research/0.1 "
                "(educational agricultural data project)"
            )
        },
    )

    response.raise_for_status()

    output_path = Path("data/raw/kalimati_price_page.html")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(response.text, encoding="utf-8")

    print(f"Status code: {response.status_code}")
    print(f"Content type: {response.headers.get('content-type')}")
    print(f"Downloaded bytes: {len(response.content)}")
    print(f"Saved HTML to: {output_path}")


if __name__ == "__main__":
    main()