import { useState } from 'react';
import { mockClinicalTrials, mockResearchItems } from '../lib/mockData';
import { 
  FlaskConical, 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Calendar,
  Heart,
  ExternalLink,
  TrendingUp,
  Microscope,
  Pill,
  Activity,
  Smartphone
} from 'lucide-react';

export function TrialsHub() {
  const [activeTab, setActiveTab] = useState<'trials' | 'research'>('trials');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const filteredTrials = mockClinicalTrials.filter(trial => {
    const matchesSearch = trial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trial.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase = selectedPhase === 'all' || trial.phase === selectedPhase;
    const matchesStatus = selectedStatus === 'all' || trial.status === selectedStatus;
    return matchesSearch && matchesPhase && matchesStatus;
  });

  const filteredResearch = mockResearchItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      'early-phase-1': 'Early Phase 1',
      'phase-1': 'Phase 1',
      'phase-2': 'Phase 2',
      'phase-3': 'Phase 3',
      'phase-4': 'Phase 4',
    };
    return labels[phase] || phase;
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      'early-phase-1': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'phase-1': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'phase-2': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'phase-3': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'phase-4': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
    };
    return colors[phase] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'recruiting': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'active': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'completed': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'suspended': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'terminated': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getResearchTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'publication': <Microscope className="w-5 h-5" />,
      'device': <Activity className="w-5 h-5" />,
      'diagnostic': <FlaskConical className="w-5 h-5" />,
      'digital': <Smartphone className="w-5 h-5" />,
      'drug': <Pill className="w-5 h-5" />,
    };
    return icons[type] || <Microscope className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Clinical Trials & Innovation</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover clinical trials and cutting-edge research matching your interests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('trials')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'trials'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <FlaskConical className="w-5 h-5 inline mr-2" />
          Clinical Trials ({filteredTrials.length})
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'research'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <TrendingUp className="w-5 h-5 inline mr-2" />
          Latest Research ({filteredResearch.length})
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'trials' ? 'trials' : 'research'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
            />
          </div>

          {activeTab === 'trials' ? (
            <>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                <option value="all">All Phases</option>
                <option value="early-phase-1">Early Phase 1</option>
                <option value="phase-1">Phase 1</option>
                <option value="phase-2">Phase 2</option>
                <option value="phase-3">Phase 3</option>
                <option value="phase-4">Phase 4</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                <option value="all">All Status</option>
                <option value="recruiting">Recruiting</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </>
          ) : (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
              <option value="all">All Types</option>
              <option value="publication">Publications</option>
              <option value="device">Devices</option>
              <option value="diagnostic">Diagnostics</option>
              <option value="digital">Digital Health</option>
              <option value="drug">Drugs</option>
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'trials' ? (
        <div className="space-y-4">
          {filteredTrials.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FlaskConical className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No trials found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            filteredTrials.map((trial) => (
              <div
                key={trial.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(trial.phase)}`}>
                        {getPhaseLabel(trial.phase)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(trial.status)}`}>
                        {trial.status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{trial.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{trial.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FlaskConical className="w-4 h-4" />
                        <span><strong>Sponsor:</strong> {trial.sponsor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span><strong>Enrollment:</strong> {trial.currentEnrollment}/{trial.enrollmentTarget}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span><strong>Locations:</strong> {trial.locations.length} sites</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span><strong>Duration:</strong> {new Date(trial.startDate).getFullYear()} - {trial.endDate ? new Date(trial.endDate).getFullYear() : 'Ongoing'}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Conditions:</p>
                      <div className="flex flex-wrap gap-2">
                        {trial.conditions.map((condition, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Heart className="w-4 h-4" />
                      <span>{trial.followCount} people following</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:flex-shrink-0">
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                      View Details
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Heart className="w-4 h-4" />
                      Follow
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResearch.length === 0 ? (
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Microscope className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No research found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            filteredResearch.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    {getResearchTypeIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs rounded mb-2 capitalize">
                      {item.type}
                    </span>
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {item.summary}
                </p>

                {item.authors && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                    <strong>Authors:</strong> {item.authors.join(', ')}
                  </p>
                )}

                {item.institution && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                    <strong>Institution:</strong> {item.institution}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Heart className="w-4 h-4" />
                    <span>{item.followCount} following</span>
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Read More
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
