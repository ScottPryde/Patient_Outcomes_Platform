import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { XIcon } from 'lucide-react';

type PredefinedEventType =
  | 'Bad night'
  | 'Medication change'
  | 'Missed school/work'
  | 'Hospital visit'
  | 'New symptom'
  | 'Trial visit'
  | 'Physiotherapy session';

interface AddEventFormData {
  type: PredefinedEventType | 'custom';
  customType?: string;
  date: string;
  time: string;
  comment: string;
  videos: File[];
  letters: File[];
  photos: File[];
  tags: string[];
}

interface AddEventProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddEventFormData) => void;
}

const predefinedEventTypes: PredefinedEventType[] = [
  'Bad night',
  'Medication change',
  'Missed school/work',
  'Hospital visit',
  'New symptom',
  'Trial visit',
  'Physiotherapy session',
];

const availableTags = ['fatigue', 'pain', 'medication', 'sleep', 'mobility', 'mood', 'fever', 'nausea'];

export function AddEvent({ isOpen, onClose, onSubmit }: AddEventProps) {
  const [formData, setFormData] = useState<AddEventFormData>({
    type: 'Bad night',
    customType: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    comment: '',
    videos: [],
    letters: [],
    photos: [],
    tags: [],
  });

  const handleChange = (field: keyof Omit<AddEventFormData, 'videos' | 'letters' | 'photos' | 'tags'>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleFileSelect = (type: 'videos' | 'letters' | 'photos', file: File | null) => {
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], file],
      }));
    }
  };

  const handleRemoveFile = (type: 'videos' | 'letters' | 'photos', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type) {
      alert('Please select an event type');
      return;
    }

    if (formData.type === 'custom' && !formData.customType) {
      alert('Please enter a custom event type');
      return;
    }

    onSubmit(formData);

    // Reset form
    setFormData({
      type: 'Bad night',
      customType: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      comment: '',
      videos: [],
      letters: [],
      photos: [],
      tags: [],
    });

    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-lg w-full max-w-[600px] max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Add Life Event
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Record important health events with attachments and tags
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Type Selection - Dropdown */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Event Type
            </label>
            <select
              value={formData.type === 'custom' ? 'custom' : formData.type}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  handleChange('type', 'custom');
                } else {
                  handleChange('type', e.target.value as PredefinedEventType);
                }
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {predefinedEventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="custom">+ Custom Event</option>
            </select>
          </div>

          {/* Custom Event Type Input */}
          {formData.type === 'custom' && (
            <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Event Type Name
              </label>
              <input
                type="text"
                placeholder="e.g., Doctor appointment, MRI scan, Exercise session"
                value={formData.customType}
                onChange={(e) => handleChange('customType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Add any additional context about this event..."
              value={formData.comment}
              onChange={(e) => handleChange('comment', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 resize-none"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Attachments</h3>

            {/* Videos */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                📹 Videos (gait, transfers, facial weakness)
              </label>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach((file) => handleFileSelect('videos', file));
                  }
                }}
                className="block w-full text-xs text-slate-500"
              />
              {formData.videos.length > 0 && (
                <div className="space-y-1">
                  {formData.videos.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('videos', idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Letters */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                📄 Medical Letters
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach((file) => handleFileSelect('letters', file));
                  }
                }}
                className="block w-full text-xs text-slate-500"
              />
              {formData.letters.length > 0 && (
                <div className="space-y-1">
                  {formData.letters.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('letters', idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                📷 Photos (bracing, swelling, posture)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach((file) => handleFileSelect('photos', file));
                  }
                }}
                className="block w-full text-xs text-slate-500"
              />
              {formData.photos.length > 0 && (
                <div className="space-y-1">
                  {formData.photos.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('photos', idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              🏷 Tags (select relevant)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    formData.tags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Event
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
