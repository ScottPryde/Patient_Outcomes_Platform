import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Singleton Supabase client
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

// Session token storage
let sessionToken: string | null = null;

// Get Supabase configuration from window globals
export function getSupabaseConfig() {
  if (typeof window === 'undefined') {
    return { url: '', key: '' };
  }
  
  const url = (window as any).__SUPABASE_URL__ || '';
  const key = (window as any).__SUPABASE_ANON_KEY__ || '';
  
  return { url, key };
}

// Create or get the singleton Supabase client
export function createClient() {
  if (supabaseClient) {
    return supabaseClient;
  }
  
  const { url, key } = getSupabaseConfig();
  
  if (!url || !key) {
    console.error('Supabase not configured. URL and Key must be set.');
    throw new Error('Supabase not configured');
  }
  
  supabaseClient = createSupabaseClient(url, key);
  return supabaseClient;
}

// Get the base API URL for backend requests
export function getBackendUrl() {
  const { url } = getSupabaseConfig();
  
  if (url) {
    // Extract project ID from Supabase URL
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      return `https://${match[1]}.supabase.co/functions/v1/make-server-e8005093`;
    }
  }
  
  // Fallback: try relative path
  return '/functions/v1/make-server-e8005093';
}

// Session token management
export function setSessionToken(token: string | null) {
  sessionToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('care-pro-session-token', token);
    } else {
      localStorage.removeItem('care-pro-session-token');
    }
  }
}

export function getSessionToken(): string | null {
  if (!sessionToken && typeof window !== 'undefined') {
    sessionToken = localStorage.getItem('care-pro-session-token');
  }
  return sessionToken;
}

// API request helper
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}${endpoint}`;

  // Always send an Authorization header:
  // - If a user session exists, use the user's access token
  // - Otherwise, fall back to the Supabase anon key so that
  //   public endpoints (signup, health, config, etc.) can be called
  //   even before login. The Supabase Edge Function gateway now
  //   requires some Bearer token on all requests.
  const { key: anonKey } = getSupabaseConfig();
  const sessionToken = getSessionToken();
  const authToken = sessionToken || anonKey || null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }
  
  return response.json();
}
