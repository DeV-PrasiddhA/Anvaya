import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const defaultCorsOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
const corsOrigins = (process.env.CORS_ORIGINS || defaultCorsOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
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

// Track start time for uptime calculation
const startTime = new Date();

// Root welcome endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the Anvaya Express API!',
    availableEndpoints: [
      'GET /api/status - Server health & Supabase connection check',
      'GET /api/hello - Sample endpoint',
      'GET /api/db/:tableName - Query any Supabase table (e.g., /api/db/users)'
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
    process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'https://your-project.supabase.co'
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

// Example Supabase Query Endpoint: Fetch items from any table dynamically
app.get('/api/db/:table', async (req: Request, res: Response) => {
  const { table } = req.params;
  const limit = Number(req.query.limit) || 10;

  try {
    const { data, error } = await supabase.from(table).select('*').limit(limit);

    if (error) {
      return res.status(400).json({ error: error.message, details: error });
    }

    res.json({ table, count: data ? data.length : 0, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// ================================================================
// ANVAYA SPECIFIC SUPABASE API ROUTES
// ================================================================

/**
 * 1. USER SIGNUP / PROFILE CREATION
 * Endpoint: POST /api/users/signup
 */
app.post('/api/users/signup', async (req: Request, res: Response) => {
  const { id, email, password, name, role, phone, province, district, ward, localLocation, extraField1, extraField2, isNewSignup } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Name and Role are required.' });
  }
  if (role === 'Cooperative') {
    return res.status(403).json({ error: 'Cooperative accounts are coming soon and are not available yet.' });
  }
  if (!id && (!email || !password)) {
    return res.status(400).json({ error: 'Email and password are required for a new account.' });
  }

  try {
    // Check if user already exists when creating a new account
    if (isNewSignup && (email || phone)) {
      let checkQuery = supabase.from('users').select('id, email, phone');
      if (id) {
        checkQuery = checkQuery.neq('id', id);
      }
      if (email && phone) {
        checkQuery = checkQuery.or(`email.eq.${email},phone.eq.${phone}`);
      } else if (email) {
        checkQuery = checkQuery.eq('email', email);
      } else if (phone) {
        checkQuery = checkQuery.eq('phone', phone);
      }

      const { data: existingProfiles, error: existingProfilesError } = await checkQuery;
      if (existingProfilesError) {
        return res.status(500).json({ error: 'Could not check whether the account already exists.' });
      }
      if (existingProfiles && existingProfiles.length > 0) {
        return res.status(400).json({
          error: 'An account with this email address or phone number already exists. Please switch to the Log In tab to access your account.'
        });
      }
    }

    let authUserId = id;
    let createdAuthUser = false;

    // Supabase Auth owns credentials. The public.users table stores only the profile.
    if (email && password) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: { full_name: name.trim() },
      });

      if (authError || !authData.user) {
        const duplicate = authError?.message?.toLowerCase().includes('already registered');
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
      extra_field_1: extraField1 || req.body.extra_field_1 || req.body.extraField1 || '',
      extra_field_2: extraField2 || req.body.extra_field_2 || req.body.extraField2 || '',
      ...(email ? { email: email.trim().toLowerCase() } : {}),
      ...(phone ? { phone: phone.trim() } : {}),
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
 * 2. USER DIRECT LOGIN (BACKEND AUTH FALLBACK)
 * Endpoint: POST /api/users/login
 */
app.post('/api/users/login', async (req: Request, res: Response) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

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
 * 2. FETCH USER PROFILE BY PHONE, ID, OR EMAIL
 * Endpoint: GET /api/users/profile/:identifier
 */
app.get('/api/users/profile/:identifier', async (req: Request, res: Response) => {
  const { identifier } = req.params;

  try {
    const isEmail = identifier.includes('@');
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(identifier);

    let query = supabase.from('users').select('*');
    if (isUuid) {
      query = query.eq('id', identifier);
    } else if (isEmail) {
      query = query.eq('email', identifier);
    } else {
      query = query.eq('phone', identifier);
    }

    const { data, error } = await query.single();

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
