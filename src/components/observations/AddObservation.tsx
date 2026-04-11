import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { XIcon } from 'lucide-react';

type PredefinedType = 'activity' | 'sleep' | 'fatigue' | 'pain';

interface AddObservationFormData {
  type: PredefinedType | 'custom';
  customType?: string;
  customUnit?: string;
  value: string;
  comment: string;
  date: string;
}

interface AddObservationProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddObservationFormData) => void;
}

const predefinedTypes: { id: PredefinedType; label: string; unit: string }[] = [
  { id: 'activity', label: 'Activity', unit: 'steps' },
  { id: 'sleep', label: 'Sleep', unit: 'hours' },
  { id: 'fatigue', label: 'Fatigue', unit: 'level (0-10)' },
  { id: 'pain', label: 'Pain', unit: 'level (0-10)' },
];

export function AddObservation({ isOpen, onClose, onSubmit }: AddObservationProps) {
  const [formData, setFormData] = useState<AddObservationFormData>({
    type: 'activity',
    customType: '',
    customUnit: '',
    value: '',
    comment: '',
    date: new Date().toISOString().split('T')[0],
  });

  console.log('AddObservation component rendered with isOpen:', isOpen);

  const handleChange = (field: keyof AddObservationFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.value) {
      alert('Please enter a value');
      return;
    }

    if (formData.type === 'custom' && !formData.customType) {
      alert('Please enter a custom observation type');
      return;
    }

    onSubmit(formData);

    // Reset form
    setFormData({
      type: 'activity',
      customType: '',
      customUnit: '',
      value: '',
      comment: '',
      date: new Date().toISOString().split('T')[0],
    });

    onClose();
  };

  const selectedPredefinedType = predefinedTypes.find((t) => t.id === formData.type);
  const unit =
    formData.type === 'custom' ? formData.customUnit : selectedPredefinedType?.unit || '';

  console.log('AddObservation rendering with isOpen:', isOpen);

  if (!isOpen) return null;

  console.log('Modal portal is about to render');

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Add New Observation
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Record a new health observation with optional comments
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
          {/* Date */}
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

          {/* Observation Type Selection - Dropdown */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Observation Type
            </label>
            <select
              value={formData.type === 'custom' ? 'custom' : formData.type}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  handleChange('type', 'custom');
                } else {
                  handleChange('type', e.target.value as PredefinedType);
                }
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {predefinedTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} ({type.unit})
                </option>
              ))}
              <option value="custom">+ Custom Observation</option>
            </select>
          </div>

          {/* Custom Type Input */}
          {formData.type === 'custom' && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Observation Type Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Headaches, Mood, Weight"
                  value={formData.customType}
                  onChange={(e) => handleChange('customType', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Unit of Measurement
                </label>
                <input
                  type="text"
                  placeholder="e.g., mg, kg, level (0-10), yes/no"
                  value={formData.customUnit}
                  onChange={(e) => handleChange('customUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>
          )}

          {/* Value Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Value {unit && `(${unit})`}
            </label>
            <input
              type="text"
              placeholder="Enter measurement value"
              value={formData.value}
              onChange={(e) => handleChange('value', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Add any additional context or observations..."
              value={formData.comment}
              onChange={(e) => handleChange('comment', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Observation
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
