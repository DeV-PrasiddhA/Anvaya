import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase, supabaseConfigurationError } from './supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production' || process.env.APP_ENVIRONMENT === 'production';
const defaultCorsOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
const configuredCorsOrigins = process.env.CORS_ORIGINS?.trim();
if (isProduction && !configuredCorsOrigins) {
  throw new Error('CORS_ORIGINS must contain the production frontend origin.');
}
const corsOrigins = (configuredCorsOrigins || defaultCorsOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Enable CORS so the React frontend can request resources from this server
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const NEPAL_BOUNDS = {
  minLatitude: 26.347,
  maxLatitude: 30.447,
  minLongitude: 80.058,
  maxLongitude: 88.201,
};

type LocationSource = 'gps' | 'manual' | 'district_centroid' | 'admin';
const LOCATION_SOURCES: LocationSource[] = ['gps', 'manual', 'district_centroid', 'admin'];
const USER_ROLES = ['Farmer', 'Retailer', 'Cooperative', 'Transport Provider'] as const;

function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateNepalCoordinates(latitude: number | null, longitude: number | null) {
  if (latitude === null && longitude === null) return null;
  if (latitude === null || longitude === null) return 'Both latitude and longitude are required.';
  if (
    latitude < NEPAL_BOUNDS.minLatitude ||
    latitude > NEPAL_BOUNDS.maxLatitude ||
    longitude < NEPAL_BOUNDS.minLongitude ||
    longitude > NEPAL_BOUNDS.maxLongitude
  ) {
    return 'The selected location must be inside Nepal.';
  }
  return null;
}

function roundedCoordinate(value: number) {
  return Number(value.toFixed(3));
}

async function authenticatedUserId(req: Request) {
  const authorization = req.header('authorization') || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';

  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

function requireServerConfiguration(res: Response) {
  if (!supabaseConfigurationError) return true;
  res.status(503).json({ error: 'Authentication service is not configured.' });
  return false;
}

// Track start time for uptime calculation
const startTime = new Date();

// Root welcome endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the Anvaya Express API!',
    availableEndpoints: [
      'GET /api/status - Server health & Supabase connection check',
      'GET /api/hello - Sample endpoint',
      'GET /api/market-prices - Live market prices'
    ]
  });
});

// Health/Status API Endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const uptimeMs = Date.now() - startTime.getTime();
  const seconds = Math.floor((uptimeMs / 1000) % 60);
  const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
  const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

  let uptimeString = '';
  if (days > 0) uptimeString += `${days}d `;
  if (hours > 0) uptimeString += `${hours}h `;
  if (minutes > 0) uptimeString += `${minutes}m `;
  uptimeString += `${seconds}s`;

  const supabaseConfigured = Boolean(
    !supabaseConfigurationError
  );

  res.json({
    status: 'online',
    message: 'Express server is active and connected to Anvaya client!',
    database: {
      provider: 'Supabase',
      configured: supabaseConfigured
    },
    uptime: uptimeString,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Hello World example endpoint
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the Node.js backend!' });
});

// ================================================================
// ANVAYA SPECIFIC SUPABASE API ROUTES
// ================================================================

/**
 * 1. USER SIGNUP / PROFILE CREATION
 * Endpoint: POST /api/users/signup
 */
