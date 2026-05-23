import { useState } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { Button, Input, Avatar, Badge } from '../../components/ui';
import { cn } from '../../assets/utils';
import { useWorkspace } from '../../context/useWorkspace';
import api, { unwrap } from '../../lib/api';
import { 
  Settings, 
  Users, 
  CreditCard, 
  Shield, 
  Trash2, 
  Plus
} from 'lucide-react';

const WorkspaceSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const { currentWorkspace, setCurrentWorkspace } = useWorkspace();
    const [members, setMembers] = useState(currentWorkspace?.members || []);
    const [form, setForm] = useState({ name: currentWorkspace?.name || '', slug: currentWorkspace?.slug || '' });

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'members', label: 'Members', icon: Users },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    const loadMembers = async () => {
        if (!currentWorkspace) return;
        const data = unwrap(await api.get(`/workspaces/${currentWorkspace._id || currentWorkspace.id}/members`));
        setMembers(data.members || []);
    };

    const saveWorkspace = async () => {
        const data = unwrap(await api.put(`/workspaces/${currentWorkspace._id || currentWorkspace.id}`, form));
        setCurrentWorkspace(data.workspace);
    };

    return (
        <PageShell breadcrumbs={['Settings', 'Workspace']}>
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-64 flex flex-col gap-1">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                                activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-500 hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-8 animate-fade-in">
                    {activeTab === 'general' && (
                        <div className="space-y-8">
                            <section className="space-y-6">
                                <h2 className="text-2xl font-bold">General Settings</h2>
                                <div className="surface p-8 rounded-2xl space-y-6 border">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-bold">{currentWorkspace?.name?.charAt(0) || 'D'}</div>
                                        <div className="space-y-2">
                                            <Button variant="secondary" size="sm">Change Logo</Button>
                                            <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Input label="Workspace Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                                        <Input label="Workspace Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
                                    </div>
                                    <div className="pt-4 border-t dark:border-dark-border">
                                        <Button onClick={saveWorkspace}>Save Changes</Button>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="surface p-8 rounded-2xl border border-danger/30 bg-danger/5">
                                    <h3 className="text-lg font-bold text-danger mb-2">Delete Workspace</h3>
                                    <p className="text-sm text-gray-500 mb-6">Once you delete a workspace, there is no going back. Please be certain.</p>
                                    <Button variant="danger" size="sm">Delete this workspace</Button>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Team Members</h2>
                                <Button className="gap-2" onClick={loadMembers}><Plus size={18} /> Refresh Members</Button>
                            </div>
                            <div className="surface rounded-2xl border overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-black/20 dark:bg-white/5 border-b dark:border-dark-border">
                                        <tr>
                                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-500">Member</th>
                                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-500">Role</th>
                                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-500">Joined</th>
                                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-500"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-dark-border">
                                        {members.map(member => {
                                            const u = member.userId || member;
                                            return (
                                            <tr key={u._id || u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar src={u.avatar} size="sm" />
                                                        <div>
                                                            <p className="font-bold">{u.name}</p>
                                                            <p className="text-xs text-gray-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={member.role === 'owner' ? 'primary' : 'default'} className="capitalize">{member.role}</Badge>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Now'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-gray-500 hover:text-white"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold">Billing & Usage</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="surface p-6 rounded-2xl border highlight-primary group">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Current Plan</h3>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-3xl font-bold">Starter</span>
                                        <span className="text-gray-500">Free</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-6">Perfect for small teams getting started.</p>
                                    <Button onClick={() => window.location.href = '/upgrade'} className="w-full">Upgrade to Pro</Button>
                                </div>
                                <div className="surface p-6 rounded-2xl border">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Usage</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span>Projects</span>
                                                <span>3 / 3</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-dark-border rounded-full overflow-hidden">
                                                <div className="h-full bg-danger w-full" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span>Members</span>
                                                <span>5 / 10</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-dark-border rounded-full overflow-hidden">
                                                <div className="h-full bg-primary w-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageShell>
    );
};

export default WorkspaceSettings;
