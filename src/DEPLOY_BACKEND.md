# 🚀 Care-PRO Backend Deployment Guide

This guide will help you deploy the Care-PRO Supabase Edge Function backend to your Supabase project.

## 📋 Prerequisites

Before deploying, ensure you have:
1. ✅ A Supabase account at https://supabase.com
2. ✅ Your project URL: `https://yforafidhxehaecwkird.supabase.co`
3. ✅ Supabase CLI installed on your local machine

## 🔧 Step 1: Install Supabase CLI

### macOS / Linux
```bash
brew install supabase/tap/supabase
```

### Windows
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### npm (All platforms)
```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

## 🔑 Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication. After logging in, you'll receive an access token.

## 📁 Step 3: Link Your Project

From your project root directory (where this README is located):

```bash
supabase link --project-ref yforafidhxehaecwkird
```

You'll be prompted to enter your database password. This is the password you set when creating your Supabase project.

## 🔐 Step 4: Set Environment Secrets

The Edge Function needs three environment variables. Set them using the Supabase CLI:

```bash
# Get your keys from: https://supabase.com/dashboard/project/yforafidhxehaecwkird/settings/api

# Set SUPABASE_URL
supabase secrets set SUPABASE_URL=https://yforafidhxehaecwkird.supabase.co

# Set SUPABASE_ANON_KEY (find in Settings > API > Project API keys > anon public)
supabase secrets set SUPABASE_ANON_KEY=your_anon_key_here

# Set SUPABASE_SERVICE_ROLE_KEY (find in Settings > API > Project API keys > service_role)
# ⚠️ IMPORTANT: This is a secret key - never commit it to version control!
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Where to Find Your Keys:
1. Go to: https://supabase.com/dashboard/project/yforafidhxehaecwkird/settings/api
2. **Project URL**: Copy the URL (should be `https://yforafidhxehaecwkird.supabase.co`)
3. **anon public**: Copy this key for `SUPABASE_ANON_KEY`
4. **service_role**: Copy this key for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## 🚀 Step 5: Deploy the Edge Function

Deploy the `make-server` function to Supabase:

```bash
supabase functions deploy make-server
```

The CLI will:
- Bundle your TypeScript code
- Upload it to Supabase
- Make it available at: `https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/`

## ✅ Step 6: Verify Deployment

Test the health endpoint:

```bash
curl https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-16T...",
  "environment": {
    "hasSupabaseUrl": true,
    "hasSupabaseAnonKey": true,
    "hasServiceRoleKey": true,
    "serviceRoleKeyFormat": "JWT (valid)"
  }
}
```

## 🌱 Step 7: Seed the Database

Trigger the database seeding endpoint to create demo users and sample data:

```bash
curl -X POST https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/seed
```

Expected response:
```json
{
  "success": true,
  "message": "Database seeded successfully"
}
```

**Note**: The database will also auto-seed on first run, but you can use this endpoint to manually trigger seeding if needed.

## 🧪 Step 8: Test Authentication

Test user signup:

```bash
curl -X POST https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "patient"
  }'
```

Test user signin with demo credentials:

```bash
curl -X POST https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@carepro.com",
    "password": "CarePRO2024!"
  }'
```

## 👥 Demo User Credentials

After seeding, these demo accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@carepro.com | CarePRO2024! |
| Caregiver | caregiver@carepro.com | CarePRO2024! |
| Clinician | clinician@carepro.com | CarePRO2024! |
| Researcher | researcher@carepro.com | CarePRO2024! |
| Administrator | admin@carepro.com | CarePRO2024! |

## 📊 Available API Endpoints

Once deployed, your backend provides 40+ API endpoints:

### Authentication
- `POST /make-server-e8005093/auth/signup` - Create new user account
- `POST /make-server-e8005093/auth/signin` - Sign in existing user
- `POST /make-server-e8005093/auth/signout` - Sign out user
- `GET /make-server-e8005093/auth/session` - Check session status

### User Profile
- `GET /make-server-e8005093/user/profile` - Get user profile
- `PUT /make-server-e8005093/user/profile` - Update user profile

### Tags & Interests
- `GET /make-server-e8005093/tags` - Get all tags
- `POST /make-server-e8005093/tags` - Create new tag (admin only)
- `GET /make-server-e8005093/user/interests` - Get user interests
- `POST /make-server-e8005093/user/interests` - Add interest
- `DELETE /make-server-e8005093/user/interests/:tagId` - Remove interest

