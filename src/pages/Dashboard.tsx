import { useAuth } from '../contexts/AuthContext';
import { useConsent } from '../contexts/ConsentContext';
import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  BarChart3, 
  FlaskConical, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Activity,
  Trophy,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockQuestionnaires, mockPatientMetrics } from '../lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { QuickStartGuide } from '../components/onboarding/QuickStartGuide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { apiRequest } from '../utils/supabase/client';

export function Dashboard() {
  const { user, activePatient } = useAuth();
  const { hasRequiredConsents } = useConsent();
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [gamification, setGamification] = useState<any>(null);

  useEffect(() => {
    // Check if user has seen quick start
    const hasSeenQuickStart = localStorage.getItem('hasSeenQuickStart');
    if (!hasSeenQuickStart && user) {
      setShowQuickStart(true);
    }

    // Load gamification data
    loadGamificationData();
  }, [user]);

  const loadGamificationData = async () => {
    try {
      const data = await apiRequest('/user/progress');
      setGamification(data.gamification);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  const handleCloseQuickStart = () => {
    setShowQuickStart(false);
    localStorage.setItem('hasSeenQuickStart', 'true');
  };

  if (!user) return null;

  const displayName = activePatient 
    ? `${activePatient.firstName} ${activePatient.lastName}`
    : `${user.firstName} ${user.lastName}`;

  const consentsComplete = hasRequiredConsents();

  // Mock pending questionnaires
  const pendingQuestionnaires = mockQuestionnaires.filter(q => 
    q.targetRoles.includes(user.role) && q.status === 'active'
  ).slice(0, 3);

  // Recent symptoms data
  const painData = mockPatientMetrics.symptoms[0].values.map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: v.value,
  }));

  // QoL radar data
  const qolData = mockPatientMetrics.qualityOfLife.map(q => ({
    category: q.category.replace(' ', '\n'),
    score: q.score,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {showQuickStart && <QuickStartGuide onClose={handleCloseQuickStart} />}

      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Welcome back, {displayName.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground">
            Here's your health journey overview
          </p>
        </div>
        {gamification && (
          <Card className="w-64">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Level {gamification.level}</div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-2xl">{gamification.points}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="h-4 w-4" />
                    <span className="text-lg">{gamification.curiosityScore}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">curiosity</div>
                </div>
              </div>
              {gamification.badges.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {gamification.badges.length} badge{gamification.badges.length !== 1 ? 's' : ''} earned
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Consent alert */}
      {!consentsComplete && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-900 dark:text-yellow-200">
                Action Required: Complete Consent Forms
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                Please review and accept the required consent forms to access all platform features.
              </p>
              <Link
                to="/consent"
                className="inline-block mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Review Consents
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList className="w-6 h-6" />}
          title="Questionnaires"
          value={mockPatientMetrics.questionnairesCompleted}
          subtitle="Completed"
          trend="+12% this month"
          color="bg-blue-500"
          linkTo="/questionnaires"
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="Health Score"
          value={mockPatientMetrics.averageScore.toFixed(1)}
          subtitle="Average rating"
          trend={mockPatientMetrics.scoreChange > 0 ? `+${mockPatientMetrics.scoreChange}` : mockPatientMetrics.scoreChange.toString()}
          color="bg-green-500"
          linkTo="/results"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          title="Adherence"
          value={`${mockPatientMetrics.adherence}%`}
          subtitle="Completion rate"
          trend="Great!"
          color="bg-purple-500"
        />
        <StatCard
          icon={<FlaskConical className="w-6 h-6" />}
          title="Trials"
          value="3"
          subtitle="Matching trials"
          trend="New matches"
          color="bg-orange-500"
          linkTo="/trials"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending questionnaires */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Pending Questionnaires</h2>
            <Link to="/questionnaires" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {pendingQuestionnaires.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>All caught up!</p>
              </div>
            ) : (
              pendingQuestionnaires.map((q) => (
                <Link
                  key={q.id}
                  to={`/questionnaires/${q.id}`}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{q.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {q.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <span>⏱ {q.estimatedTime} min</span>
                        <span>•</span>
                        <span className="capitalize">{q.schedulingType.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Pain trend chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Pain Level Trend</h2>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={painData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
              />
              <YAxis 
                domain={[0, 10]}
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Your pain levels have improved by 50% over the past 3 months
          </p>
        </div>

        {/* Quality of Life radar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold mb-4">Quality of Life Metrics</h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={qolData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar 
                name="Score" 
                dataKey="score" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.6} 
              />
            </RadarChart>
          </ResponsiveContainer>

          <Link
            to="/results"
            className="block mt-4 text-center px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
          >
            View Detailed Analysis
          </Link>
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          
          <div className="space-y-4">
            {[
              { action: 'Completed Daily Symptom Tracker', time: '2 hours ago', icon: CheckCircle2, color: 'text-green-500' },
              { action: 'New trial match found', time: '1 day ago', icon: FlaskConical, color: 'text-orange-500' },
              { action: 'Quality of Life Assessment submitted', time: '3 days ago', icon: BarChart3, color: 'text-blue-500' },
              { action: 'Followed "Immunotherapy" research', time: '5 days ago', icon: Activity, color: 'text-purple-500' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <activity.icon className={`w-5 h-5 ${activity.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/profile"
            className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700"
          >
            View full activity log
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          title="Complete Questionnaire"
          description="Track your symptoms and well-being"
          icon={<ClipboardList className="w-8 h-8" />}
          linkTo="/questionnaires"
          color="bg-blue-500"
        />
        <ActionCard
          title="Explore Clinical Trials"
          description="Find trials matching your condition"
          icon={<FlaskConical className="w-8 h-8" />}
          linkTo="/trials"
          color="bg-orange-500"
        />
        <ActionCard
          title="View Your Results"
          description="Analyze your health trends"
          icon={<BarChart3 className="w-8 h-8" />}
          linkTo="/results"
          color="bg-green-500"
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  trend: string;
  color: string;
  linkTo?: string;
}

function StatCard({ icon, title, value, subtitle, trend, color, linkTo }: StatCardProps) {
  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-green-600 dark:text-green-400">{trend}</p>
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
  color: string;
}

function ActionCard({ title, description, icon, linkTo, color }: ActionCardProps) {
  return (
    <Link
      to={linkTo}
      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 hover:shadow-lg transition-all"
    >
      <div className={`${color} text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}