import { useState } from 'react';
import { Mail, Users, UserPlus, ClipboardList, Share2 } from 'lucide-react';
import { toast } from '../components/ui/sonner';
import { useAuth } from '../contexts/AuthContext';

const CARE_ROLES = ['Parent', 'Sibling', 'Child', 'Friend'] as const;
export type CareRole = (typeof CARE_ROLES)[number];

interface CareGroupMember {
  id: string;
  name: string;
  email: string;
  role: CareRole;
  invitedForQuestionnaires: boolean;
  invitedForSharing: boolean;
}

export function CareGroup() {
  const { user } = useAuth();
  const [members, setMembers] = useState<CareGroupMember[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CareRole>('Parent');
  const [inviteQuestionnaires, setInviteQuestionnaires] = useState(true);
  const [inviteSharing, setInviteSharing] = useState(false);

  if (!user) return null;

  const handleAddMember = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    const newMember: CareGroupMember = {
      id: crypto.randomUUID(),
      name: inviteName || inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      invitedForQuestionnaires: inviteQuestionnaires,
      invitedForSharing: inviteSharing,
    };

    setMembers((prev) => [...prev, newMember]);
    toast.success(`Invitation sent to ${inviteEmail}`);

    setInviteName('');
    setInviteEmail('');
    setInviteRole('Parent');
    setInviteQuestionnaires(true);
    setInviteSharing(false);
    setShowInviteForm(false);
  };

  const toggleMemberPermission = (id: string, field: 'invitedForQuestionnaires' | 'invitedForSharing') => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, [field]: !m[field] }
          : m
      )
    );
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success('Care group member removed');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Care Group</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a care group of family and friends who can help you by completing questionnaires or viewing selected parts of your record.
        </p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Your Care Group
        </h2>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Invite to Care Group
        </button>
      </div>

      {showInviteForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name (optional)</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Mom, Alex"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="person@example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as CareRole)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                {CARE_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">What can they help with?</label>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={inviteQuestionnaires}
                    onChange={(e) => setInviteQuestionnaires(e.target.checked)}
                  />
                  <span className="flex items-center gap-1">
                    <ClipboardList className="w-4 h-4" />
                    Complete questionnaires on my behalf
                  </span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={inviteSharing}
                    onChange={(e) => setInviteSharing(e.target.checked)}
                  />
                  <span className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    Link and share selected details
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddMember}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Mail className="w-4 h-4" />
              Send Invitation
            </button>
            <button
              onClick={() => setShowInviteForm(false)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.length === 0 ? (
          <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No care group members yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Invite parents, siblings, children, or friends to join your care group.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              They can help by completing questionnaires and viewing only the information you choose to share.
            </p>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Role: {member.role}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium">Permissions</p>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.invitedForQuestionnaires}
                    onChange={() => toggleMemberPermission(member.id, 'invitedForQuestionnaires')}
                  />
                  <span className="flex items-center gap-1">
                    <ClipboardList className="w-4 h-4" />
                    Can complete questionnaires I assign
                  </span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.invitedForSharing}
                    onChange={() => toggleMemberPermission(member.id, 'invitedForSharing')}
                  />
                  <span className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    Can view selected details I share
                  </span>
                </label>
              </div>

              <button
                onClick={() => removeMember(member.id)}
                className="mt-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors self-start"
              >
                Remove from care group
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
