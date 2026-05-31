import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/layout/PageShell';
import { Button, Input, Avatar, Badge } from '../../components/ui';
import { cn } from '../../assets/utils';
import { useWorkspace } from '../../context/useWorkspace';
import { useAuth } from '../../context/useAuth';
import api, { unwrap } from '../../lib/api';
import {
  Settings,
  Users,
  CreditCard,
  Shield,
  Trash2,
  Plus,
  Mail,
  Send,
  RefreshCw,
  Upload,
} from 'lucide-react';

const ROLES = ['member', 'admin', 'viewer'];

const WorkspaceSettings = () => {
  const navigate = useNavigate();
  const { currentWorkspace, setCurrentWorkspace, setWorkspaces } = useWorkspace();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('general');
  const [members, setMembers] = useState(currentWorkspace?.members || []);
  const [form, setForm] = useState({
    name: currentWorkspace?.name || '',
    slug: currentWorkspace?.slug || '',
  });

  // invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState({ text: '', type: '' });

  // general state
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState(false);
  const [logoPreview, setLogoPreview] = useState(currentWorkspace?.avatar || null);

  const workspaceId = currentWorkspace?._id || currentWorkspace?.id;
  const isOwner = currentWorkspace?.members?.find(
    (m) => (m.userId?._id || m.userId) === (user?._id || user?.id) && m.role === 'owner'
  );

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  // ── Load members ──────────────────────────────────────────────
  const loadMembers = async () => {
    if (!workspaceId) return;
    try {
      const data = unwrap(await api.get(`/workspaces/${workspaceId}/members`));
      setMembers(data.members || []);
    } catch {
      // silently fail
    }
  };

  // ── Save workspace name / slug ────────────────────────────────
  const saveWorkspace = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const data = unwrap(await api.put(`/workspaces/${workspaceId}`, form));
      setCurrentWorkspace(data.workspace);
      setSaveMsg('Saved successfully!');
    } catch (err) {
      setSaveMsg(err?.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  // ── Upload logo ───────────────────────────────────────────────
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const data = unwrap(
        await api.put(`/workspaces/${workspaceId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      setCurrentWorkspace(data.workspace);
      setLogoPreview(data.workspace?.avatar || null);
    } catch {
      alert('Logo upload failed. Try again.');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  // ── Delete workspace ──────────────────────────────────────────
  const handleDeleteWorkspace = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${currentWorkspace?.name}"? This cannot be undone.`
    );
    if (!confirmed) return;
    const doubleConfirm = window.prompt(
      `Type the workspace name "${currentWorkspace?.name}" to confirm deletion:`
    );
    if (doubleConfirm !== currentWorkspace?.name) {
      alert('Name did not match. Deletion cancelled.');
      return;
    }
    setDeletingWorkspace(true);
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      setWorkspaces((prev) => prev.filter((w) => (w._id || w.id) !== workspaceId));
      setCurrentWorkspace(null);
      navigate('/onboarding/workspace');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete workspace.');
    } finally {
      setDeletingWorkspace(false);
    }
  };

  // ── Send invite ───────────────────────────────────────────────
  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteMsg({ text: '', type: '' });
    try {
      await api.post('/invites', {
        email: inviteEmail.trim(),
        workspaceId,
        role: inviteRole,
      });
      setInviteMsg({ text: `Invite sent to ${inviteEmail} ✓`, type: 'success' });
      setInviteEmail('');
    } catch (err) {
      setInviteMsg({
        text: err?.response?.data?.message || 'Failed to send invite.',
        type: 'error',
      });
    } finally {
      setInviting(false);
      setTimeout(() => setInviteMsg({ text: '', type: '' }), 4000);
    }
  };

  // ── Remove member ─────────────────────────────────────────────
  const removeMember = async (userId) => {
    if (!window.confirm('Remove this member from the workspace?')) return;
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
      setMembers((prev) =>
        prev.filter((m) => (m.userId?._id || m.userId) !== userId)
      );
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to remove member.');
    }
  };

  // ── Change member role ────────────────────────────────────────
  const changeRole = async (userId, role) => {
    try {
      await api.put(`/workspaces/${workspaceId}/members/${userId}/role`, { role });
      setMembers((prev) =>
        prev.map((m) =>
          (m.userId?._id || m.userId) === userId ? { ...m, role } : m
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to change role.');
    }
  };

  return (
    <PageShell breadcrumbs={[{ label: 'Settings' }, { label: 'Workspace' }]}>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-500 hover:bg-white/5'
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8">

          {/* ── GENERAL ── */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <section className="space-y-6">
                <h2 className="text-2xl font-bold">General Settings</h2>
                <div className="surface p-8 rounded-2xl space-y-6 border border-dark-border">

                  {/* Logo upload */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {logoPreview ? (
                        <img
                          src={logoPreview.startsWith('/uploads')
                            ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${logoPreview}`
                            : logoPreview}
                          alt="workspace logo"
                          className="w-20 h-20 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-bold">
                          {currentWorkspace?.name?.charAt(0) || 'D'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        <Upload size={14} />
                        {uploadingLogo ? 'Uploading...' : 'Change Logo'}
                      </Button>
                      <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>

                  {/* Name & slug */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Workspace Name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />
                    <Input
                      label="Workspace Slug"
                      value={form.slug}
                      onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    />
                  </div>

                  <div className="pt-4 border-t border-dark-border flex items-center gap-4">
                    <Button onClick={saveWorkspace} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    {saveMsg && (
                      <span className={cn('text-sm', saveMsg.includes('success') ? 'text-success' : 'text-danger')}>
                        {saveMsg}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Delete workspace — only owner sees this */}
              {isOwner && (
                <section>
                  <div className="surface p-8 rounded-2xl border border-danger/30 bg-danger/5">
                    <h3 className="text-lg font-bold text-danger mb-2">Delete Workspace</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Once you delete a workspace, there is no going back. All projects, tasks, snippets, and wiki pages will be permanently deleted.
                    </p>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDeleteWorkspace}
                      disabled={deletingWorkspace}
                    >
                      <Trash2 size={14} className="mr-2" />
                      {deletingWorkspace ? 'Deleting...' : 'Delete this workspace'}
                    </Button>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ── MEMBERS ── */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Team Members</h2>
                <Button variant="secondary" size="sm" className="gap-2" onClick={loadMembers}>
                  <RefreshCw size={14} /> Refresh
                </Button>
              </div>

              {/* Invite form */}
              <div className="surface p-6 rounded-2xl border border-dark-border space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={16} className="text-primary" />
                  <h3 className="font-bold">Invite a teammate</h3>
                </div>
                <p className="text-xs text-gray-500">
                  An invite email will be sent from your configured mail address. The recipient clicks the link to join.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    className="input-field flex-1"
                    type="email"
                    placeholder="teammate@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
                  />
                  <select
                    className="input-field w-full sm:w-36"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                  <Button className="gap-2 whitespace-nowrap" onClick={sendInvite} disabled={inviting}>
                    <Send size={14} />
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </Button>
                </div>
                {inviteMsg.text && (
                  <p className={cn('text-sm', inviteMsg.type === 'success' ? 'text-success' : 'text-danger')}>
                    {inviteMsg.text}
                  </p>
                )}
              </div>

              {/* Members table */}
              <div className="surface rounded-2xl border border-dark-border overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/20 dark:bg-white/5 border-b border-dark-border">
                    <tr>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-500">Member</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-500">Role</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-500">Joined</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {members.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                          No members loaded yet. Click Refresh.
                        </td>
                      </tr>
                    )}
                    {members.map((member) => {
                      const u = member.userId || member;
                      const uid = u._id || u.id;
                      const isSelf = uid === (user?._id || user?.id);
                      return (
                        <tr key={uid} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={u.avatar} name={u.name} size="sm" />
                              <div>
                                <p className="font-bold">{u.name} {isSelf && <span className="text-xs text-gray-500">(you)</span>}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {member.role === 'owner' || isSelf ? (
                              <Badge variant={member.role === 'owner' ? 'primary' : 'default'} className="capitalize">
                                {member.role}
                              </Badge>
                            ) : (
                              <select
                                className="input-field py-1 text-xs w-28"
                                value={member.role}
                                onChange={(e) => changeRole(uid, e.target.value)}
                              >
                                {ROLES.map((r) => (
                                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Now'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!isSelf && member.role !== 'owner' && (
                              <button
                                className="text-gray-500 hover:text-danger transition-colors"
                                onClick={() => removeMember(uid)}
                                title="Remove member"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── BILLING ── */}
          {activeTab === 'billing' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">Billing & Usage</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="surface p-6 rounded-2xl border border-dark-border">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Current Plan</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold capitalize">{currentWorkspace?.plan || 'Free'}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Perfect for small teams getting started.</p>
                  <Button onClick={() => navigate('/upgrade')} className="w-full">
                    Upgrade to Pro
                  </Button>
                </div>
                <div className="surface p-6 rounded-2xl border border-dark-border">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Usage</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Projects</span>
                        <span>— / 3</span>
                      </div>
                      <div className="h-1.5 w-full bg-dark-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/3" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Members</span>
                        <span>{members.length} / 5</span>
                      </div>
                      <div className="h-1.5 w-full bg-dark-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min((members.length / 5) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Security</h2>
              <div className="surface p-8 rounded-2xl border border-dark-border text-gray-500 text-sm">
                Security settings coming soon — 2FA, SSO, and session management.
              </div>
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
};

export default WorkspaceSettings;