// ============================================================================
// MANUAL CONFIGURATION (OPTIONAL)
// ============================================================================
// The Care-PRO platform will attempt to auto-discover Supabase configuration
// from the backend. If auto-discovery fails, you can manually configure here.
//
// HOW TO FIND YOUR VALUES:
// 1. Go to your Supabase project dashboard: https://app.supabase.com
// 2. Click on your project
// 3. Go to Settings > API
// 4. Copy the following values:
//    - Project URL → paste as supabaseUrl below
//    - Project API keys > anon public → paste as supabaseAnonKey below
//
// IMPORTANT: The anon key is safe to use in frontend code. It's designed
// to be public and is protected by Row Level Security (RLS) policies.
// ============================================================================

export const config = {
  // Replace these with your actual Supabase values if auto-discovery fails:
  supabaseUrl: 'https://yforafidhxehaecwkird.supabase.co',
  supabaseAnonKey: 'REPLACE_WITH_NEW_ANON_KEY',
};

// Default export for compatibility
export default config;