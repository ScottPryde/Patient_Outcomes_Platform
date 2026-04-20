# 📚 Care-PRO API Documentation

Complete API reference for the Care-PRO backend.

**Base URL:** `https://yforafidhxehaecwkird.supabase.co/functions/v1/make-server-e8005093`

---

## 🔐 Authentication

All protected endpoints require an `Authorization` header with a valid JWT token:

```
Authorization: Bearer <access_token>
```

Get the `access_token` from the sign-in response.

---

## 📋 Table of Contents

1. [Health & Config](#health--config)
2. [Authentication](#authentication-endpoints)
3. [User Profile](#user-profile)
4. [Tags & Interests](#tags--interests)
5. [Questionnaires](#questionnaires)
6. [Responses](#questionnaire-responses)
7. [Clinical Trials](#clinical-trials)
8. [Education](#education)
9. [Consent Management](#consent-management)
10. [Caregiver Linking](#caregiver-linking)
11. [Notifications](#notifications)
12. [Analytics](#analytics)

---

## Health & Config

### GET /health

Check server health and environment status.

**Authentication:** None required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-16T10:30:00.000Z",
  "environment": {
    "hasSupabaseUrl": true,
    "hasSupabaseAnonKey": true,
    "hasServiceRoleKey": true,
    "serviceRoleKeyFormat": "JWT (valid)"
  }
}
```

### GET /config

Get public configuration (Supabase URL and anon key).

**Authentication:** None required

**Response:**
```json
{
  "supabaseUrl": "https://yforafidhxehaecwkird.supabase.co",
  "supabaseAnonKey": "eyJhbGc..."
}
```

### POST /seed

Manually trigger database seeding.

**Authentication:** None required

**Response:**
```json
{
  "success": true,
  "message": "Database seeded successfully"
}
```

---

## Authentication Endpoints

### POST /auth/signup

Create a new user account.

**Authentication:** None required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient",
  "dateOfBirth": "1990-01-15",
  "phone": "555-0123"
}
```

**Roles:** `patient`, `caregiver`, `clinician`, `researcher`, `administrator`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "dateOfBirth": "1990-01-15",
    "phone": "555-0123",
    "createdAt": "2024-12-16T10:30:00.000Z",
    "preferences": {
      "notifications": { "email": true, "push": true, "sms": false },
      "accessibility": { "highContrast": false, "largeText": false, "reducedMotion": false },
      "theme": "auto"
    },
    "gamification": {
      "points": 0,
      "level": 1,
      "badges": [],
      "completedEducation": [],
      "curiosityScore": 0
    }
  }
}
```

### POST /auth/signin

Sign in an existing user.

**Authentication:** None required

**Request Body:**
```json
{
  "email": "patient@carepro.com",
  "password": "CarePRO2024!"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "patient@carepro.com",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "role": "patient",
    "...": "..."
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "xyz...",
    "expires_at": 1702987200
  }
}
```

### POST /auth/signout

Sign out the current user.

**Authentication:** Required

**Response:**
```json
{
  "success": true
}
```

### GET /auth/session

Verify current session and get user profile.

**Authentication:** Required

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "patient@carepro.com",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "role": "patient",
    "...": "..."
  }
}
```

---

## User Profile

### GET /user/profile

Get the authenticated user's profile.

**Authentication:** Required

**Response:**
```json
{
  "id": "uuid",
  "email": "patient@carepro.com",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "role": "patient",
  "dateOfBirth": "1985-06-15",
  "phone": "555-0101",
  "createdAt": "2024-12-16T10:00:00.000Z",
  "preferences": {
    "notifications": { "email": true, "push": true, "sms": false },
    "accessibility": { "highContrast": false, "largeText": false, "reducedMotion": false },
    "theme": "auto"
  },
  "gamification": {
    "points": 150,
    "level": 2,
    "badges": ["first-learner"],
    "completedEducation": ["edu-intro-pro"],
    "curiosityScore": 25
  }
}
```

### PUT /user/profile

Update the authenticated user's profile.

**Authentication:** Required

**Request Body:** (all fields optional)
```json
{
  "firstName": "Sarah",
  "lastName": "Johnson-Smith",
  "phone": "555-9999",
  "preferences": {
    "notifications": { "email": true, "push": false, "sms": true },
    "theme": "dark"
  }
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "...": "updated profile"
  }
}
```

---

## Tags & Interests

### GET /tags

Get all tags, optionally filtered by category.

**Authentication:** None required

**Query Parameters:**
- `category` (optional): Filter by category (`condition`, `treatment`, `research-theme`)

**Example:** `/tags?category=condition`

**Response:**
```json
[
  {
    "id": "tag:cancer",
    "name": "Cancer",
    "category": "condition",
    "description": "Cancer-related research and clinical trials",
    "icon": "🎗️"
  },
  {
    "id": "tag:diabetes",
    "name": "Diabetes",
    "category": "condition",
    "description": "Diabetes management and treatment research",
    "icon": "💉"
  }
]
```

### POST /tags

Create a new tag (admin only).

**Authentication:** Required (Administrator role)

**Request Body:**
```json
{
  "name": "New Condition",
  "category": "condition",
  "description": "Description of the condition",
  "icon": "🏥"
}
```

**Response:**
```json
{
  "success": true,
  "tag": {
    "id": "tag:uuid",
    "name": "New Condition",
    "category": "condition",
    "description": "Description of the condition",
    "icon": "🏥",
    "createdAt": "2024-12-16T10:30:00.000Z"
  }
}
```

### GET /user/interests

Get the authenticated user's followed tags.

**Authentication:** Required

**Response:**
```json
[
  {
    "userId": "uuid",
    "tagId": "tag:cancer",
    "addedAt": "2024-12-16T10:00:00.000Z",
    "notificationsEnabled": true
  }
]
```

### POST /user/interests

Follow a tag.

**Authentication:** Required

**Request Body:**
```json
{
  "tagId": "tag:diabetes",
  "notificationsEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "interests": [
    {
      "userId": "uuid",
      "tagId": "tag:diabetes",
      "addedAt": "2024-12-16T10:30:00.000Z",
      "notificationsEnabled": true
    }
  ]
}
```

### DELETE /user/interests/:tagId

Unfollow a tag.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "interests": []
}
```

---

## Questionnaires

### GET /questionnaires

Get questionnaires available to the authenticated user (filtered by role).

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "q-daily-symptoms",
    "title": "Daily Symptom Tracker",
    "description": "Quick daily check-in on your symptoms and wellbeing",
    "category": "symptom-tracking",
    "estimatedTime": 3,
    "schedulingType": "recurring",
    "frequency": "daily",
    "status": "active",
    "targetRoles": ["patient"],
    "tags": ["chronic-pain", "patient-outcomes"],
    "questions": [
      {
        "id": "q1",
        "type": "symptom-scale",
        "text": "How would you rate your pain level today?",
        "required": true,
        "options": [...],
        "order": 1
      }
    ],
    "scoringLogic": {
      "type": "sum",
      "ranges": [...]
    },
    "createdAt": "2024-12-16T10:00:00.000Z",
    "updatedAt": "2024-12-16T10:00:00.000Z"
  }
]
```

### GET /questionnaires/:id

Get a specific questionnaire by ID.

**Authentication:** Required

**Response:** Same as single questionnaire object above

### POST /questionnaires

Create a new questionnaire (admin/clinician/researcher only).

**Authentication:** Required (Administrator, Clinician, or Researcher role)

**Request Body:**
```json
{
  "title": "New Questionnaire",
  "description": "Description",
  "category": "symptom-tracking",
  "estimatedTime": 5,
  "schedulingType": "on-demand",
  "status": "active",
  "targetRoles": ["patient"],
  "tags": ["chronic-pain"],
  "questions": [
    {
      "id": "q1",
      "type": "rating",
      "text": "Question text?",
      "required": true,
      "validation": { "min": 1, "max": 5 },
      "order": 1
    }
  ],
  "scoringLogic": {
    "type": "sum",
    "ranges": []
  }
}
```

**Question Types:** `symptom-scale`, `rating`, `likert`, `slider`, `multiple-choice`, `single-choice`, `boolean`, `textarea`, `date`, `time`

**Response:**
```json
{
  "success": true,
  "questionnaire": {
    "id": "uuid",
    "...": "created questionnaire"
  }
}
```

---

## Questionnaire Responses

### POST /responses

Submit a questionnaire response.

**Authentication:** Required

**Request Body:**
```json
{
  "questionnaireId": "q-daily-symptoms",
  "answers": [
    { "questionId": "q1", "value": 2 },
    { "questionId": "q2", "value": 3 },
    { "questionId": "q3", "value": ["fatigue", "headache"] },
    { "questionId": "q4", "value": "Feeling better today" }
  ],
  "score": 5,
  "status": "completed"
}
```

**Status:** `draft`, `in-progress`, `completed`

**Response:**
```json
{
  "success": true,
  "response": {
    "id": "uuid",
    "userId": "uuid",
    "questionnaireId": "q-daily-symptoms",
    "answers": [...],
    "score": 5,
    "status": "completed",
    "startedAt": "2024-12-16T10:00:00.000Z",
    "submittedAt": "2024-12-16T10:03:00.000Z"
  }
}
```

**Note:** Completing a questionnaire awards 10 points and 5 curiosity score.

### GET /responses

Get all responses for the authenticated user.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "questionnaireId": "q-daily-symptoms",
    "answers": [...],
    "score": 5,
    "status": "completed",
    "startedAt": "2024-12-16T10:00:00.000Z",
    "submittedAt": "2024-12-16T10:03:00.000Z"
  }
]
```

---

## Clinical Trials

### GET /trials

Get all clinical trials.

**Authentication:** None required

**Response:**
```json
[
  {
    "id": "trial-001",
    "title": "Novel Immunotherapy for Advanced Cancer",
    "description": "Phase 2 study evaluating...",
    "sponsor": "University Medical Center & BioPharma Research",
    "phase": "phase-2",
    "status": "recruiting",
    "conditions": ["cancer"],
    "interventions": ["immunotherapy", "biologics"],
    "eligibilityCriteria": {
      "minAge": 18,
      "maxAge": 75,
      "gender": "all",
      "criteria": [...],
      "exclusions": [...]
    },
    "locations": [...],
    "startDate": "2024-01-15",
    "estimatedCompletionDate": "2026-01-15",
    "enrollmentTarget": 120,
    "currentEnrollment": 45,
    "primaryOutcome": "Overall response rate at 6 months",
    "secondaryOutcomes": [...],
    "tags": ["cancer", "immunotherapy", "precision-medicine"],
    "contactInfo": {
      "name": "Dr. Sarah Johnson, MD, PhD",
      "email": "sjohnson@hospital.edu",
      "phone": "555-0123",
      "role": "Principal Investigator"
    },
    "followCount": 0,
    "curiosityPoints": 15,
    "lastUpdated": "2024-12-16T10:00:00.000Z"
  }
]
```

**Trial Phases:** `phase-1`, `phase-2`, `phase-3`, `phase-4`
**Trial Status:** `recruiting`, `active`, `completed`, `suspended`, `terminated`

### GET /trials/:id

Get a specific trial by ID.

**Authentication:** None required

**Response:** Same as single trial object above

### POST /trials/:id/follow

Follow a clinical trial.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "following": ["trial-001", "trial-002"]
}
```

**Note:** Following a trial awards 3 curiosity score points.

### DELETE /trials/:id/follow

Unfollow a clinical trial.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "following": ["trial-002"]
}
```

---

## Education

### GET /education

Get all education modules.

**Authentication:** None required

**Response:**
```json
[
  {
    "id": "edu-intro-pro",
    "title": "Introduction to Patient-Reported Outcomes",
    "description": "Learn the fundamentals of PROs...",
    "category": "fundamentals",
    "estimatedTime": 10,
    "difficulty": "beginner",
    "points": 50,
    "content": {
      "sections": [
        {
          "title": "What are PROs?",
          "content": "...",
          "type": "text"
        },
        {
          "title": "Quiz",
          "questions": [...],
          "type": "quiz"
        }
      ]
    },
    "tags": ["patient-outcomes"],
    "nextModules": ["edu-questionnaires"]
  }
]
```

**Categories:** `fundamentals`, `trials`, `privacy`
**Difficulty:** `beginner`, `intermediate`, `advanced`

### GET /education/:id

Get a specific education module.

**Authentication:** None required

**Response:** Same as single module object above

### POST /education/:id/complete

Mark an education module as complete.

**Authentication:** Required

**Request Body:**
```json
{
  "score": 95,
  "timeSpent": 600
}
```

**Response:**
```json
{
  "success": true,
  "pointsEarned": 950,
  "newBadges": ["first-learner", "perfectionist"],
  "level": 2
}
```

**Badges:**
- `first-learner`: Complete first education module
- `knowledge-seeker`: Complete 5+ education modules
- `perfectionist`: Score 90% or higher on a quiz

### GET /user/progress

Get the authenticated user's learning progress.

**Authentication:** Required

**Response:**
```json
{
  "gamification": {
    "points": 950,
    "level": 2,
    "badges": ["first-learner", "perfectionist"],
    "completedEducation": ["edu-intro-pro"],
    "curiosityScore": 25
  },
  "completions": [
    {
      "id": "uuid",
      "userId": "uuid",
      "moduleId": "edu-intro-pro",
      "score": 95,
      "timeSpent": 600,
      "completedAt": "2024-12-16T10:30:00.000Z"
    }
  ]
}
```

---

## Consent Management

### GET /consents

Get all consent templates.

**Authentication:** None required

**Response:**
```json
[
  {
    "id": "consent-data-use",
    "type": "data-use",
    "version": "1.0",
    "title": "Data Use Agreement",
    "description": "Standard consent for using your health data...",
    "content": "# Data Use Agreement\n\nBy accepting...",
    "required": true,
    "createdAt": "2024-12-16T10:00:00.000Z",
    "updatedAt": "2024-12-16T10:00:00.000Z"
  }
]
```

**Consent Types:** `data-use`, `research-participation`, `caregiver-access`

### GET /user/consents

Get the authenticated user's consent decisions.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "consentId": "consent-data-use",
    "status": "accepted",
    "actingUserId": "uuid",
    "actingUserRole": "patient",
    "notes": "",
    "acceptedAt": "2024-12-16T10:00:00.000Z"
  }
]
```

**Consent Status:** `accepted`, `declined`, `withdrawn`, `pending`

### POST /user/consents

Record a consent decision.

**Authentication:** Required

**Request Body:**
```json
{
  "consentId": "consent-research",
  "status": "accepted",
  "actingUserId": "uuid",
  "actingUserRole": "patient",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "consent": {
    "id": "uuid",
    "userId": "uuid",
    "consentId": "consent-research",
    "status": "accepted",
    "actingUserId": "uuid",
    "actingUserRole": "patient",
    "notes": "Optional notes",
    "acceptedAt": "2024-12-16T10:30:00.000Z"
  }
}
```

---

## Caregiver Linking

### GET /caregiver/links

Get caregiver links for the authenticated user.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "uuid",
    "caregiverId": "uuid",
    "patientId": "uuid",
    "accessLevel": "view-only",
    "permissions": {
      "viewResponses": true,
      "completeQuestionnaires": false,
      "manageProfile": false
    },
    "status": "approved",
    "requestedAt": "2024-12-16T10:00:00.000Z",
    "approvedAt": "2024-12-16T10:15:00.000Z"
  }
]
```

**Access Levels:** `view-only`, `limited-management`, `full-management`
**Link Status:** `pending`, `approved`, `rejected`, `revoked`

### POST /caregiver/request

Request caregiver access to a patient.

**Authentication:** Required

**Request Body:**
```json
{
  "patientId": "uuid",
  "accessLevel": "view-only",
  "permissions": {
    "viewResponses": true,
    "completeQuestionnaires": false,
    "manageProfile": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "link": {
    "id": "uuid",
    "caregiverId": "uuid",
    "patientId": "uuid",
    "accessLevel": "view-only",
    "permissions": {...},
    "status": "pending",
    "requestedAt": "2024-12-16T10:30:00.000Z"
  }
}
```

### PUT /caregiver/links/:id

Update a caregiver link status (approve/reject).

**Authentication:** Required (must be the patient)

**Request Body:**
```json
{
  "status": "approved"
}
```

**Response:**
```json
{
  "success": true,
  "link": {
    "id": "uuid",
    "status": "approved",
    "approvedAt": "2024-12-16T10:35:00.000Z",
    "...": "..."
  }
}
```

---

## Notifications

### GET /notifications

Get notifications for the authenticated user.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "questionnaire-due",
    "title": "Daily Symptom Tracker Due",
    "message": "Your daily questionnaire is ready to complete",
    "priority": "normal",
    "read": false,
    "createdAt": "2024-12-16T10:00:00.000Z",
    "relatedId": "q-daily-symptoms",
    "relatedType": "questionnaire"
  }
]
```

**Notification Types:** `questionnaire-due`, `trial-update`, `caregiver-request`, `badge-earned`, `consent-required`, `education-available`
**Priority:** `low`, `normal`, `high`, `urgent`

### POST /notifications

Create a notification.

**Authentication:** Required

**Request Body:**
```json
{
  "userId": "uuid",
  "type": "badge-earned",
  "title": "New Badge Earned!",
  "message": "Congratulations! You earned the 'First Learner' badge",
  "priority": "normal",
  "relatedId": "first-learner",
  "relatedType": "badge"
}
```

**Response:**
```json
{
  "success": true,
  "notification": {
    "id": "uuid",
    "userId": "uuid",
    "type": "badge-earned",
    "title": "New Badge Earned!",
    "message": "Congratulations!...",
    "priority": "normal",
    "read": false,
    "createdAt": "2024-12-16T10:30:00.000Z",
    "relatedId": "first-learner",
    "relatedType": "badge"
  }
}
```

### PUT /notifications/:id/read

Mark a notification as read.

**Authentication:** Required

**Response:**
```json
{
  "success": true
}
```

---

## Analytics

### GET /analytics/metrics

Get analytics metrics for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "userId": "uuid",
  "period": {
    "start": "2024-11-16T10:00:00.000Z",
    "end": "2024-12-16T10:00:00.000Z"
  },
  "questionnairesCompleted": 15,
  "averageScore": 7.3,
  "scoreChange": 0,
  "adherence": 85
}
```

---

## Error Responses

All endpoints may return error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized - invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden - insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to process request: detailed error message"
}
```

---

## Rate Limits

Currently, there are no enforced rate limits. In production, consider implementing:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints

---

## Data Types Reference

### User Object
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'caregiver' | 'clinician' | 'researcher' | 'administrator';
  dateOfBirth?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  preferences: {
    notifications: { email: boolean; push: boolean; sms: boolean };
    accessibility: { highContrast: boolean; largeText: boolean; reducedMotion: boolean };
    theme: 'auto' | 'light' | 'dark';
  };
  gamification: {
    points: number;
    level: number;
    badges: string[];
    completedEducation: string[];
    curiosityScore: number;
  };
}
```

### Question Object
```typescript
{
  id: string;
  type: 'symptom-scale' | 'rating' | 'likert' | 'slider' | 'multiple-choice' | 
        'single-choice' | 'boolean' | 'textarea' | 'date' | 'time';
  text: string;
  required: boolean;
  options?: Array<{
    id: string;
    label: string;
    value: any;
    score?: number;
    description?: string;
  }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    maxLength?: number;
  };
  placeholder?: string;
  labels?: { min?: string; max?: string };
  allowMultiple?: boolean;
  order: number;
}
```

---

## Best Practices

1. **Always include error handling** - All requests may fail
2. **Store the access_token securely** - Use secure storage mechanisms
3. **Implement token refresh** - Tokens expire after 1 hour
4. **Handle 401 errors** - Redirect to login when unauthorized
5. **Use appropriate HTTP methods** - GET for reading, POST for creating, PUT for updating, DELETE for removing
6. **Validate data before sending** - Reduce server load and improve UX
7. **Show loading states** - API requests may take 1-3 seconds on cold start
8. **Implement retry logic** - For transient network errors
9. **Log errors comprehensively** - Include context for debugging
10. **Never expose service_role key** - It grants admin access to everything

---

## Support

For issues or questions:
- Check [BACKEND_TROUBLESHOOTING.md](/BACKEND_TROUBLESHOOTING.md)
- Review function logs: `supabase functions logs make-server`
- Test with curl to isolate frontend vs backend issues
