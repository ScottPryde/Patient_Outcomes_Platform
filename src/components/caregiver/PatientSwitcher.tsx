import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown, User } from 'lucide-react';
import { useState } from 'react';

export function PatientSwitcher() {
  const { linkedPatients, activePatientId, activePatient, switchPatient } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (linkedPatients.length === 0) {
    return (
      <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
        No linked patients. Visit your profile to link patients.
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-200 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
      >
        <User className="w-4 h-4" />
        <span className="text-sm font-medium">
          {activePatient 
            ? `${activePatient.firstName} ${activePatient.lastName}`
            : 'Select Patient'
          }
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
            <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Switch Patient View
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              {linkedPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    switchPatient(patient.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                    ${patient.id === activePatientId ? 'bg-purple-50 dark:bg-purple-900/20' : ''}
                  `}
                >
                  <div className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {patient.relationship} • {patient.accessLevel}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
