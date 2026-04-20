# 🔍 Troubleshooting 401 Error (When Key IS Set)

## You're Here Because...

You've set the `SUPABASE_SERVICE_ROLE_KEY` correctly in Supabase, but you're **still** getting 401 errors when trying to register or login.

---

## Quick Checklist (Try These First)

### ✅ Step 1: Verify the Edge Function is Deployed

**Problem:** The Edge Function might not be deployed at all, or deployment failed.

**Check:**
1. Go to: https://app.supabase.com/project/yforafidhxehaecwkird/functions
2. Look for a function named `server` or `make-server-e8005093`
3. Check its status - it should say "Active" or "Deployed"

**Fix:**
- If no function exists, you need to deploy it first
- If it shows "Error" or "Failed", click **Deploy** to redeploy
- If you see a function but it's old, click **Deploy** to update it

---

### ✅ Step 2: Redeploy After Setting Secret

**Problem:** Secrets are only loaded when the Edge Function starts. If you just set the secret, the running function doesn't know about it yet.

**Fix:**
1. Go to Edge Functions → `server`
2. Click the **"Deploy"** button (NOT "Redeploy")
3. Wait 30-60 seconds for deployment to complete
4. Test again

⚠️ **IMPORTANT:** Setting a secret does NOT automatically restart the function. You MUST click Deploy.

---

### ✅ Step 3: Check Edge Function Logs

**This is the most important step!** The logs will tell you exactly what's wrong.

**How to Check Logs:**
1. Go to: https://app.supabase.com/project/yforafidhxehaecwkird/functions/server/logs
2. Look for recent log entries (last 5 minutes)
3. Look for these specific messages:

**Good signs (Everything working):**
```
=== Server Starting ===
SUPABASE_URL: https://yforafidhxehaecwkird.supabase.co
SUPABASE_ANON_KEY: SET
SUPABASE_SERVICE_ROLE_KEY: SET
✅ Supabase client initialized successfully
```

**Bad signs (Problems):**

**If you see:**
```
SUPABASE_SERVICE_ROLE_KEY: NOT SET
```
**Diagnosis:** The secret is not being read by the function
**Fix:** Deploy the function (see Step 2)

**If you see:**
```
❌ Failed to initialize Supabase client
```
**Diagnosis:** The Supabase client initialization is failing
**Fix:** Check that the service role key is valid and matches your project

**If you see:**
```
❌ Supabase auth error during signup: [object Object]
Auth error status: 401
```
**Diagnosis:** The service role key is being read but Supabase is rejecting it
**Fix:** The key might be wrong - see Step 4

---

### ✅ Step 4: Get the CORRECT Service Role Key

**Problem:** You might have copied the wrong key, or Supabase changed it.

**Where to Find It:**
1. Go to: https://app.supabase.com/project/yforafidhxehaecwkird/settings/api
2. Scroll to **"Project API keys"** section
3. Find **"service_role"** key (NOT anon key)
4. It should be **"secret"** type
5. Click the copy button

**What It Should Look Like:**
- ✅ Starts with: `eyJ`
- ✅ Very long (200+ characters)
- ✅ Has two dots (.) dividing it into 3 parts: `eyJ...header...eyJ...payload...signature`
- ✅ Contains your project reference somewhere in it (when decoded)

**What It Should NOT Look Like:**
- ❌ Short hex string: `28bebc473f7fb74892b4...`
- ❌ Labeled "Reference ID"
- ❌ Starts with any character other than `eyJ`

**Then:**
1. Copy this **exact** key
2. Go to Edge Functions → server → Secrets
3. Edit `SUPABASE_SERVICE_ROLE_KEY`
4. Paste the key (make sure no spaces before/after)
5. Save
6. **Deploy** the function
7. Test

---

### ✅ Step 5: Check Function Name

**Problem:** Your Edge Function might have a different name than expected.

**What to Check:**
1. Go to Edge Functions list
2. Your function name should be exactly: **`server`**
3. The URL path in your app should be: `/functions/v1/make-server-e8005093/...`

**If function name is different:**
- The code expects it to be called `server`
- Rename it or adjust your code

---

### ✅ Step 6: Verify Project URL Match

**Problem:** Your service role key is for a different project.

**Check:**
1. Decode your JWT at https://jwt.io
2. Look for the `"ref"` field in the payload
3. It should say: `"ref": "yforafidhxehaecwkird"`

**If it's different:**
- You copied the key from the wrong project
- Get the key from Settings → API in YOUR project

---

### ✅ Step 7: Check for Multiple Functions

**Problem:** You might have multiple Edge Functions, and secrets are set on the wrong one.

**Check:**
1. Go to Edge Functions
2. Do you have multiple functions?
3. Make sure you're setting secrets on the `server` function
4. Make sure you're deploying the `server` function

---

### ✅ Step 8: Try Manual Deployment

**Problem:** The Supabase UI deployment might have issues.

**Fix (Advanced):**
If you have CLI access:
```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref yforafidhxehaecwkird

# Deploy the function
supabase functions deploy server

# Set secrets via CLI
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key_here --project-ref yforafidhxehaecwkird
```

---

## Still Not Working? Deep Diagnostics

### Run the Diagnostic Test

1. Go to `/diagnostics` in your app
2. Click "Run Diagnostics"
3. Look at each test result:

