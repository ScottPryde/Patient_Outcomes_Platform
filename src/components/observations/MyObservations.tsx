import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, TrendingUp, ChevronDown, Calendar, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { AddObservation } from './AddObservation';
import { AddEvent } from './AddEvent';
import { AddMeasure } from './AddMeasure';

type ObservationType = 'activity' | 'sleep' | 'fatigue' | 'pain' | string;

interface Observation {
  date: string;
  value: number;
}

interface ObservationData {
  [key: string]: Observation[];
}

interface SavedObservation {
  id: string;
  type: string;
  customType?: string;
  value: string;
  unit: string;
  comment?: string;
  date: string;
}

interface SavedEvent {
  id: string;
  type: string;
  customType?: string;
  date: string;
  time: string;
  comment?: string;
  attachments: {
    videos: File[];
    letters: File[];
    photos: File[];
  };
  tags: string[];
}

// Mock data - in production, this would come from the backend
const initialMockObservations: ObservationData = {
  activity: [
    { date: 'Mon', value: 65 },
    { date: 'Tue', value: 72 },
    { date: 'Wed', value: 68 },
    { date: 'Thu', value: 78 },
    { date: 'Fri', value: 82 },
    { date: 'Sat', value: 85 },
    { date: 'Sun', value: 88 },
  ],
  sleep: [
    { date: 'Mon', value: 6.5 },
    { date: 'Tue', value: 7 },
    { date: 'Wed', value: 6.8 },
    { date: 'Thu', value: 7.2 },
    { date: 'Fri', value: 7.5 },
    { date: 'Sat', value: 8 },
    { date: 'Sun', value: 8.2 },
  ],
  fatigue: [
    { date: 'Mon', value: 75 },
    { date: 'Tue', value: 70 },
    { date: 'Wed', value: 72 },
    { date: 'Thu', value: 65 },
    { date: 'Fri', value: 55 },
    { date: 'Sat', value: 45 },
    { date: 'Sun', value: 40 },
  ],
  pain: [
    { date: 'Mon', value: 60 },
    { date: 'Tue', value: 58 },
    { date: 'Wed', value: 55 },
    { date: 'Thu', value: 50 },
    { date: 'Fri', value: 45 },
    { date: 'Sat', value: 40 },
    { date: 'Sun', value: 35 },
  ],
};

const observationTypes: { id: ObservationType; label: string; color: string; unit: string }[] = [
  { id: 'activity', label: 'Activity', color: '#0052cc', unit: 'steps' },
  { id: 'sleep', label: 'Sleep', color: '#06b6d4', unit: 'hours' },
  { id: 'fatigue', label: 'Fatigue', color: '#f59e0b', unit: 'level' },
  { id: 'pain', label: 'Pain', color: '#ef4444', unit: 'level' },
];