### Questionnaires
- `GET /make-server-e8005093/questionnaires` - Get available questionnaires
- `GET /make-server-e8005093/questionnaires/:id` - Get specific questionnaire
- `POST /make-server-e8005093/questionnaires` - Create questionnaire (admin/clinician/researcher)

### Responses
- `GET /make-server-e8005093/responses` - Get user responses
- `POST /make-server-e8005093/responses` - Submit questionnaire response

### Clinical Trials
- `GET /make-server-e8005093/trials` - Get all trials
- `GET /make-server-e8005093/trials/:id` - Get trial details
- `POST /make-server-e8005093/trials/:id/follow` - Follow a trial
- `DELETE /make-server-e8005093/trials/:id/follow` - Unfollow trial

### Education
- `GET /make-server-e8005093/education` - Get education modules
- `GET /make-server-e8005093/education/:id` - Get module details
- `POST /make-server-e8005093/education/:id/complete` - Complete module
- `GET /make-server-e8005093/user/progress` - Get learning progress

### Consent Management
- `GET /make-server-e8005093/consents` - Get consent templates
- `GET /make-server-e8005093/user/consents` - Get user consents
- `POST /make-server-e8005093/user/consents` - Record consent decision

### Caregiver Linking
- `GET /make-server-e8005093/caregiver/links` - Get caregiver links
- `POST /make-server-e8005093/caregiver/request` - Request caregiver access
- `PUT /make-server-e8005093/caregiver/links/:id` - Update link status

### Notifications
- `GET /make-server-e8005093/notifications` - Get user notifications
- `POST /make-server-e8005093/notifications` - Create notification
- `PUT /make-server-e8005093/notifications/:id/read` - Mark as read

### Analytics
- `GET /make-server-e8005093/analytics/metrics` - Get user metrics

## 🔍 Troubleshooting

### Issue: 401 Unauthorized Error

**Cause**: `SUPABASE_SERVICE_ROLE_KEY` is not set or invalid.

**Solution**:
1. Verify the service_role key from: https://supabase.com/dashboard/project/yforafidhxehaecwkird/settings/api
2. The key should start with `eyJ` (it's a JWT token)
3. Re-set the secret:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_correct_service_role_key
   ```
4. Redeploy the function:
   ```bash
   supabase functions deploy make-server
   ```

### Issue: Function Not Found (404)

**Cause**: Function not deployed or wrong URL.

**Solution**:
1. Ensure function is deployed:
   ```bash
   supabase functions list
   ```
2. Verify the URL matches your project:
   ```
   https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/
   ```

### Issue: CORS Errors

**Cause**: Frontend making requests without proper headers.

**Solution**: The backend already includes CORS headers. Ensure your frontend includes the Authorization header with the anon key.

### Issue: Database Not Seeding

**Cause**: Service role key issues or database connection problems.

**Solution**:
1. Check function logs:
   ```bash
   supabase functions logs make-server
   ```
2. Manually trigger seeding:
   ```bash
   curl -X POST https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/seed
   ```

## 📝 View Function Logs

To debug issues, view the function logs:

```bash
supabase functions logs make-server --follow
```

This will stream live logs from your Edge Function.

## 🔄 Updating the Function

When you make changes to the backend code:

```bash
supabase functions deploy make-server
```

This will redeploy the function with your latest changes.

## 🎯 Next Steps

After successful deployment:

1. ✅ Test the frontend application at your app URL
2. ✅ Sign in using demo credentials
3. ✅ Explore all features:
   - Dashboard with metrics
   - Questionnaire system
   - Clinical trials discovery
   - Education hub with gamification
   - Consent management
   - Caregiver linking
   - Tag-based interests
   - Notifications

## 🆘 Need Help?

If you encounter issues:

1. **Check Logs**: `supabase functions logs make-server --follow`
2. **Test Health Endpoint**: Verify all environment variables are set
3. **Verify Secrets**: Ensure all three secrets are correctly set
4. **Check API Keys**: Confirm keys from Supabase dashboard are correct
5. **Review Network**: Ensure your firewall allows HTTPS requests

## 🎉 Success!

Your Care-PRO backend is now deployed and ready to use! The platform includes:
- ✅ Multi-role authentication (Patient, Caregiver, Clinician, Researcher, Admin)
- ✅ Comprehensive questionnaire system
- ✅ Clinical trials discovery and tracking
- ✅ Education hub with gamification
- ✅ Consent management with versioning
- ✅ Caregiver linking and access control
- ✅ Tag-based interests and notifications
- ✅ Analytics and progress tracking
- ✅ 40+ production-ready API endpoints