app.post('/api/users/signup', async (req: Request, res: Response) => {
  const {
    id,
    email,
    password,
    name,
    role,
    phone,
    province,
    district,
    ward,
    localLocation,
    latitude: rawLatitude,
    longitude: rawLongitude,
    locationAccuracyM: rawLocationAccuracyM,
    locationSource,
    showOnMap,
    extraField1,
    extraField2,
    isNewSignup,
  } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
  const latitude = parseCoordinate(rawLatitude);
  const longitude = parseCoordinate(rawLongitude);
  const locationAccuracyM = parseCoordinate(rawLocationAccuracyM);
  const locationError = validateNepalCoordinates(latitude, longitude);
  const normalizedLocationSource = locationSource || 'gps';

  if (!requireServerConfiguration(res)) return;
  if (typeof name !== 'string' || !name.trim() || typeof role !== 'string') {
    return res.status(400).json({ error: 'Name and Role are required.' });
  }
  if (!USER_ROLES.includes(role as typeof USER_ROLES[number])) {
    return res.status(400).json({ error: 'The selected role is invalid.' });
  }
  if (name.trim().length > 160) {
    return res.status(400).json({ error: 'Name is too long.' });
  }
  if (normalizedEmail && !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (normalizedPhone && !/^\d{10}$/.test(normalizedPhone)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }
  if (locationError) {
    return res.status(400).json({ error: locationError });
  }
  if (locationAccuracyM !== null && (locationAccuracyM < 0 || locationAccuracyM > 100000)) {
    return res.status(400).json({ error: 'Location accuracy is invalid.' });
  }
  if (latitude !== null && !LOCATION_SOURCES.includes(normalizedLocationSource as LocationSource)) {
    return res.status(400).json({ error: 'Location source is invalid.' });
  }
  if (role === 'Cooperative') {
    return res.status(403).json({ error: 'Cooperative accounts are coming soon and are not available yet.' });
  }
  if (!id && (!normalizedEmail || typeof password !== 'string' || !password)) {
    return res.status(400).json({ error: 'Email and password are required for a new account.' });
  }
  if (!id && typeof password === 'string' && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (id) {
    const authenticatedId = await authenticatedUserId(req);
    if (!authenticatedId) {
      return res.status(401).json({ error: 'A valid Supabase session is required to complete this signup.' });
    }
    if (authenticatedId !== id) {
      return res.status(403).json({ error: 'You can only update your own user profile.' });
    }
    if (password) {
      return res.status(400).json({ error: 'Do not send a password when completing an existing OAuth signup.' });
    }
  }

  try {
    // Check if user already exists when creating a new account
    if (isNewSignup && (normalizedEmail || normalizedPhone)) {
      const duplicateChecks = [];
      if (normalizedEmail) {
        let emailQuery = supabase.from('users').select('id').eq('email', normalizedEmail);
        if (id) emailQuery = emailQuery.neq('id', id);
        duplicateChecks.push(emailQuery);
      }
      if (normalizedPhone) {
        let phoneQuery = supabase.from('users').select('id').eq('phone', normalizedPhone);
        if (id) phoneQuery = phoneQuery.neq('id', id);
        duplicateChecks.push(phoneQuery);
      }

      const duplicateResults = await Promise.all(duplicateChecks);
      if (duplicateResults.some(({ error }) => error)) {
        return res.status(500).json({ error: 'Could not check whether the account already exists.' });
      }
      if (duplicateResults.some(({ data }) => Boolean(data?.length))) {
        return res.status(400).json({
          error: 'An account with this email address or phone number already exists. Please switch to the Log In tab to access your account.'
        });
      }
    }

    let authUserId = id;
    let createdAuthUser = false;

    // Supabase Auth owns credentials. The public.users table stores only the profile.
    if (normalizedEmail && password) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: name.trim() },
      });

      if (authError || !authData.user) {
        const authMessage = authError?.message?.toLowerCase() || '';
        const duplicate = authMessage.includes('already registered') || authMessage.includes('already exists');
        return res.status(duplicate ? 409 : 400).json({
          error: duplicate
            ? 'An account with this email address already exists. Please switch to the Log In tab.'
            : authError?.message || 'Could not create the authentication account.',
        });
      }

      authUserId = authData.user.id;
      createdAuthUser = true;
    }

    if (!authUserId) {
      return res.status(400).json({ error: 'A valid authenticated user is required.' });
    }

    const userPayload = {
      id: authUserId,
      name: name.trim(),
      role,
      province: province || req.body.province || 'Bagmati Province',
      district: district || req.body.district || 'Kathmandu',
      ward: ward || req.body.ward || '1',
      local_location: localLocation || req.body.local_location || req.body.localLocation || '',
      latitude,
      longitude,
      location_accuracy_m: locationAccuracyM,
      location_source: latitude !== null && longitude !== null
        ? normalizedLocationSource as LocationSource
        : null,
      show_on_map: showOnMap !== false,
      location_updated_at: latitude !== null && longitude !== null ? new Date().toISOString() : null,
      extra_field_1: extraField1 || req.body.extra_field_1 || req.body.extraField1 || '',
      extra_field_2: extraField2 || req.body.extra_field_2 || req.body.extraField2 || '',
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      ...(normalizedPhone ? { phone: normalizedPhone } : {}),
    };

    const { data: resultData, error: resultError } = await supabase
      .from('users')
      .upsert(userPayload, { onConflict: 'id' })
      .select()
      .single();

    if (resultError) {
      if (createdAuthUser) {
        await supabase.auth.admin.deleteUser(authUserId);
      }
      return res.status(400).json({ error: resultError.message });
    }

    res.status(201).json({ message: 'User profile registered successfully', user: resultData });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process signup', details: err.message });
  }
});

