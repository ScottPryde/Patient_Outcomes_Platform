import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockPatientMetrics } from '../lib/mockData';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Filter,
  Activity
} from 'lucide-react';

export function Results() {
  const { user, activePatient } = useAuth();
  const [dateRange, setDateRange] = useState('3months');
  const [selectedMetric, setSelectedMetric] = useState('all');

  if (!user) return null;

  const displayName = activePatient 
    ? `${activePatient.firstName} ${activePatient.lastName}`
    : `${user.firstName} ${user.lastName}`;

  const metrics = mockPatientMetrics;

  // Transform data for charts
  const painTrendData = metrics.symptoms[0].values.map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Pain Level': v.value,
  }));

  const fatigueTrendData = metrics.symptoms[1].values.map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Fatigue Level': v.value,
  }));

  const combinedSymptoms = metrics.symptoms[0].values.map((v, i) => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Pain': v.value,
    'Fatigue': metrics.symptoms[1].values[i].value,
  }));

  const qolRadarData = metrics.qualityOfLife.map(q => ({
    category: q.category.replace(' ', '\n'),
    score: q.score,
    fullMark: 100,
  }));

  const qolBarData = metrics.qualityOfLife.map(q => ({
    category: q.category,
    score: q.score,
    change: q.change,
  }));

  const handleExportData = () => {
    const dataStr = JSON.stringify(metrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-data-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">Results & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user.role === 'caregiver' && activePatient
              ? `Health insights for ${displayName}`
              : 'Your health trends and outcomes over time'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Average Health Score"
          value={metrics.averageScore.toFixed(1)}
          change={metrics.scoreChange}
          changeLabel={`${metrics.scoreChange > 0 ? '+' : ''}${metrics.scoreChange} from last period`}
          icon={<Activity className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <MetricCard
          title="Questionnaires Completed"
          value={metrics.questionnairesCompleted}
          change={12}
          changeLabel="+12% from last period"
          icon={<Calendar className="w-6 h-6" />}
          color="bg-green-500"
        />
        <MetricCard
          title="Adherence Rate"
          value={`${metrics.adherence}%`}
          change={3}
          changeLabel="Excellent compliance"
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <MetricCard
          title="Pain Improvement"
          value="50%"
          change={-3}
          changeLabel="Reduced from baseline"
          icon={<TrendingDown className="w-6 h-6" />}
          color="bg-orange-500"
          reverseColor
        />
      </div>

      {/* Symptom trends */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Symptom Trends Over Time</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
            >
              <option value="all">All Symptoms</option>
              <option value="pain">Pain Only</option>
              <option value="fatigue">Fatigue Only</option>
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={combinedSymptoms}>
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
              label={{ value: 'Severity (0-10)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
            {(selectedMetric === 'all' || selectedMetric === 'pain') && (
              <Line 
                type="monotone" 
                dataKey="Pain" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 5 }}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'fatigue') && (
              <Line 
                type="monotone" 
                dataKey="Fatigue" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <TrendingDown className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-200">Pain Improving</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your pain levels have decreased by 50% over the tracking period. Great progress!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <TrendingDown className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-purple-900 dark:text-purple-200">Fatigue Improving</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Fatigue levels are gradually decreasing. Continue your current treatment plan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality of Life Radar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold mb-6">Quality of Life Assessment</h2>
          
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={qolRadarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar 
                name="Current Score" 
                dataKey="score" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.6} 
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Overall quality of life score: <span className="font-medium text-purple-600 dark:text-purple-400">71/100</span>
          </p>
        </div>

        {/* QoL Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold mb-6">QoL Scores by Category</h2>
          
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={qolBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 11 }}
                stroke="#9CA3AF"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                domain={[0, 100]}
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
              <Bar dataKey="score" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {metrics.qualityOfLife.map((q, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{q.category}</span>
                <span className={q.change > 0 ? 'text-green-600' : 'text-gray-600'}>
                  {q.change > 0 ? '+' : ''}{q.change} points
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold mb-4">Summary Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Tracking Period
            </h3>
            <p className="text-lg font-medium">
              {new Date(metrics.period.start).toLocaleDateString()} - {new Date(metrics.period.end).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {Math.floor((new Date(metrics.period.end).getTime() - new Date(metrics.period.start).getTime()) / (1000 * 60 * 60 * 24))} days of data
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Most Improved
            </h3>
            <p className="text-lg font-medium text-green-600 dark:text-green-400">
              {metrics.symptoms[0].symptom}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              50% reduction in severity
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Next Assessment
            </h3>
            <p className="text-lg font-medium">
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Weekly QoL questionnaire
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
  reverseColor?: boolean;
}

function MetricCard({ title, value, change, changeLabel, icon, color, reverseColor }: MetricCardProps) {
  const isPositive = reverseColor ? change < 0 : change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TrendIcon className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
        <span className="text-sm text-gray-600 dark:text-gray-400">{changeLabel}</span>
      </div>
    </div>
  );
}
