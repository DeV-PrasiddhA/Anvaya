# Nepal account map: production algorithm

## 1. Data model

Run the additions in `backend/supabase_schema.sql` in the Supabase SQL editor. Each account stores:

- `latitude`, `longitude`: the latest validated GPS coordinate.
- `location_accuracy_m`: device-reported accuracy in metres.
- `location_source`: `gps`, `manual`, `district_centroid`, or `admin`.
- `location_updated_at`: the server timestamp of the latest accepted coordinate.
- `show_on_map`: the account’s map visibility choice.

The database constraint rejects coordinates outside Nepal. The partial index keeps map queries fast as the user table grows.

## 2. Account creation flow

1. The signup wizard collects province, district, ward, and local area as human-readable profile data.
2. The user presses **Use my current location**. The browser asks for permission and returns latitude, longitude, and accuracy.
3. The frontend rejects a GPS fix outside Nepal before submitting the form.
4. `POST /api/users/signup` validates the pair again on the server and writes the account plus location metadata in one upsert.
5. The account is visible by default, with an explicit opt-out checkbox.
6. Google signup stores the same location payload in the pending OAuth profile so the location is not lost during the redirect.

An account without a valid coordinate is not invented on the map. It remains in the database and appears after the user completes a location update.

## 3. Nepal map read algorithm

`GET /api/map/locations`:

1. Select only `show_on_map = true` accounts with non-null coordinates.
2. Return only map-safe fields: account id, display name, role, administrative location, and location metadata.
3. Round latitude and longitude to three decimal places before returning them. This is approximately 100 metres of privacy resolution; exact coordinates remain server-side.
4. Set `isLive = true` only for a transport provider whose server timestamp is no older than ten minutes.
5. The Leaflet client limits panning to Nepal, starts at Nepal’s center, and refreshes the account list every 30 seconds.
6. Marker icons are selected from the database role: agriculture for Farmer, storefront for Retailer, and local shipping for Transport Provider.
7. If the API returns no locations, the UI shows an empty state. It never draws a sample route, simulated truck, sample ETA, or synthetic account.

## 4. Real transport GPS flow

The transport dashboard’s **Start GPS sharing** button starts `navigator.geolocation.watchPosition` on the provider’s foreground device.

For each position:

1. Reject coordinates outside Nepal.
2. Apply a 15-second client throttle to reduce battery, network, and database load.
3. Send `POST /api/map/location` with the Supabase access token, coordinates, and device accuracy.
4. The backend authenticates the token and takes the user id from the token; it never trusts a user id from the request body.
5. The backend validates Nepal bounds and accuracy, then updates the authenticated provider’s location and server timestamp.
6. The map marks that provider live for ten minutes after the last successful update. After ten minutes it remains visible at its last known base/last GPS location but is labelled stale.
7. Stopping GPS sharing clears the browser watch. A production mobile app should also stop the watch when the trip or dispatch ends.

For a dedicated fleet product, replace browser GPS with a native driver app or telematics device. Keep the same authenticated endpoint contract, but add a `vehicle_id` and a separate append-only `vehicle_location_events` table for history, replay, audit, and route analytics. Do not store every ping in `users` once fleet tracking is launched.

## 5. Production hardening checklist

- Run the schema migration before deploying the frontend or backend.
- Use HTTPS; browser geolocation is blocked on insecure production origins.
- Keep the Supabase service-role key backend-only.
- Restrict `CORS_ORIGINS` to the production frontend origin.
- Add authentication/rate limiting to map update endpoints at the edge or API gateway.
- Add a retention policy for raw GPS history when the vehicle event table is introduced.
- Keep public map coordinates rounded and do not return phone, email, exact address, or license plate data from the map endpoint.
- Use a managed tile provider or self-hosted tiles for sustained production traffic. OpenStreetMap data is free, but the public tile service has a usage policy and is not an unlimited commercial CDN.
- Add monitoring for GPS update failures, stale providers, database query latency, and tile/API errors.