**Test Results Meaning:**

| Test | Status | What It Means | Fix |
|------|--------|---------------|-----|
| Edge Function Deployment | ❌ Error | Function not reachable | Deploy function |
| Environment Variables | ❌ Error | Secrets not loaded | Redeploy function |
| Service Role Key Format | ❌ Error | Wrong key format | Use JWT from Settings → API |
| Edge Function Status | ⚠️ Warning | Needs redeploy | Click Deploy |
| Authentication Test | ❌ 401 | Key invalid/wrong | Get new key, redeploy |

### Check These URLs Directly

**Test 1: Health Check**
```
https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/health
```

Expected response:
```json
{
  "status": "ok",
  "hasSupabaseUrl": true,
  "hasSupabaseAnonKey": true,
  "hasServiceRoleKey": true,
  "serviceRoleKeyFormat": "JWT (correct)",
  "serviceRoleKeyPreview": "eyJhbGciOiJIUzI1NiI..."
}
```

**If you get 404:** Edge Function is not deployed
**If you get timeout:** Edge Function is not running
**If hasServiceRoleKey is false:** Secret not set or function not redeployed

**Test 2: Try Signup Directly**
```bash
curl -X POST \
  https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "patient"
  }'
```

**If you get 401:** The service role key is invalid
**If you get 500:** The function crashed - check logs
**If you get success:** It's working! (The UI might have a caching issue - clear browser cache)

---

## Common Mistakes

### ❌ Mistake 1: Setting Secret But Not Deploying
**Symptom:** Health check shows key not set, even though you just set it
**Fix:** Click "Deploy" in Edge Functions

### ❌ Mistake 2: Using Reference ID Instead of JWT
**Symptom:** Health check shows "Invalid format - not a JWT token"
**Fix:** Get the actual JWT from Settings → API, not the hex reference ID

### ❌ Mistake 3: Copying Key With Spaces
**Symptom:** 401 error, logs show key is "SET" but auth fails
**Fix:** Copy the key again, ensure no leading/trailing spaces

### ❌ Mistake 4: Wrong Project
**Symptom:** Everything looks right but 401 persists
**Fix:** Verify the JWT `ref` field matches your project ID

### ❌ Mistake 5: Browser Cache
**Symptom:** Diagnostics pass but UI still shows error
**Fix:** Hard refresh (Ctrl+Shift+R) or clear browser cache

---

## Step-by-Step Fix (If Nothing Else Works)

### Complete Reset Procedure:

1. **Delete the Secret**
   - Edge Functions → server → Secrets
   - Delete `SUPABASE_SERVICE_ROLE_KEY`
   - Click Deploy

2. **Get Fresh Key**
   - Settings → API
   - Copy service_role key (the secret one)
   - Verify it starts with `eyJ`

3. **Set Secret Fresh**
   - Edge Functions → server → Secrets
   - Click "Add Secret"
   - Name: `SUPABASE_SERVICE_ROLE_KEY` (exact spelling)
   - Value: paste the key you just copied
   - Save

4. **Force Deploy**
   - Click "Deploy" button
   - Wait for "Deployed" status
   - Check timestamp is recent

5. **Clear Everything**
   - Clear browser cache
   - Close all tabs with your app
   - Open in incognito/private window

6. **Test Fresh**
   - Go to `/diagnostics`
   - Click "Run Diagnostics"
   - All should be green
   - Try `/register`

---

## Get Help

### What to Share When Asking for Help:

1. **Health Check Response**
   - Visit: `/diagnostics`
   - Expand "Edge Function Deployment" details
   - Copy the JSON

2. **Edge Function Logs**
   - Last 10 lines from Supabase Edge Function logs
   - Look for errors or warnings

3. **Service Role Key Format**
   - First 20 characters: `eyJhbGc...`
   - Last 10 characters: `...xyz123`
   - Length: (count of characters)
   - Does it have 2 dots? Yes/No

4. **What You've Tried**
   - Did you redeploy after setting secret?
   - Did you verify function name is "server"?
   - Did you check logs?
   - Did you try incognito mode?

---

## Success Checklist

You know it's working when:

- [ ] `/diagnostics` shows all green checkmarks
- [ ] Health endpoint returns `hasServiceRoleKey: true` and `serviceRoleKeyFormat: "JWT (correct)"`
- [ ] Edge Function logs show `✅ Supabase client initialized successfully`
- [ ] Can create account at `/register` without errors
- [ ] Can login at `/login` successfully
- [ ] Dashboard loads after login
- [ ] No 401 errors in browser console

---

## Why This Happens

The 401 error occurs when:

1. **Supabase receives the auth request** (from your Edge Function)
2. **But the JWT signature is invalid or mismatched** for the project
3. **So Supabase rejects it** with 401 Unauthorized

This means:
- ✅ Your Edge Function IS running
- ✅ The secret IS being read
- ❌ But the key value is WRONG for some reason

The fix is always one of:
- Key is for wrong project (project ID mismatch)
- Key is old/expired
- Key is malformed (spaces, truncated, etc.)
- Key is a reference ID, not the actual JWT
- Function is reading an old cached value (needs redeploy)

---

**Remember:** The service_role key in Supabase Settings → API is the **source of truth**. Always use that exact value.
