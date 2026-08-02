# Daily Kalimati price import

The `scripts/fetch_kalimati_prices.py` job fetches the selected Kalimati date,
translates only previously unseen commodity names with Gemini, and upserts the
snapshot into `public.kalimati_daily_prices`. Translations are permanently
cached in `public.kalimati_commodity_translations`, so repeated daily imports
do not spend another Gemini request for the same source name. It does not
create a local CSV. After every successful import, it deletes snapshots older
than the latest seven published Kalimati dates.

Before the first run:

1. Run `supabase_schema.sql` in the Supabase SQL editor.
2. Copy `.env.example` to `.env` and set `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, and `GEMINI_API_KEY`.
3. Run `python scripts/fetch_kalimati_prices.py` from this directory.

Check the Gemini key and configured model independently with:

```bash
python scripts/fetch_kalimati_prices.py --check-gemini
```

The importer fails instead of saving an untranslated or malformed result when
Gemini is unavailable or does not return an exact English translation map.

The GitHub Actions workflow runs at `18:15 UTC`, which is `12:00 AM` in Nepal
(Asia/Kathmandu), and can also be started manually from the Actions tab. Add
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GEMINI_API_KEY` as repository
secrets. `GEMINI_MODEL` can be set as a repository variable; otherwise the
script uses `gemini-3.6-flash`.

To import a specific published date locally:

```bash
python scripts/fetch_kalimati_prices.py --date 2026-07-31
```
