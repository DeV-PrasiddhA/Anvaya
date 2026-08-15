/**
 * Anvaya frontend API client for Supabase and backend endpoints.
 */

import { supabase } from './supabaseClient';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
// In production, VITE_API_BASE_URL must point to the deployed backend (e.g. https://api.anvayanepal.com)
const API_BASE_URL = (configuredApiBaseUrl || 'http://localhost:5001/api').replace(/\/$/, '');

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiRequest<T>(path: string, init?: RequestInit, accessToken?: string): Promise<T> {
  let token = accessToken;
  if (!token) {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new Error(
      `Cannot reach the Anvaya API at ${API_BASE_URL}. Set VITE_API_BASE_URL to the deployed API URL and allow this frontend origin in backend CORS_ORIGINS.`,
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed with status ${response.status}`, response.status);
  }

  return data as T;
}

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
  latitude?: number;
  longitude?: number;
  locationAccuracyM?: number;
  locationSource?: 'gps' | 'manual' | 'district_centroid' | 'admin';
  showOnMap?: boolean;
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

export interface MarketPrice {
  id: string;
  price_date: string;
  crop_name: string;
  crop_name_ne: string;
  price_npr: number;
  minimum_price_npr: number;
  maximum_price_npr: number;
  unit: string;
  market: string;
  source: string;
  previous_price_npr: number | null;
  change_amount_npr: number | null;
  change_percent: number | null;
  is_up: boolean | null;
}

/**
 * Register or update user profile in Supabase
 */
export async function registerUserInSupabase(payload: UserSignupPayload, accessToken?: string) {
  return apiRequest<{ message: string; user: UserProfileRecord }>('/users/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, accessToken);
}

/**
 * Log in user via Supabase / backend authentication fallback
 */
export async function loginUserInSupabase(email: string, password?: string) {
  return apiRequest<{ message: string; user: UserProfileRecord }>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export interface UserProfileRecord {
  id?: string;
  name: string;
  role: UserSignupPayload['role'];
  user_metadata?: { full_name?: string };
  phone?: string;
  email?: string;
  province?: string;
  district?: string;
  ward?: string;
  local_location?: string;
  latitude?: number;
  longitude?: number;
  location_accuracy_m?: number;
  location_source?: 'gps' | 'manual' | 'district_centroid' | 'admin';
  show_on_map?: boolean;
  location_updated_at?: string;
  extra_field_1?: string;
  extra_field_2?: string;
}

export type MapRole = 'Farmer' | 'Retailer' | 'Cooperative' | 'Transport Provider';

export interface MapLocation {
  id: string;
  name: string;
  role: MapRole;
  province?: string;
  district?: string;
  ward?: string;
  localLocation?: string;
  latitude: number;
  longitude: number;
  locationAccuracyM?: number | null;
  locationSource?: 'gps' | 'manual' | 'district_centroid' | 'admin' | null;
  locationUpdatedAt?: string | null;
  isLive: boolean;
}

export async function fetchMapLocations() {
  const response = await apiRequest<{ count: number; locations: MapLocation[]; map: { country: string } }>('/map/locations');
  return response;
}

export async function updateCurrentUserLocation(payload: {
  latitude: number;
  longitude: number;
  locationAccuracyM?: number;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Your session has expired. Please sign in again.');

  return apiRequest<{ location: UserProfileRecord }>('/map/location', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch the currently authenticated user's profile.
 */
export async function fetchUserProfile(identifier: string, accessToken?: string) {
  try {
    return await apiRequest<UserProfileRecord>(`/users/profile/${encodeURIComponent(identifier)}`, undefined, accessToken);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
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
    // Public market data is read directly from Supabase so the homepage does
    // not depend on the Express process being available.
    const { data, error } = await supabase
      .from('kalimati_daily_prices')
      .select('id, price_date, commodity_name_en, commodity_name_ne, average_price_npr, minimum_price_npr, maximum_price_npr, unit_en, unit_ne, market, source')
      .order('price_date', { ascending: false })
      .order('commodity_name_en', { ascending: true })
      .limit(500);

    if (error) throw error;
    if (!data?.length) return [];

    const latestDate = data[0].price_date;
    const publishedDates = [...new Set(data.map((row) => row.price_date))];
    const previousDate = publishedDates[1];
    const previousRows = previousDate
      ? data.filter((row) => row.price_date === previousDate)
      : [];

    return data
      .filter((row) => row.price_date === latestDate)
      .map((row): MarketPrice => {
        const previousRow = previousRows.find(
          (candidate) =>
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
          price_date: row.price_date,
          crop_name: row.commodity_name_en || row.commodity_name_ne,
          crop_name_ne: row.commodity_name_ne,
          price_npr: price,
          minimum_price_npr: Number(row.minimum_price_npr),
          maximum_price_npr: Number(row.maximum_price_npr),
          unit: row.unit_en || row.unit_ne,
          market: row.market,
          source: row.source,
          previous_price_npr: previousPrice,
          change_amount_npr: changeAmount,
          change_percent: changePercent,
          is_up: changeAmount === null ? null : changeAmount >= 0,
        };
      });
  } catch (err) {
    console.warn('API call to fetch market prices failed:', err);
    return [];
  }
}
