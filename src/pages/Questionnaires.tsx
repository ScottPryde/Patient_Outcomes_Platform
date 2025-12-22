import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockQuestionnaires } from '../lib/mockData';
import { ClipboardList, Clock, Filter, Search, Play, CheckCircle } from 'lucide-react';

export function Questionnaires() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFrequency, setSelectedFrequency] = useState('all');

  if (!user) return null;

  // Filter questionnaires by user role
  const questionnaires = mockQuestionnaires.filter(q => 
    q.targetRoles.includes(user.role) && q.status === 'active'
  );

  // Get unique categories
  const categories = ['all', ...new Set(questionnaires.map(q => q.category))];
  const frequencies = ['all', 'recurring', 'one-time', 'event-driven'];

  // Filter questionnaires
  const filteredQuestionnaires = questionnaires.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesFrequency = selectedFrequency === 'all' || q.schedulingType === selectedFrequency;
    
    return matchesSearch && matchesCategory && matchesFrequency;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Symptoms': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'Quality of Life': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'Treatment': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Questionnaires</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete questionnaires to track your health and outcomes
        </p>
      </div>

      {/* Stats banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Available</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {filteredQuestionnaires.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">87</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Avg. Time</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">6 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questionnaires..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Frequency filter */}
          <select
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
          >
            {frequencies.map(freq => (
              <option key={freq} value={freq}>
                {freq === 'all' ? 'All Types' : freq.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questionnaire list */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuestionnaires.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No questionnaires found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          filteredQuestionnaires.map((questionnaire) => (
            <div
              key={questionnaire.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{questionnaire.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {questionnaire.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`px-3 py-1 rounded-full ${getCategoryColor(questionnaire.category)}`}>
                      {questionnaire.category}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {questionnaire.estimatedTime} minutes
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {questionnaire.questions.length} questions
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {questionnaire.schedulingType.replace('-', ' ')}
                      {questionnaire.frequency && ` • ${questionnaire.frequency}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {questionnaire.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:flex-shrink-0">
                  <Link
                    to={`/questionnaires/${questionnaire.id}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start
                  </Link>
                  <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Preview
                  </button>
                </div>
              </div>

              {/* Progress indicator (mock) */}
              {questionnaire.schedulingType === 'recurring' && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Completion rate</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
