import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  MoreVertical,
  Check,
  X,
  Sparkles,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const TeamView: React.FC = () => {
  const { language, t, currentOrganization } = useApp();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviteDepartment, setInviteDepartment] = useState('الهندسة والأتمتة');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.getTeamMembers();
      setMembers(res.members || []);
    } catch (err: any) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentOrganization?.id]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.inviteMember({
        name: inviteName.trim() || inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        role: inviteRole,
        department: inviteDepartment
      });
      if (res.success && res.member) {
        setMembers((prev) => [...prev, res.member]);
        setIsInviteOpen(false);
        setInviteName('');
        setInviteEmail('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to invite member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await api.updateMemberRole(memberId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (err: any) {
      console.error('Failed to update role:', err);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm(t('هل أنت متأكد من إزالة هذا العضو من المؤسسة؟', 'Remove this member from organization?'))) return;
    try {
      await api.removeMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err: any) {
      console.error('Failed to remove member:', err);
    }
  };

  return (
    <div id="team_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>{t('إدارة الفريق والصلاحيات المتعددة (RBAC)', 'Role-Based Access Control (RBAC)')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('أعضاء المؤسسة والصلاحيات (Team & Roles)', 'Tenant Team Members & Roles')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              `مؤسسة: ${currentOrganization?.nameAr || currentOrganization?.name || 'مؤسستك'} • إدارة الصلاحيات والعزل التام للبيانات.`,
              `Organization: ${currentOrganization?.name || 'Your Tenant'} • Real multi-tenant isolated access.`
            )}
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('دعوة عضو جديد', 'Invite Member')}</span>
        </button>
      </div>

      {/* Members Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
            <span>{t('جاري جلب أعضاء المؤسسة...', 'Loading team members...')}</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                    alt={m.name}
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{m.name}</span>
                      {m.department && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({m.department})
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">{m.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="owner">المالك (Owner)</option>
                    <option value="admin">مدير (Admin)</option>
                    <option value="manager">مشرف (Manager)</option>
                    <option value="editor">محرر (Editor)</option>
                    <option value="viewer">مشاهد (Viewer)</option>
                  </select>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      m.status === 'active' || m.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {m.status || 'Active'}
                  </span>

                  {m.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(m.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title={t('إزالة العضو', 'Remove Member')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('دعوة عضو جديد لفريق العمل', 'Invite Team Member')}
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('اسم العضو', 'Full Name')}
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="محمد العتيبي"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('البريد الإلكتروني للزميل', 'Email Address')}
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('القسم / الإدارة', 'Department')}
                </label>
                <input
                  type="text"
                  value={inviteDepartment}
                  onChange={(e) => setInviteDepartment(e.target.value)}
                  placeholder="خدمة العملاء أو المبيعات"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('الدور والصلاحيات (Role)', 'Role & Permissions')}
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="admin">مدير (Admin - صلاحيات كاملة)</option>
                  <option value="manager">مشرف (Manager - تعديل وقراءة وتنفيذ)</option>
                  <option value="editor">محرر أتمتة (Editor - بناء وتعديل Workflows)</option>
                  <option value="viewer">مشاهد فقط (Viewer - استعراض التقارير فقط)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsInviteOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                onClick={handleInvite}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{t('إرسال الدعوة', 'Send Invitation')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
