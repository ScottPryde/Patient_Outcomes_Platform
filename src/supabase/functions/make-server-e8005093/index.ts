import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.ts';
import { seedDatabase } from './seed.ts';

const app = new Hono();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use('*', cors());
app.use('*', logger(console.log));

// ============================================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================================

console.log('=== Care-PRO Server Starting ===');
console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL') || 'NOT SET');
console.log('SUPABASE_ANON_KEY:', Deno.env.get('SUPABASE_ANON_KEY') ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'NOT SET');

let supabase: any;
try {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ CRITICAL: Missing Supabase environment variables');
    console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  } else {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    console.log('No auth header provided');
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found in auth header');
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error('Auth verification error:', error.message);
      return null;
    }
    if (!user) {
      console.log('No user found for token');
      return null;
    }
    return user;
  } catch (error) {
    console.error('Auth verification exception:', error);
    return null;
  }
}

// ============================================================================
// HEALTH & CONFIG ROUTES (Public)
// ============================================================================

app.get('/make-server-e8005093/health', (c) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const isJWT = serviceRoleKey.startsWith('eyJ');
  const isSbFormat = serviceRoleKey.startsWith('sb_');

  const hasSupabaseUrl = !!supabaseUrl;
  const hasSupabaseAnonKey = !!supabaseAnonKey;
  const hasServiceRoleKey = !!serviceRoleKey;
  const serviceRoleKeyFormat = serviceRoleKey
    ? (isJWT ? 'JWT (valid)' : isSbFormat ? 'JWT (correct)' : 'Invalid format')
    : 'Not set';

  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    // Backwards‑compatible top‑level flags expected by the frontend
    hasSupabaseUrl,
    hasSupabaseAnonKey,
    hasServiceRoleKey,
    serviceRoleKeyFormat,
    // Limited preview for diagnostics only (non‑sensitive)
    serviceRoleKeyPreview: serviceRoleKey ? serviceRoleKey.slice(0, 6) + '...' : null,
    environment: {
      hasSupabaseUrl,
      hasSupabaseAnonKey,
      hasServiceRoleKey,
      serviceRoleKeyFormat,
    },
  });
});

app.get('/make-server-e8005093/config', (c) => {
  return c.json({
    supabaseUrl: Deno.env.get('SUPABASE_URL') || '',
    supabaseAnonKey: Deno.env.get('SUPABASE_ANON_KEY') || '',
  });
});

app.post('/make-server-e8005093/seed', async (c) => {
  try {
    console.log('Manual database seed triggered');
    await seedDatabase();
    return c.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return c.json({ 
      success: false, 
      error: `Database seed failed: ${error.message}` 
    }, 500);
  }
});

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

app.post('/make-server-e8005093/auth/signup', async (c) => {
  try {
    if (!supabase) {
      return c.json({ 
        success: false, 
        error: 'Server configuration error: Supabase client not initialized. Please ensure SUPABASE_SERVICE_ROLE_KEY is set in the Edge Function secrets.' 
      }, 500);
    }

    const { email, password, firstName, lastName, role = 'patient', dateOfBirth, phone } = await c.req.json();
    
    console.log(`Creating user: ${email} with role: ${role}`);
    
    // Create user with admin API (auto-confirms email)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatically confirm the user's email since an email server hasn't been configured.
      user_metadata: { firstName, lastName, role, dateOfBirth, phone },
    });

    if (authError) {
      console.error('❌ Supabase auth error during signup:', authError);
      
      let errorMessage = authError.message;
      if (authError.status === 401) {
        errorMessage = 'Invalid SUPABASE_SERVICE_ROLE_KEY. Please verify it matches your service_role key from Supabase Settings > API';
      }
      
      return c.json({ 
        success: false, 
        error: `Registration error: ${errorMessage}`,
        details: {
          status: authError.status,
          message: authError.message,
        }
      }, authError.status || 400);
    }

    console.log(`✅ User created successfully: ${authData.user.id}`);

    // Create user profile in KV store
    const userProfile = {
      id: authData.user.id,
      email,
      firstName,
      lastName,
      role,
      dateOfBirth,
      phone,
      createdAt: new Date().toISOString(),
      preferences: {
        notifications: { email: true, push: true, sms: false },
        accessibility: { highContrast: false, largeText: false, reducedMotion: false },
        theme: 'auto',
      },
      gamification: {
        points: 0,
        level: 1,
        badges: [],
        completedEducation: [],
        curiosityScore: 0,
      },
    };

    await kv.set(`user:${authData.user.id}`, userProfile);

    return c.json({ success: true, user: userProfile });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ 
      success: false, 
      error: `Registration failed: ${error.message}` 
    }, 400);
  }
});

