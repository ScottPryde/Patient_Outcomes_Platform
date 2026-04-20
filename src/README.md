# Care-PRO Platform

## 🚨 IMPORTANT: Fix Required

**You're currently seeing a 401 error during registration.** This is a quick 5-minute fix!

👉 **[START HERE: Quick Fix Guide →](/IMMEDIATE_FIX_GUIDE.md)**

### TL;DR Fix:
1. Go to: https://app.supabase.com/project/yforafidhxehaecwkird/functions
2. Open `server` function → Secrets tab
3. Update `SUPABASE_SERVICE_ROLE_KEY` with this JWT:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdWJxcm1pb211eGtjbmF6dGRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk3NjkzMSwiZXhwIjoyMDc5NTUyOTMxfQ.mvAzEUXiz5VW1sh6T8PdwtiUu0b92cbAp0PzJ2py_i8
   ```
4. Save and wait 10 seconds
5. Test at `/register`

**Help Docs:**
- 📘 [Immediate Fix Guide](/IMMEDIATE_FIX_GUIDE.md) - Quick 5-min fix
- 📗 [Detailed 401 Fix](/FIX_401_ERROR.md) - Comprehensive guide
- 📊 [Verification Checklist](/VERIFICATION_CHECKLIST.md) - Test everything
- 📄 [Error Fix Summary](/ERROR_FIX_SUMMARY.md) - What changed

---

# Care-PRO Platform

A comprehensive Patient-Reported Outcomes (PRO) platform with real-time data persistence, authentication, gamification, and curiosity-driven learning workflows.

## 🎯 Features

### Core Functionality
- **Multi-Role Authentication** - Patients, caregivers, clinicians, researchers, and administrators
- **Dynamic Questionnaires** - 9+ question types with branching logic
- **Clinical Trials Hub** - Discovery and tracking with curiosity scoring
- **Patient-Reported Outcomes** - Comprehensive symptom tracking and analytics
- **Consent Management** - Versioning with caregiver-mediated consent
- **Caregiver Support** - Multi-patient linking with configurable permissions

### Gamification & Learning
- **Curiosity Workflow** - Earn points by exploring trials and completing questionnaires
- **Education Hub** - Interactive learning modules with quizzes and rewards
- **Badge System** - Unlock achievements for engagement and learning
- **Level Progression** - Advance through levels as you engage with the platform
- **Points System**:
  - Complete questionnaires: +10 points
  - Follow clinical trials: +3 curiosity points
  - Complete education modules: up to +100 points

### Technical Features
- **Real Authentication** - Powered by Supabase Auth
- **Persistent Storage** - PostgreSQL via Supabase KV store
- **Tagging System** - Content discovery and personalized recommendations
- **Dark Mode** - Full theme support
- **Accessibility** - WCAG 2.2 AA compliant
- **Responsive Design** - Mobile, tablet, and desktop optimized

## 🚀 Getting Started

### First Time Setup

1. **Register an Account**
   - Navigate to `/register`
   - Choose your role (patient, caregiver, clinician, researcher, or administrator)
   - Complete the registration form

2. **Explore the Platform**
   - **Dashboard**: Overview of your activity and insights
   - **Questionnaires**: Complete symptom trackers and health assessments
   - **Results**: View your outcome trends and analytics
   - **Trials & Innovation**: Discover clinical trials and research
   - **Education**: Learn through interactive modules and earn rewards
   - **Tags & Interests**: Customize your content preferences

### For Patients

- Complete daily symptom trackers to monitor your health
- Explore clinical trials relevant to your conditions
- Manage your consent preferences for data sharing
- Track your progress with visualized trends
- Learn about PROs through the Education Hub

### For Caregivers

- Link to patient accounts with approval workflow
- Complete questionnaires on behalf of patients
- View patient results and trends
- Switch between multiple patients easily
- Manage consent for linked patients

### For Clinicians & Researchers

- Create and assign questionnaires to patients
- View aggregated patient data and outcomes
- Track trial enrollment and participation
- Access research-specific analytics
- Manage patient consent for research studies

### For Administrators

- Configure platform settings and consent frameworks
- Manage users and access controls
- Create tags and categories for content organization
- View audit logs and system metrics
- Create education modules and content

## 🎓 Education System

### Available Modules

1. **Introduction to Patient-Reported Outcomes** (Beginner, 10 min, 50 pts)
2. **Understanding Questionnaires** (Beginner, 15 min, 75 pts)
3. **Clinical Trials 101** (Intermediate, 20 min, 100 pts)
4. **Informed Consent** (Beginner, 12 min, 60 pts)
5. **Data Privacy & Security** (Intermediate, 15 min, 80 pts)

### Learning Features

- **Interactive Content**: Text, quizzes, and interactive demonstrations
- **Progress Tracking**: Complete modules to earn points and badges
- **Adaptive Path**: Unlock advanced modules as you progress
- **Quiz Validation**: Test your knowledge and earn bonus points for high scores

## 🏆 Gamification System

### Badges

- **First Learner**: Complete your first education module
- **Knowledge Seeker**: Complete 5 education modules
- **Perfectionist**: Score 90% or higher on a quiz
- **Trial Explorer**: Follow 5 or more clinical trials
- **Curious Mind**: Reach 50 curiosity points

### Leveling System

- Level up every 100 points earned
- Higher levels unlock advanced features (coming soon)
- Track your progress on the Education Hub

## 📊 Data & Privacy

### Data Storage

All data is stored securely in Supabase with:
- Encryption at rest and in transit
- Row-level security policies
- Audit logging for all actions
- Compliance-ready architecture

### Consent Management

- Granular consent types (data use, research participation, caregiver access)
- Version tracking for consent updates
- Withdrawal options at any time
- Caregiver-mediated consent for minors or dependent adults

### Privacy Features

- De-identified data for research
- User-controlled data sharing preferences
- Right to data export and deletion
- HIPAA-aligned security practices (requires additional deployment configuration)

## 🏷️ Tagging System

### Tag Categories

- **Conditions**: Cancer, Diabetes, Heart Disease, Mental Health, Chronic Pain
- **Treatments**: Immunotherapy, Gene Therapy, Biologics
- **Research Themes**: Precision Medicine, Digital Health, Patient Outcomes

### Using Tags

- Select tags on the Tags & Interests page
- Receive personalized content recommendations
- Get notifications for relevant trials and research
- Filter content by your interests

## 🔐 Security Notes

**Important**: This platform is deployed in Figma Make's environment and is suitable for prototyping and demonstration purposes. For production healthcare use:

1. Deploy to a HIPAA-compliant infrastructure
2. Enable SSL/TLS encryption
3. Implement Business Associate Agreements (BAAs)
4. Configure proper backup and disaster recovery
5. Enable comprehensive audit logging
6. Conduct security assessments and penetration testing

## 🛠️ API Endpoints

All API routes are available at `/functions/v1/make-server-e8005093/`:

### Authentication
- `POST /auth/signup` - Register new user

### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update profile
- `GET /user/progress` - Get gamification progress

### Questionnaires
- `GET /questionnaires` - List questionnaires
- `GET /questionnaires/:id` - Get specific questionnaire
- `POST /questionnaires` - Create questionnaire (admin/clinician)
- `POST /responses` - Submit response
- `GET /responses` - Get user responses

### Clinical Trials
- `GET /trials` - List all trials
- `GET /trials/:id` - Get trial details
- `POST /trials/:id/follow` - Follow a trial
- `DELETE /trials/:id/follow` - Unfollow a trial

### Education
- `GET /education` - List education modules
- `GET /education/:id` - Get module details
- `POST /education/:id/complete` - Mark module complete

### Tags & Interests
- `GET /tags` - List all tags
- `POST /tags` - Create tag (admin only)
- `GET /user/interests` - Get user interests
- `POST /user/interests` - Add interest
- `DELETE /user/interests/:tagId` - Remove interest

### Consent
- `GET /consents` - List consent templates
- `GET /user/consents` - Get user consents
- `POST /user/consents` - Update consent status

### Caregiver
- `GET /caregiver/links` - Get linked patients
- `POST /caregiver/request` - Request patient link
- `PUT /caregiver/links/:id` - Update link status

### Notifications
- `GET /notifications` - Get user notifications
- `POST /notifications` - Create notification
- `PUT /notifications/:id/read` - Mark as read

### Analytics
- `GET /analytics/metrics` - Get user metrics

## 🎨 Design System

The platform uses a comprehensive design system with:
- Tailwind CSS v4.0 for styling
- shadcn/ui component library
- Motion/React for animations
- Lucide React for icons
- Dark mode support throughout

## 📝 Notes

- The database is automatically seeded on first run with sample data
- All users start at Level 1 with 0 points
- Sample questionnaires and trials are pre-loaded
- Education modules are available immediately

## 🚧 Roadmap

Future enhancements:
- Real-time notifications via WebSocket
- Advanced analytics dashboards
- Mobile app integration
- Telemedicine integration
- Wearable device data import
- AI-powered trial matching
- Multi-language support

## 📄 License

This is a demonstration platform built for prototyping purposes.

---

Built with ❤️ using React, TypeScript, Tailwind CSS, Supabase, and Motion.
