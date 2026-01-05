import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Check, X, Clock, Shield } from 'lucide-react';
import { toast } from '../components/ui/sonner';

export function CaregiverLinking() {
  const { user, linkedPatients } = useAuth();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<'full' | 'limited' | 'read-only'>('full');

  // Mock pending requests
  const [pendingRequests] = useState([
    {
      id: 'req-1',
      caregiverName: 'Michael Johnson',
      caregiverEmail: 'caregiver@example.com',
      requestedAt: '2024-03-10T10:00:00Z',
      accessLevel: 'full' as const,
    },
  ]);

  const handleSendInvite = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }
    
    toast.success(`Invitation sent to ${inviteEmail}`);
    setShowInviteForm(false);
    setInviteEmail('');
  };

  const handleApproveRequest = (requestId: string) => {
    toast.success('Access request approved');
  };

  const handleDenyRequest = (requestId: string) => {
    toast.success('Access request denied');
  };

  const handleRevokeAccess = (patientId: string) => {
    toast.success('Access revoked');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Caregiver Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {user.role === 'caregiver' 
            ? 'Manage your linked patients and access permissions'
            : 'Manage who can access your health information'}
        </p>
      </div>

      {user.role === 'caregiver' ? (
        // Caregiver view
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold">Linked Patients</h2>
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Request Access
            </button>
          </div>

          {showInviteForm && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="font-medium mb-4">Request Patient Access</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Patient Email
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Access Level
                  </label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  >
                    <option value="full">Full Access - Complete questionnaires and manage consents</option>
                    <option value="limited">Limited Access - View results and complete select questionnaires</option>
                    <option value="read-only">Read Only - View information only</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSendInvite}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Send Request
                  </button>
                  <button
                    onClick={() => setShowInviteForm(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedPatients.length === 0 ? (
              <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <UserPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Linked Patients</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Request access to start managing care for a patient
                </p>
              </div>
            ) : (
              linkedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {patient.relationship}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full capitalize">
                      {patient.accessLevel.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span>Access Level: {patient.accessLevel}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeAccess(patient.id)}
                    className="w-full mt-4 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Revoke Access
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Patient view
        <div className="space-y-6">
          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="font-semibold mb-4">Pending Access Requests</h2>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{request.caregiverName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.caregiverEmail}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm rounded-full capitalize">
                        {request.accessLevel} Access
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      This person has requested {request.accessLevel} access to your health information.
                      They will be able to view your results and complete questionnaires on your behalf.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <Check className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDenyRequest(request.id)}
                        className="flex items-center gap-2 px-6 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <X className="w-5 h-5" />
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authorized caregivers */}
          <div>
            <h2 className="font-semibold mb-4">Authorized Caregivers</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Authorized Caregivers</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't authorized any caregivers yet
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
