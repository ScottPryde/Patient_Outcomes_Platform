import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  ClipboardList, 
  FlaskConical, 
  Tags,
  BarChart3,
  Settings 
} from 'lucide-react';

export function AdminPanel() {
  const location = useLocation();

  const navigation = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Consent Framework', href: '/admin/consents', icon: Shield },
    { name: 'Questionnaires', href: '/admin/questionnaires', icon: ClipboardList },
    { name: 'Trials', href: '/admin/trials', icon: FlaskConical },
    { name: 'Tag Taxonomy', href: '/admin/tags', icon: Tags },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Admin Panel</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Platform configuration and management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="consents" element={<ConsentFramework />} />
            <Route path="questionnaires" element={<QuestionnaireBuilder />} />
            <Route path="trials" element={<TrialManagement />} />
            <Route path="tags" element={<TagTaxonomy />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Total Users" value="1,247" change="+12% this month" />
        <StatCard title="Active Questionnaires" value="15" change="3 new this week" />
        <StatCard title="Active Trials" value="8" change="2 recruiting" />
        <StatCard title="Consent Rate" value="94%" change="+2% from last month" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span>New user registered: patient@example.com</span>
            <span className="text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span>Questionnaire "Daily Symptom Tracker" updated</span>
            <span className="text-gray-500">5 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span>New trial added: "Phase 3 Immunotherapy Study"</span>
            <span className="text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="font-semibold mb-4">User Management</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Manage user accounts, roles, and permissions.
      </p>
    </div>
  );
}

function ConsentFramework() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="font-semibold mb-4">Consent Framework</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Configure consent types, versions, and requirements.
      </p>
    </div>
  );
}

function QuestionnaireBuilder() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="font-semibold mb-4">Questionnaire Builder</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Create and manage PRO/Px questionnaires.
      </p>
    </div>
  );
}

function TrialManagement() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="font-semibold mb-4">Trial Management</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Manage clinical trials, cohorts, and eligibility criteria.
      </p>
    </div>
  );
}

function TagTaxonomy() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="font-semibold mb-4">Tag Taxonomy</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Manage tags, categories, and interest topics.
      </p>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="font-semibold mb-4">Platform Settings</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Configure global platform settings and preferences.
      </p>
    </div>
  );
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{title}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-green-600 dark:text-green-400">{change}</p>
    </div>
  );
}