/**
 * 2. ACCOUNT LOCATIONS FOR THE NEPAL MAP
 * Only map-enabled accounts with a valid Nepal coordinate are returned.
 * Coordinates are rounded before leaving the API so exact residences are
 * not exposed to every map visitor.
 */
app.get('/api/map/locations', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, role, province, district, ward, latitude, longitude, location_accuracy_m, location_source, location_updated_at')
      .eq('show_on_map', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Could not load account locations.', details: error.message });
    }

    const locations = (data || []).map((row: any) => {
      const locationUpdatedAt = row.location_updated_at || null;
      const isLive = row.role === 'Transport Provider' && locationUpdatedAt
        ? Date.now() - new Date(locationUpdatedAt).getTime() <= 10 * 60 * 1000
        : false;

      return {
        id: row.id,
        name: row.name,
        role: row.role,
        province: row.province,
        district: row.district,
        ward: row.ward,
        latitude: roundedCoordinate(Number(row.latitude)),
        longitude: roundedCoordinate(Number(row.longitude)),
        locationAccuracyM: row.location_accuracy_m,
        locationSource: row.location_source,
        locationUpdatedAt,
        isLive,
      };
    });

    return res.json({
      count: locations.length,
      locations,
      map: {
        country: 'Nepal',
        bounds: [
          [NEPAL_BOUNDS.minLatitude, NEPAL_BOUNDS.minLongitude],
          [NEPAL_BOUNDS.maxLatitude, NEPAL_BOUNDS.maxLongitude],
        ],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load account locations.', details: err.message });
  }
});

/**
 * 3. AUTHENTICATED LOCATION UPDATE
 * Transport apps can call this from a foreground GPS watcher. The user id is
 * taken from the Supabase access token, never from the request body.
 */
app.post('/api/map/location', async (req: Request, res: Response) => {
  const userId = await authenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'A valid Supabase session is required.' });
  }

  const latitude = parseCoordinate(req.body.latitude);
  const longitude = parseCoordinate(req.body.longitude);
  const accuracyM = parseCoordinate(req.body.locationAccuracyM);
  const locationError = validateNepalCoordinates(latitude, longitude);
  const locationSource = req.body.locationSource || 'gps';

  if (locationError) return res.status(400).json({ error: locationError });
  if (accuracyM !== null && (accuracyM < 0 || accuracyM > 100000)) {
    return res.status(400).json({ error: 'Location accuracy is invalid.' });
  }
  if (!LOCATION_SOURCES.includes(locationSource as LocationSource)) {
    return res.status(400).json({ error: 'Location source is invalid.' });
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      latitude,
      longitude,
      location_accuracy_m: accuracyM,
      location_source: locationSource as LocationSource,
      location_updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('id, role, latitude, longitude, location_accuracy_m, location_source, location_updated_at')
    .single();

  if (error || !data) {
    return res.status(400).json({ error: error?.message || 'Could not update your location.' });
  }

  return res.json({ location: data });
});

/**
 * 4. USER DIRECT LOGIN (BACKEND AUTH FALLBACK)
 * Endpoint: POST /api/users/login
 */
app.post('/api/users/login', async (req: Request, res: Response) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (!requireServerConfiguration(res)) return;

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.user) {
      return res.status(401).json({ error: 'Invalid login credentials. Please check your email and password.' });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Login succeeded, but the user profile could not be loaded.' });
    }

    if (userProfile?.role === 'Cooperative') {
      return res.status(403).json({ error: 'Cooperative accounts are coming soon and are not available yet.' });
    }

    return res.json({
      message: 'Login successful',
      user: userProfile || {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.full_name || email.split('@')[0],
        role: 'Farmer',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Login server error', details: err.message });
  }
});

/**
 * 2. FETCH THE AUTHENTICATED USER PROFILE
 * Endpoint: GET /api/users/profile/:identifier
 */
