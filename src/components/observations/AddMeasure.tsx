import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { XIcon, ChevronDown } from 'lucide-react';

interface AddMeasureFormData {
  name: string;
  unit: string;
  color: string;
}

interface AddMeasureProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddMeasureFormData) => void;
}

const colorOptions = [
  { name: 'Blue', value: '#0052cc' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
];

export function AddMeasure({ isOpen, onClose, onSubmit }: AddMeasureProps) {
  const [formData, setFormData] = useState<AddMeasureFormData>({
    name: '',
    unit: '',
    color: '#0052cc',
  });
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const handleChange = (field: keyof AddMeasureFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a measure name');
      return;
    }

    if (!formData.unit.trim()) {
      alert('Please enter a unit of measurement');
      return;
    }

    onSubmit(formData);

    // Reset form
    setFormData({
      name: '',
      unit: '',
      color: '#0052cc',
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
      <div className="relative bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Add New Measure
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create a custom observation measure to track
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Measure Name */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Measure Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Heart Rate, Blood Pressure, Weight"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Unit of Measurement */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Unit of Measurement
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              placeholder="e.g., bpm, mmHg, kg"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color Selection */}
          <div>
            <button
              type="button"
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>Chart Color</span>
                <div
                  className="w-4 h-4 rounded border border-slate-300 dark:border-slate-500"
                  style={{ backgroundColor: formData.color }}
                />
              </div>
              <ChevronDown className={`w-3 h-3 transition-transform ${colorPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {colorPickerOpen && (
              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg">
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleChange('color', option.value)}
                      className={`w-8 h-8 rounded transition-all ${
                        formData.color === option.value
                          ? 'ring-2 ring-slate-400 dark:ring-slate-500 ring-offset-1 scale-105'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: option.value }}
                      title={option.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              Create Measure
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