app.post('/make-server-e8005093/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log(`Sign-in attempt for: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error during signin:', error.message);
      return c.json({ 
        success: false, 
        error: `Authentication error: ${error.message}` 
      }, 401);
    }

    if (!data.session) {
      return c.json({ 
        success: false, 
        error: 'Authentication failed: No session returned' 
      }, 401);
    }

    console.log(`✅ Sign-in successful for user: ${data.user.id}`);

    // Get or create user profile
    let profile = await kv.get(`user:${data.user.id}`);
    
    if (!profile) {
      console.warn('User profile not found in KV store, creating basic profile');
      profile = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.user_metadata?.firstName || 'User',
        lastName: data.user.user_metadata?.lastName || '',
        role: data.user.user_metadata?.role || 'patient',
        createdAt: new Date().toISOString(),
        preferences: {
          notifications: { email: true, push: true, sms: false },
          accessibility: { highContrast: false, largeText: false, reducedMotion: false },
          theme: 'auto',
        },
        gamification: {
          points: 0,
          level: 1,
          badges: [],
          completedEducation: [],
          curiosityScore: 0,
        },
      };
      await kv.set(`user:${data.user.id}`, profile);
    }

    return c.json({ 
      success: true, 
      user: profile,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ 
      success: false, 
      error: `Sign-in failed: ${error.message}` 
    }, 401);
  }
});

app.post('/make-server-e8005093/auth/signout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      await supabase.auth.admin.signOut(token);
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    return c.json({ success: true }); // Always succeed for signout
  }
});

app.get('/make-server-e8005093/auth/session', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ authenticated: false }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    return c.json({ authenticated: true, user: profile });
  } catch (error) {
    console.error('Session verification error:', error);
    return c.json({ authenticated: false }, 401);
  }
});

// ============================================================================
// USER PROFILE ROUTES
// ============================================================================

app.get('/make-server-e8005093/user/profile', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404);
    }
    return c.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ error: `Failed to fetch profile: ${error.message}` }, 500);
  }
});