export function MyObservations() {
  const [observationTypesState, setObservationTypesState] = useState(observationTypes);
  const [mockObservations, setMockObservations] = useState(initialMockObservations);
  const [selectedObservation, setSelectedObservation] = useState<ObservationType>('activity');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddObservationOpen, setIsAddObservationOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddMeasureOpen, setIsAddMeasureOpen] = useState(false);
  const [savedObservations, setSavedObservations] = useState<SavedObservation[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);

  const handleAddObservation = (data: any) => {
    const newObservation: SavedObservation = {
      id: Date.now().toString(),
      type: data.type,
      customType: data.customType,
      value: data.value,
      unit: data.type === 'custom' ? data.customUnit : observationTypes.find(t => t.id === data.type)?.unit || '',
      comment: data.comment,
      date: data.date,
    };

    setSavedObservations((prev) => [newObservation, ...prev]);
    console.log('Saved observation:', newObservation);
    console.log('Modal should now be closing...');
  };

  const handleAddEvent = (data: any) => {
    const newEvent: SavedEvent = {
      id: Date.now().toString(),
      type: data.type,
      customType: data.customType,
      date: data.date,
      time: data.time,
      comment: data.comment,
      attachments: {
        videos: data.videos || [],
        letters: data.letters || [],
        photos: data.photos || [],
      },
      tags: data.tags || [],
    };

    setSavedEvents((prev) => [newEvent, ...prev]);
    console.log('Saved event:', newEvent);
  };

  const handleAddMeasure = (data: any) => {
    const measureId = `custom_${Date.now()}`;
    const newMeasure = {
      id: measureId,
      label: data.name,
      color: data.color,
      unit: data.unit,
    };

    setObservationTypesState((prev) => [...prev, newMeasure]);
    
    // Initialize mock data for the new measure
    setMockObservations((prev) => ({
      ...prev,
      [measureId]: [
        { date: 'Mon', value: 0 },
        { date: 'Tue', value: 0 },
        { date: 'Wed', value: 0 },
        { date: 'Thu', value: 0 },
        { date: 'Fri', value: 0 },
        { date: 'Sat', value: 0 },
        { date: 'Sun', value: 0 },
      ],
    }));

    // Auto-select the new measure
    setSelectedObservation(measureId);
    console.log('Created new measure:', newMeasure);
  };

  const currentObservation = observationTypesState.find((o) => o.id === selectedObservation);
  const data = mockObservations[selectedObservation as string] || [];

  // Calculate stats for trend chart lines
  const avg = data.reduce((acc, d) => acc + d.value, 0) / data.length;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));

  // Add avg, min, max lines to trend data
  const trendData = data.map((d) => ({
    ...d,
    avg: parseFloat(avg.toFixed(1)),
    max,
    min,
  }));

  // Calculate stats for radar chart by observation type
  const radarData = observationTypesState.map((type) => {
    const typeData = mockObservations[type.id as string] || [];
    if (typeData.length === 0) return { type: type.label, avg: 0, max: 0, min: 0, fullMark: 100 };
    const typeAvg = typeData.reduce((acc, d) => acc + d.value, 0) / typeData.length;
    const typeMax = Math.max(...typeData.map((d) => d.value));
    const typeMin = Math.min(...typeData.map((d) => d.value));
    return {
      type: type.label,
      avg: parseFloat(typeAvg.toFixed(1)),
      max: typeMax,
      min: typeMin,
      fullMark: typeMax + 10,
    };
  });

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle>Observation Trends</CardTitle>
                <CardDescription>Monitor your health metrics over time</CardDescription>
              </div>
            </div>

            {/* Selector and Add Button - Top Right */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 w-64"
                  title="Change measure"
                >
                  <span>{currentObservation?.label}</span>
                  <ChevronDown className="w-3 h-3 ml-auto" />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10 w-64">
                    {observationTypesState.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          setSelectedObservation(type.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium transition-colors ${
                          selectedObservation === type.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                    <div className="border-t border-slate-200 dark:border-slate-700 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsAddMeasureOpen(true);
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" />
                        Add Measure
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 min-w-0 flex-1">
                <Button
                  onClick={() => {
                    console.log('Add Observation button clicked, current state:', isAddObservationOpen);
                    setIsAddObservationOpen(true);
                    console.log('Set state to open');
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 w-52"
                >
                  <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">Add Observation</span>
                </Button>

                <Button
                  onClick={() => setIsAddEventOpen(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 w-52"
                >
                  <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">Add Event</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Chart */}
            <div className="w-full">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Weekly Trend
              </h3>
              <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                      }}
                      formatter={(value) => `${value} ${currentObservation?.unit}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={currentObservation?.color || '#0052cc'}
                      strokeWidth={3}
                      dot={{ fill: currentObservation?.color || '#0052cc', r: 6 }}
                      activeDot={{ r: 8 }}
                      name={currentObservation?.label || 'Value'}
                      isAnimationActive={true}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Average"
                    />
                    <Line
                      type="monotone"
                      dataKey="max"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Max"
                    />
                    <Line
                      type="monotone"
                      dataKey="min"
                      stroke="#f97316"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Min"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Radar Chart */}
            <div className="w-full">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Weekly Statistics by Measure
              </h3>
              <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <PolarGrid stroke="#e2e8f0" opacity={0.5} />
                    <PolarAngleAxis
                      dataKey="type"
                      stroke="#94a3b8"
                      style={{ fontSize: '12px' }}
                    />
                    <PolarRadiusAxis
                      stroke="#94a3b8"
                      style={{ fontSize: '11px' }}
                    />
                    <Radar
                      name="Average"
                      dataKey="avg"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.15}
                    />
                    <Radar
                      name="Max"
                      dataKey="max"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.15}
                    />
                    <Radar
                      name="Min"
                      dataKey="min"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.15}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Observation and Upload Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Events and Observations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Observations Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observations</CardTitle>
              <CardDescription>Your recorded measurements</CardDescription>
            </CardHeader>
            <CardContent>
              {savedObservations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Type</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Value</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedObservations.slice(0, 10).map((obs) => (
                        <tr key={obs.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{obs.customType || obs.type}</td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{obs.value} {obs.unit}</td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{obs.date}</td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400 truncate">{obs.comment || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p className="text-sm">No observations yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Life Events Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Life Events</CardTitle>
              <CardDescription>Your health milestones and events</CardDescription>
            </CardHeader>
            <CardContent>
              {savedEvents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Event</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Date & Time</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Tags</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Attachments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedEvents.slice(0, 10).map((event) => (
                        <tr key={event.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-2 px-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">{event.customType || event.type}</p>
                                {event.comment && <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate">"{event.comment}"</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{event.date} {event.time}</td>
                          <td className="py-2 px-3">
                            {event.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {event.tags.slice(0, 2).map((tag, idx) => (
                                  <span key={idx} className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                    {tag}
                                  </span>
                                ))}
                                {event.tags.length > 2 && <span className="text-xs text-slate-500">+{event.tags.length - 2}</span>}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {(event.attachments.videos.length > 0 || event.attachments.letters.length > 0 || event.attachments.photos.length > 0) ? (
                              <div className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                                {event.attachments.videos.length > 0 && <span>📹 {event.attachments.videos.length}</span>}
                                {event.attachments.letters.length > 0 && <span>📄 {event.attachments.letters.length}</span>}
                                {event.attachments.photos.length > 0 && <span>📷 {event.attachments.photos.length}</span>}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p className="text-sm">No events yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Observation Modal */}
      <AddObservation
        isOpen={isAddObservationOpen}
        onClose={() => setIsAddObservationOpen(false)}
        onSubmit={handleAddObservation}
      />

      {/* Add Event Modal */}
      <AddEvent
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onSubmit={handleAddEvent}
      />

      {/* Add Measure Modal */}
      <AddMeasure
        isOpen={isAddMeasureOpen}
        onClose={() => setIsAddMeasureOpen(false)}
        onSubmit={handleAddMeasure}
      />
    </div>
  );
}
