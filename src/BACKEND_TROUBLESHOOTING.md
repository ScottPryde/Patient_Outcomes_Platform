# 🔧 Backend Troubleshooting Guide

Common issues and their solutions when deploying the Care-PRO backend.

## 🚨 Common Issues

### 1. 401 Unauthorized Error on All Requests

**Symptoms:**
- Frontend shows "401 Unauthorized" errors
- Cannot sign up or sign in
- Health endpoint shows `serviceRoleKeyFormat: "Invalid format"`

**Causes:**
- `SUPABASE_SERVICE_ROLE_KEY` not set
- Wrong service role key
- Key is the anon key instead of service_role key

**Solution:**

1. **Get the correct service_role key:**
   - Go to: https://supabase.com/dashboard/project/yforafidhxehaecwkird/settings/api
   - Find "Project API keys" section
   - Copy the **service_role** key (NOT the anon/public key)
   - The key should start with `eyJ` (JWT format)

2. **Set the secret:**
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_key_here
   ```

3. **Verify it's set:**
   ```bash
   supabase secrets list
   ```

4. **Redeploy:**
   ```bash
   supabase functions deploy make-server
   ```

5. **Test the health endpoint:**
   ```bash
   curl https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/health
   ```

   Should show:
   ```json
   {
     "status": "healthy",
     "environment": {
       "hasServiceRoleKey": true,
       "serviceRoleKeyFormat": "JWT (valid)"
     }
   }
   ```

---

### 2. Function Not Found (404)

**Symptoms:**
- Requests to Edge Function return 404
- Frontend cannot connect to backend

**Causes:**
- Function not deployed
- Wrong function URL
- Function name mismatch

**Solution:**

1. **List deployed functions:**
   ```bash
   supabase functions list
   ```

2. **Deploy if missing:**
   ```bash
   supabase functions deploy make-server
   ```

3. **Verify the URL:**
   - Base URL: `https://yforafidhxehaecwkird.supabase.co`
   - Function path: `/functions/v1/make-server-e8005093/`
   - Full example: `https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/health`

---

### 3. CORS Errors in Browser

**Symptoms:**
- "CORS policy blocked" errors in browser console
- Frontend can't make requests to backend

**Causes:**
- CORS headers not properly set
- Wrong request format

**Solution:**

The backend already includes CORS headers. Ensure your frontend:

1. **Includes proper headers:**
   ```javascript
   const response = await fetch(url, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify(data)
   });
   ```

2. **Uses the correct Authorization header:**
   - For public endpoints (health, config): Use anon key
   - For authenticated endpoints: Use user's access_token

---

### 4. Database Not Seeding

**Symptoms:**
- No demo users created
- No questionnaires, trials, or education modules
- Empty data when loading the app

**Causes:**
- Service role key issue
- Auto-seeding failed
- Database initialization error

**Solution:**

1. **Check function logs:**
   ```bash
   supabase functions logs make-server --follow
   ```

2. **Manually trigger seeding:**
   ```bash
   curl -X POST https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/seed
   ```

3. **Verify seeding succeeded:**
   ```bash
   curl -X POST https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"patient@carepro.com","password":"CarePRO2024!"}'
   ```

   Should return user data and session token.

---

### 5. Cannot Sign In with Demo Credentials

**Symptoms:**
- "Invalid email or password" error
- Demo users don't exist

**Causes:**
- Database not seeded
- Wrong credentials

**Solution:**

1. **Verify correct credentials:**
   - Email: `patient@carepro.com`
   - Password: `CarePRO2024!` (case-sensitive, includes exclamation)

2. **Re-seed database:**
   ```bash
   curl -X POST https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/seed
   ```

3. **Check Supabase Auth dashboard:**
   - Go to: https://supabase.com/dashboard/project/yforafidhxehaecwkird/auth/users
   - Verify demo users exist

---

### 6. Edge Function Deployment Fails

**Symptoms:**
- `supabase functions deploy` command fails
- Build errors or TypeScript errors

**Causes:**
- Supabase CLI not installed correctly
- Not linked to project
- Network issues

**Solution:**

1. **Verify CLI installation:**
   ```bash
   supabase --version
   ```

2. **Re-link project:**
   ```bash
   supabase link --project-ref yforafidhxehaecwkird
   ```

3. **Check network connection:**
   - Ensure you can access supabase.com
   - Check firewall settings

4. **Try verbose deployment:**
   ```bash
   supabase functions deploy make-server --debug
   ```