app.put('/make-server-e8005093/user/profile', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${user.id}`);
    
    if (!currentProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }
    
    // Prevent updating protected fields
    const { id, email, createdAt, ...allowedUpdates } = updates;
    
    const updatedProfile = { 
      ...currentProfile, 
      ...allowedUpdates, 
      id: user.id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return c.json({ error: `Failed to update profile: ${error.message}` }, 500);
  }
});

// ============================================================================
// TAGS & INTERESTS ROUTES
// ============================================================================

app.get('/make-server-e8005093/tags', async (c) => {
  try {
    const category = c.req.query('category');
    const tags = await kv.getByPrefix('tag:');
    
    let filteredTags = tags;
    if (category) {
      filteredTags = tags.filter((t: any) => t.category === category);
    }
    
    return c.json(filteredTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return c.json({ error: `Failed to fetch tags: ${error.message}` }, 500);
  }
});

app.post('/make-server-e8005093/tags', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'administrator') {
      return c.json({ error: 'Forbidden - admin access required' }, 403);
    }

    const tag = await c.req.json();
    const tagId = `tag:${crypto.randomUUID()}`;
    const newTag = { 
      ...tag, 
      id: tagId,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(tagId, newTag);

    return c.json({ success: true, tag: newTag });
  } catch (error) {
    console.error('Error creating tag:', error);
    return c.json({ error: `Failed to create tag: ${error.message}` }, 500);
  }
});

app.get('/make-server-e8005093/user/interests', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const interests = await kv.get(`interests:${user.id}`) || [];
    return c.json(interests);
  } catch (error) {
    console.error('Error fetching interests:', error);
    return c.json({ error: `Failed to fetch interests: ${error.message}` }, 500);
  }
});

app.post('/make-server-e8005093/user/interests', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const { tagId, notificationsEnabled = true } = await c.req.json();
    const interests = await kv.get(`interests:${user.id}`) || [];
    
    // Check if already following
    if (interests.some((i: any) => i.tagId === tagId)) {
      return c.json({ error: 'Already following this tag' }, 400);
    }
    
    const newInterest = {
      userId: user.id,
      tagId,
      addedAt: new Date().toISOString(),
      notificationsEnabled,
    };
    
    interests.push(newInterest);
    await kv.set(`interests:${user.id}`, interests);

    return c.json({ success: true, interests });
  } catch (error) {
    console.error('Error adding interest:', error);
    return c.json({ error: `Failed to add interest: ${error.message}` }, 500);
  }
});

app.delete('/make-server-e8005093/user/interests/:tagId', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const tagId = c.req.param('tagId');
    const interests = await kv.get(`interests:${user.id}`) || [];
    const filtered = interests.filter((i: any) => i.tagId !== tagId);
    
    await kv.set(`interests:${user.id}`, filtered);

    return c.json({ success: true, interests: filtered });
  } catch (error) {
    console.error('Error removing interest:', error);
    return c.json({ error: `Failed to remove interest: ${error.message}` }, 500);
  }
});

// ============================================================================
// QUESTIONNAIRES ROUTES
// ============================================================================

app.get('/make-server-e8005093/questionnaires', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const userProfile = await kv.get(`user:${user.id}`);
    const questionnaires = await kv.getByPrefix('questionnaire:');
    
    // Filter by target roles
    const filtered = questionnaires.filter((q: any) => 
      q.targetRoles && q.targetRoles.includes(userProfile.role)
    );

    return c.json(filtered);
  } catch (error) {
    console.error('Error fetching questionnaires:', error);
    return c.json({ error: `Failed to fetch questionnaires: ${error.message}` }, 500);
  }
});

app.get('/make-server-e8005093/questionnaires/:id', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const id = c.req.param('id');
    const questionnaire = await kv.get(`questionnaire:${id}`);

    if (!questionnaire) {
      return c.json({ error: 'Questionnaire not found' }, 404);
    }

    return c.json(questionnaire);
  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    return c.json({ error: `Failed to fetch questionnaire: ${error.message}` }, 500);
  }
});

app.post('/make-server-e8005093/questionnaires', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['administrator', 'clinician', 'researcher'].includes(userProfile.role)) {
      return c.json({ error: 'Forbidden - insufficient permissions' }, 403);
    }

    const questionnaire = await c.req.json();
    const id = crypto.randomUUID();
    const newQuestionnaire = {
      ...questionnaire,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };

    await kv.set(`questionnaire:${id}`, newQuestionnaire);

    return c.json({ success: true, questionnaire: newQuestionnaire });
  } catch (error) {
    console.error('Error creating questionnaire:', error);
    return c.json({ error: `Failed to create questionnaire: ${error.message}` }, 500);
  }
});

// ============================================================================
// QUESTIONNAIRE RESPONSES ROUTES
// ============================================================================

app.post('/make-server-e8005093/responses', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const response = await c.req.json();
    const id = crypto.randomUUID();
    const newResponse = {
      ...response,
      id,
      userId: user.id,
      startedAt: response.startedAt || new Date().toISOString(),
      submittedAt: response.status === 'completed' ? new Date().toISOString() : undefined,
    };

    await kv.set(`response:${id}`, newResponse);

    // Update user's responses list
    const userResponses = await kv.get(`user-responses:${user.id}`) || [];
    userResponses.push(id);
    await kv.set(`user-responses:${user.id}`, userResponses);

    // Award curiosity points for completing questionnaire
    if (response.status === 'completed') {
      const userProfile = await kv.get(`user:${user.id}`);
      userProfile.gamification.points += 10;
      userProfile.gamification.curiosityScore += 5;
      await kv.set(`user:${user.id}`, userProfile);
    }

    return c.json({ success: true, response: newResponse });
  } catch (error) {
    console.error('Error saving response:', error);
    return c.json({ error: `Failed to save response: ${error.message}` }, 500);
  }
});

app.get('/make-server-e8005093/responses', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const responseIds = await kv.get(`user-responses:${user.id}`) || [];
    const responses = await kv.mget(responseIds.map((id: string) => `response:${id}`));

    return c.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    return c.json({ error: `Failed to fetch responses: ${error.message}` }, 500);
  }
});

// ============================================================================
// CLINICAL TRIALS ROUTES
// ============================================================================

app.get('/make-server-e8005093/trials', async (c) => {
  try {
    const trials = await kv.getByPrefix('trial:');
    return c.json(trials);
  } catch (error) {
    console.error('Error fetching trials:', error);
    return c.json({ error: `Failed to fetch trials: ${error.message}` }, 500);
  }
});

app.get('/make-server-e8005093/trials/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const trial = await kv.get(`trial:${id}`);
    
    if (!trial) {
      return c.json({ error: 'Trial not found' }, 404);
    }
    
    return c.json(trial);
  } catch (error) {
    console.error('Error fetching trial:', error);
    return c.json({ error: `Failed to fetch trial: ${error.message}` }, 500);
  }
});

app.post('/make-server-e8005093/trials/:id/follow', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const trialId = c.req.param('id');
    const following = await kv.get(`user-trials:${user.id}`) || [];
    
    if (following.includes(trialId)) {
      return c.json({ error: 'Already following this trial' }, 400);
    }
    
    following.push(trialId);
    await kv.set(`user-trials:${user.id}`, following);

    // Increment follow count
    const trial = await kv.get(`trial:${trialId}`);
    if (trial) {
      trial.followCount = (trial.followCount || 0) + 1;
      await kv.set(`trial:${trialId}`, trial);
    }

    // Award curiosity points
    const userProfile = await kv.get(`user:${user.id}`);
    userProfile.gamification.curiosityScore += 3;
    await kv.set(`user:${user.id}`, userProfile);

    return c.json({ success: true, following });
  } catch (error) {
    console.error('Error following trial:', error);
    return c.json({ error: `Failed to follow trial: ${error.message}` }, 500);
  }
});

app.delete('/make-server-e8005093/trials/:id/follow', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const trialId = c.req.param('id');
    const following = await kv.get(`user-trials:${user.id}`) || [];
    const filtered = following.filter((id: string) => id !== trialId);
    
    await kv.set(`user-trials:${user.id}`, filtered);

    // Decrement follow count
    const trial = await kv.get(`trial:${trialId}`);
    if (trial) {
      trial.followCount = Math.max(0, (trial.followCount || 0) - 1);
      await kv.set(`trial:${trialId}`, trial);
    }

    return c.json({ success: true, following: filtered });
  } catch (error) {
    console.error('Error unfollowing trial:', error);
    return c.json({ error: `Failed to unfollow trial: ${error.message}` }, 500);
  }
});

// ============================================================================
// EDUCATION ROUTES
// ============================================================================

app.get('/make-server-e8005093/education', async (c) => {
  try {
    const modules = await kv.getByPrefix('education:');
    return c.json(modules);
  } catch (error) {
    console.error('Error fetching education modules:', error);
    return c.json({ error: `Failed to fetch education modules: ${error.message}` }, 500);
  }
});

app.get('/make-server-e8005093/education/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const module = await kv.get(`education:${id}`);
    
    if (!module) {
      return c.json({ error: 'Education module not found' }, 404);
    }
    
    return c.json(module);
  } catch (error) {
    console.error('Error fetching education module:', error);
    return c.json({ error: `Failed to fetch education module: ${error.message}` }, 500);
  }
});

app.post('/make-server-e8005093/education/:id/complete', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const moduleId = c.req.param('id');
    const { score, timeSpent } = await c.req.json();

    // Record completion
    const completionId = crypto.randomUUID();
    const completion = {
      id: completionId,
      userId: user.id,
      moduleId,
      score,
      timeSpent,
      completedAt: new Date().toISOString(),
    };

    await kv.set(`completion:${completionId}`, completion);

    // Update user completions
    const userCompletions = await kv.get(`user-completions:${user.id}`) || [];
    userCompletions.push(completionId);
    await kv.set(`user-completions:${user.id}`, userCompletions);

    // Award points and badges
    const userProfile = await kv.get(`user:${user.id}`);
    const pointsEarned = Math.floor(score * 10);
    userProfile.gamification.points += pointsEarned;
    
    if (!userProfile.gamification.completedEducation.includes(moduleId)) {
      userProfile.gamification.completedEducation.push(moduleId);
    }

    // Check for badges
    const newBadges = [];
    if (userProfile.gamification.completedEducation.length === 1 && !userProfile.gamification.badges.includes('first-learner')) {
      userProfile.gamification.badges.push('first-learner');
      newBadges.push('first-learner');
    }
    if (userProfile.gamification.completedEducation.length >= 5 && !userProfile.gamification.badges.includes('knowledge-seeker')) {
      userProfile.gamification.badges.push('knowledge-seeker');
      newBadges.push('knowledge-seeker');
    }
    if (score >= 90 && !userProfile.gamification.badges.includes('perfectionist')) {
      userProfile.gamification.badges.push('perfectionist');
      newBadges.push('perfectionist');
    }

    // Level up logic
    const newLevel = Math.floor(userProfile.gamification.points / 100) + 1;
    userProfile.gamification.level = newLevel;

    await kv.set(`user:${user.id}`, userProfile);

    return c.json({ 
      success: true, 
      pointsEarned, 
      newBadges,
      level: newLevel,
    });
  } catch (error) {
    console.error('Error completing education module:', error);
    return c.json({ error: `Failed to complete education module: ${error.message}` }, 500);
  }
});

app.get('/make-server-e8005093/user/progress', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const userProfile = await kv.get(`user:${user.id}`);
    const completionIds = await kv.get(`user-completions:${user.id}`) || [];
    const completions = await kv.mget(completionIds.map((id: string) => `completion:${id}`));

    return c.json({
      gamification: userProfile.gamification,
      completions,
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return c.json({ error: `Failed to fetch user progress: ${error.message}` }, 500);
  }
});

// ============================================================================
// CONSENT ROUTES
// ============================================================================

app.get('/make-server-e8005093/consents', async (c) => {
  try {
    const consents = await kv.getByPrefix('consent:');
    return c.json(consents);
  } catch (error) {
    console.error('Error fetching consents:', error);
    return c.json({ error: `Failed to fetch consents: ${error.message}` }, 500);
  }
});

app.get('/make-server-e8005093/user/consents', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const userConsents = await kv.get(`user-consents:${user.id}`) || [];
    return c.json(userConsents);
  } catch (error) {
    console.error('Error fetching user consents:', error);
    return c.json({ error: `Failed to fetch user consents: ${error.message}` }, 500);
  }
});

app.post('/make-server-e8005093/user/consents', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const { consentId, status, actingUserId, actingUserRole, notes } = await c.req.json();
    
    const userConsent = {
      id: crypto.randomUUID(),
      userId: user.id,
      consentId,
      status,
      actingUserId,
      actingUserRole,
      notes,
      acceptedAt: status === 'accepted' ? new Date().toISOString() : undefined,
      declinedAt: status === 'declined' ? new Date().toISOString() : undefined,
      withdrawnAt: status === 'withdrawn' ? new Date().toISOString() : undefined,
    };

    const userConsents = await kv.get(`user-consents:${user.id}`) || [];
    userConsents.push(userConsent);
    await kv.set(`user-consents:${user.id}`, userConsents);

    return c.json({ success: true, consent: userConsent });
  } catch (error) {
    console.error('Error creating consent:', error);
    return c.json({ error: `Failed to create consent: ${error.message}` }, 500);
  }
});

// ============================================================================
// CAREGIVER ROUTES
// ============================================================================

app.get('/make-server-e8005093/caregiver/links', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const links = await kv.get(`caregiver-links:${user.id}`) || [];
    return c.json(links);
  } catch (error) {
    console.error('Error fetching caregiver links:', error);
    return c.json({ error: `Failed to fetch caregiver links: ${error.message}` }, 500);
  }
});

app.post('/make-server-e8005093/caregiver/request', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const { patientId, accessLevel, permissions } = await c.req.json();
    
    const link = {
      id: crypto.randomUUID(),
      caregiverId: user.id,
      patientId,
      accessLevel,
      permissions,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    const caregiverLinks = await kv.get(`caregiver-links:${user.id}`) || [];
    caregiverLinks.push(link);
    await kv.set(`caregiver-links:${user.id}`, caregiverLinks);

    // Add to patient's pending requests
    const patientLinks = await kv.get(`patient-links:${patientId}`) || [];
    patientLinks.push(link);
    await kv.set(`patient-links:${patientId}`, patientLinks);

    return c.json({ success: true, link });
  } catch (error) {
    console.error('Error creating caregiver request:', error);
    return c.json({ error: `Failed to create caregiver request: ${error.message}` }, 500);
  }
});

app.put('/make-server-e8005093/caregiver/links/:id', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const linkId = c.req.param('id');
    const { status } = await c.req.json();

    // Update in patient's links
    const patientLinks = await kv.get(`patient-links:${user.id}`) || [];
    const updatedLink = patientLinks.find((l: any) => l.id === linkId);
    
    if (!updatedLink) {
      return c.json({ error: 'Link not found' }, 404);
    }

    updatedLink.status = status;
    if (status === 'approved') {
      updatedLink.approvedAt = new Date().toISOString();
    } else if (status === 'rejected') {
      updatedLink.rejectedAt = new Date().toISOString();
    }

    await kv.set(`patient-links:${user.id}`, patientLinks);

    // Update caregiver's links
    const caregiverLinks = await kv.get(`caregiver-links:${updatedLink.caregiverId}`) || [];
    const cgLink = caregiverLinks.find((l: any) => l.id === linkId);
    if (cgLink) {
      cgLink.status = status;
      cgLink.approvedAt = updatedLink.approvedAt;
      cgLink.rejectedAt = updatedLink.rejectedAt;
      await kv.set(`caregiver-links:${updatedLink.caregiverId}`, caregiverLinks);
    }

    return c.json({ success: true, link: updatedLink });
  } catch (error) {
    console.error('Error updating caregiver link:', error);
    return c.json({ error: `Failed to update caregiver link: ${error.message}` }, 500);
  }
});

// ============================================================================
// NOTIFICATIONS ROUTES
// ============================================================================

app.get('/make-server-e8005093/notifications', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const notifications = await kv.get(`notifications:${user.id}`) || [];
    return c.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: `Failed to fetch notifications: ${error.message}` }, 500);
  }
});

app.post('/make-server-e8005093/notifications', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const notification = await c.req.json();
    const id = crypto.randomUUID();
    const newNotification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const notifications = await kv.get(`notifications:${notification.userId}`) || [];
    notifications.unshift(newNotification);
    await kv.set(`notifications:${notification.userId}`, notifications);

    return c.json({ success: true, notification: newNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return c.json({ error: `Failed to create notification: ${error.message}` }, 500);
  }
});

app.put('/make-server-e8005093/notifications/:id/read', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const notificationId = c.req.param('id');
    const notifications = await kv.get(`notifications:${user.id}`) || [];
    
    const notification = notifications.find((n: any) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await kv.set(`notifications:${user.id}`, notifications);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ error: `Failed to mark notification as read: ${error.message}` }, 500);
  }
});

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

app.get('/make-server-e8005093/analytics/metrics', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);

  try {
    const responseIds = await kv.get(`user-responses:${user.id}`) || [];
    const responses = await kv.mget(responseIds.map((id: string) => `response:${id}`));

    const completedResponses = responses.filter((r: any) => r && r.status === 'completed');
    const scores = completedResponses.map((r: any) => r.score || 0);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const metrics = {
      userId: user.id,
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      questionnairesCompleted: completedResponses.length,
      averageScore: Math.round(avgScore * 10) / 10,
      scoreChange: 0, // Would calculate from historical data
      adherence: 85, // Would calculate from scheduled vs completed
    };

    return c.json(metrics);
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    return c.json({ error: `Failed to fetch analytics metrics: ${error.message}` }, 500);
  }
});

// ============================================================================
// STARTUP & DATABASE SEEDING
// ============================================================================

console.log('🚀 Care-PRO Server initializing...');

// Check if database needs seeding on first run
kv.get('system:initialized').then(async (initialized) => {
  if (!initialized) {
    console.log('🌱 First run detected, seeding database...');
    try {
      await seedDatabase();
      await kv.set('system:initialized', true);
      console.log('✅ Database seeded successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
    }
  } else {
    console.log('✅ Database already initialized');
  }
}).catch((error) => {
  console.error('❌ Error checking database initialization:', error);
});

console.log('✅ Care-PRO Server started successfully');

Deno.serve(app.fetch);
