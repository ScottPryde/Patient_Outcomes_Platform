# ⚡ Quick Deploy Guide - 5 Minutes

Get your Care-PRO backend running in 5 simple steps!

## 🚀 Steps

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login
```bash
supabase login
```

### 3. Link Project
```bash
supabase link --project-ref yforafidhxehaecwkird
```

### 4. Set Secrets

Go to https://supabase.com/dashboard/project/yforafidhxehaecwkird/settings/api

Copy your keys and run:

```bash
# Copy URL from dashboard
supabase secrets set SUPABASE_URL=https://yforafidhxehaecwkird.supabase.co

# Copy "anon public" key from dashboard
supabase secrets set SUPABASE_ANON_KEY=your_anon_key_here

# Copy "service_role" key from dashboard (⚠️ Keep secret!)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 5. Deploy
```bash
supabase functions deploy make-server
```

## ✅ Verify

```bash
curl https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/health
```

Should return:
```json
{
  "status": "healthy",
  "environment": {
    "hasSupabaseUrl": true,
    "hasSupabaseAnonKey": true,
    "hasServiceRoleKey": true,
    "serviceRoleKeyFormat": "JWT (valid)"
  }
}
```

## 🎉 Done!

Your backend is live! Login credentials:
- Email: `patient@carepro.com`
- Password: `CarePRO2024!`

See [DEPLOY_BACKEND.md](/DEPLOY_BACKEND.md) for detailed documentation.
