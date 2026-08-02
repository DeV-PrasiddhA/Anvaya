/**
 * Anvaya frontend API client for Supabase and backend endpoints.
 */

import { supabase } from './supabaseClient';

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
