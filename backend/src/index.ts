import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS so the React frontend can request resources from this server
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
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
  const { name, role, phone, province, district, ward, localLocation, extraField1, extraField2 } = req.body;

  if (!name || !role || !phone) {
    return res.status(400).json({ error: 'Name, Role, and Phone are required.' });
  }

  try {
    // Upsert user by phone number
    const { data, error } = await supabase
      .from('users')
      .upsert({
        name,
        role,
        phone,
        province: province || 'Bagmati Province',
        district: district || 'Kathmandu',
        ward: ward || '1',
        local_location: localLocation || '',
        extra_field_1: extraField1 || '',
        extra_field_2: extraField2 || ''
      }, { onConflict: 'phone' })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'User profile registered successfully', user: data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process signup', details: err.message });
  }
});

/**
 * 2. FETCH USER PROFILE BY PHONE
 * Endpoint: GET /api/users/profile/:phone
 */
app.get('/api/users/profile/:phone', async (req: Request, res: Response) => {
  const { phone } = req.params;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
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
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .order('crop_name', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ prices: data });
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