---

### 7. Environment Variables Not Set

**Symptoms:**
- Health endpoint shows `hasSupabaseUrl: false` or `hasServiceRoleKey: false`
- Server logs show "NOT SET" for environment variables

**Causes:**
- Secrets not configured in Supabase dashboard
- Deployment before setting secrets

**Solution:**

1. **Set all three secrets:**
   ```bash
   supabase secrets set SUPABASE_URL=https://yforafidhxehaecwkird.supabase.co
   supabase secrets set SUPABASE_ANON_KEY=your_anon_key
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Verify secrets are set:**
   ```bash
   supabase secrets list
   ```

3. **Redeploy:**
   ```bash
   supabase functions deploy make-server
   ```

---

### 8. JWT Token Expired

**Symptoms:**
- "Token expired" errors
- User gets logged out unexpectedly

**Causes:**
- Session expired (default 1 hour)
- Refresh token not implemented

**Solution:**

The backend is configured correctly. Frontend should:

1. **Implement token refresh:**
   - Store refresh_token from sign-in response
   - Use Supabase client's built-in refresh mechanism

2. **Handle 401 errors:**
   - Redirect to login on 401
   - Clear stored tokens

---

### 9. Slow Response Times

**Symptoms:**
- API requests take several seconds
- Timeout errors

**Causes:**
- Cold start (Edge Function not used recently)
- Large data queries
- Network latency

**Solution:**

1. **Cold starts are normal:**
   - First request after inactivity may take 1-3 seconds
   - Subsequent requests are fast

2. **Implement loading states in frontend:**
   - Show loading indicators
   - Add timeout handling

3. **Optimize queries:**
   - Limit data returned
   - Use pagination for large datasets

---

### 10. Cannot Create New Users

**Symptoms:**
- Sign-up fails with validation errors
- "Email already in use" for new emails

**Causes:**
- Email confirmation required
- User already exists in Auth
- Service role key issue

**Solution:**

1. **Check existing users:**
   - Go to: https://supabase.com/dashboard/project/yforafidhxehaecwkird/auth/users
   - Delete test users if needed

2. **Verify signup endpoint:**
   ```bash
   curl -X POST https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "newuser@example.com",
       "password": "SecurePass123!",
       "firstName": "New",
       "lastName": "User",
       "role": "patient"
     }'
   ```

3. **Check response for detailed error:**
   - Review error message
   - Check function logs

---

## 🔍 Debugging Tools

### View Live Logs
```bash
supabase functions logs make-server --follow
```

### Test Health Endpoint
```bash
curl https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/health | jq
```

### List Secrets
```bash
supabase secrets list
```

### Check Project Status
```bash
supabase projects list
```

### View Function Details
```bash
supabase functions list
```

---

## 📊 Validation Checklist

Before reporting an issue, verify:

- [ ] Supabase CLI is installed and updated
- [ ] Project is linked: `supabase link --project-ref yforafidhxehaecwkird`
- [ ] All three secrets are set (URL, anon key, service_role key)
- [ ] Service role key is valid JWT (starts with `eyJ`)
- [ ] Function is deployed: `supabase functions deploy make-server`
- [ ] Health endpoint returns "healthy"
- [ ] Database is seeded (demo users exist)
- [ ] Function logs show no errors: `supabase functions logs make-server`

---

## 🆘 Still Having Issues?

1. **Check function logs:**
   ```bash
   supabase functions logs make-server --follow
   ```

2. **Verify all environment variables:**
   ```bash
   curl https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/health
   ```

3. **Test with curl first:**
   - Isolate whether issue is backend or frontend
   - Test each endpoint individually

4. **Review Supabase dashboard:**
   - Check Auth users
   - Review function logs
   - Verify API keys

5. **Redeploy from scratch:**
   ```bash
   supabase secrets set SUPABASE_URL=https://yforafidhxehaecwkird.supabase.co
   supabase secrets set SUPABASE_ANON_KEY=your_anon_key
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   supabase functions deploy make-server
   curl -X POST https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/seed
   ```

---

## ✅ Success Indicators

Your backend is working correctly when:

1. ✅ Health endpoint returns `"status": "healthy"`
2. ✅ All environment variables show as set
3. ✅ Service role key format is "JWT (valid)"
4. ✅ Can sign in with demo credentials
5. ✅ Seed endpoint succeeds
6. ✅ Function logs show no errors
7. ✅ Frontend can authenticate users
8. ✅ API requests return expected data