app.get('/api/users/profile/:identifier', async (req: Request, res: Response) => {
  const { identifier } = req.params;
  const authenticatedId = await authenticatedUserId(req);

  if (!authenticatedId) {
    return res.status(401).json({ error: 'A valid Supabase session is required.' });
  }

  try {
    if (identifier !== authenticatedId) {
      return res.status(403).json({ error: 'You can only access your own user profile.' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authenticatedId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

/**
 * 3. GET PRODUCT LISTINGS
 * Endpoint: GET /api/products
 */
app.get('/api/products', async (req: Request, res: Response) => {
  const { district, crop } = req.query;

  try {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });

    if (district) {
      query = query.eq('district', String(district));
    }
    if (crop) {
      query = query.ilike('crop', `%${String(crop)}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ count: data ? data.length : 0, products: data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch product listings' });
  }
});

/**
 * 4. CREATE NEW CROP LISTING
 * Endpoint: POST /api/products
 */
app.post('/api/products', async (req: Request, res: Response) => {
  const {
    farmer_id,
    seller_name,
    crop,
    district,
    local_location,
    physical_storefront,
    price_npr,
    quantity,
    unit,
    grade,
    harvest_date,
    best_before,
    pesticide_status,
    badge,
    description
  } = req.body;

  if (!crop || !price_npr || !quantity) {
    return res.status(400).json({ error: 'Crop, Price (NPR), and Quantity are required.' });
  }

  const qrCodeData = `ANV-${crop.toUpperCase().substring(0, 4)}-${Date.now()}`;

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        farmer_id: farmer_id || null,
        seller_name: seller_name || 'Farmer',
        crop,
        district: district || 'Kathmandu',
        local_location: local_location || '',
        physical_storefront: physical_storefront || '',
        price_npr: Number(price_npr),
        quantity: Number(quantity),
        unit: unit || 'kg',
        grade: grade || 'A',
        harvest_date: harvest_date || null,
        best_before: best_before || null,
        pesticide_status: pesticide_status || '0% Synthetic Pesticides',
        badge: badge || 'Organic Verified',
        qr_code_data: qrCodeData,
        description: description || ''
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Crop listing created successfully', product: data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create product listing' });
  }
});

/**
 * 5. GET LIVE MARKET PRICES
 * Endpoint: GET /api/market-prices
 */
app.get('/api/market-prices', async (req: Request, res: Response) => {
  try {
    const { data: rows, error } = await supabase
      .from('kalimati_daily_prices')
      .select('*')
      .order('price_date', { ascending: false })
      .order('commodity_name_en', { ascending: true })
      .limit(1000);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    if (!rows?.length) {
      return res.json({ prices: [] });
    }

    const publishedDates = [...new Set(rows.map((row: any) => row.price_date))];
    const latestDate = publishedDates[0];
    const previousDate = publishedDates[1];
    const previousRows = rows.filter((row: any) => row.price_date === previousDate);

    const prices = rows
      .filter((row: any) => row.price_date === latestDate)
      .map((row: any) => {
        const previousRow = previousRows.find(
          (candidate: any) =>
            candidate.commodity_name_ne === row.commodity_name_ne &&
            candidate.unit_ne === row.unit_ne,
        );
        const price = Number(row.average_price_npr);
        const previousPrice = previousRow ? Number(previousRow.average_price_npr) : null;
        const changeAmount = previousPrice === null ? null : price - previousPrice;
        const changePercent = previousPrice === null || previousPrice === 0
          ? null
          : ((price - previousPrice) / previousPrice) * 100;

        return {
      id: row.id,
      crop_name: row.commodity_name_en || row.commodity_name_ne,
      crop_name_ne: row.commodity_name_ne,
      hub_name: row.market,
      price_npr: price,
      minimum_price_npr: Number(row.minimum_price_npr),
      maximum_price_npr: Number(row.maximum_price_npr),
      unit: row.unit_en || row.unit_ne,
      price_date: row.price_date,
      source: row.source,
          previous_price_npr: previousPrice,
          change_amount_npr: changeAmount,
          change_percent: changePercent,
          is_up: changeAmount === null ? null : changeAmount >= 0,
        };
      });

    res.json({ prices });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch market prices' });
  }
});

// Default fallback route
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
