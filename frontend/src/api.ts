/**
 * Anvaya Frontend API Client for communicating with backend Supabase endpoints.
 */

const API_BASE_URL = 'http://localhost:5001/api';

export interface UserSignupPayload {
  id?: string;
  email?: string;
  password?: string;
  name: string;
  role: 'Farmer' | 'Retailer' | 'Cooperative' | 'Transport Provider';
  phone: string;
  province?: string;
  district?: string;
  ward?: string;
  localLocation?: string;
  extraField1?: string;
  extraField2?: string;
  isNewSignup?: boolean;
}

export interface CreateProductPayload {
  farmer_id?: string;
  seller_name?: string;
  crop: string;
  district: string;
  local_location?: string;
  physical_storefront?: string;
  price_npr: number | string;
  quantity: number | string;
  unit?: string;
  grade?: string;
  harvest_date?: string;
  best_before?: string;
  pesticide_status?: string;
  badge?: string;
  description?: string;
}

/**
 * Register or update user profile in Supabase
 */
export async function registerUserInSupabase(payload: UserSignupPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API call to register user failed:', err);
    return null;
  }
}

/**
 * Log in user via Supabase / backend authentication fallback
 */
export async function loginUserInSupabase(email: string, password?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API call to login user failed:', err);
    return null;
  }
}

/**
 * Fetch user profile from Supabase by phone, email, or ID
 */
export async function fetchUserProfile(identifier: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/profile/${encodeURIComponent(identifier)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API call to fetch profile failed:', err);
    return null;
  }
}

/**
 * Fetch product listings from Supabase
 */
export async function fetchProductsFromSupabase(filter?: { district?: string; crop?: string }) {
  try {
    const params = new URLSearchParams();
    if (filter?.district) params.append('district', filter.district);
    if (filter?.crop) params.append('crop', filter.crop);

    const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    const data = await res.json();
    return data?.products || [];
  } catch (err) {
    console.warn('API call to fetch products failed:', err);
    return [];
  }
}

/**
 * Create a crop listing in Supabase
 */
export async function createProductInSupabase(payload: CreateProductPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API call to create product failed:', err);
    return null;
  }
}

/**
 * Fetch live market prices from Supabase
 */
export async function fetchMarketPricesFromSupabase() {
  try {
    const res = await fetch(`${API_BASE_URL}/market-prices`);
    const data = await res.json();
    return data?.prices || [];
  } catch (err) {
    console.warn('API call to fetch market prices failed:', err);
    return [];
  }
}
