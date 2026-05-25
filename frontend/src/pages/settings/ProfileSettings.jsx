import { useRef, useState } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { Button, Input, Avatar } from '../../components/ui';
import { 
  GitBranch as Github,
  Bird as Twitter, 
  Lock, 
  Camera,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import api, { unwrap } from '../../lib/api';

const ProfileSettings = () => {
    const { user, setUser, logout } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        githubUrl: user?.githubUrl || '',
        twitterUrl: user?.twitterUrl || '',
        avatar: user?.avatar || '',
    });
    const fileInputRef = useRef(null);

    const save = async () => {
        const data = unwrap(await api.put('/users/profile', form));
        setUser(data.user);
    };

    const handleAvatarSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            setForm((prev) => ({ ...prev, avatar: String(reader.result || '') }));
        };
        reader.readAsDataURL(file);
    };

    const normalizeUrl = (value) => {
        if (!value) return '';
        if (/^https?:\/\//i.test(value)) return value;
        return `https://${value}`;
    };

    return (
        <PageShell breadcrumbs={['Settings', 'Profile']}>
            <div className="max-w-4xl mx-auto space-y-10 pb-20">
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold">Profile</h2>
                    <div className="surface p-10 rounded-2xl border space-y-8">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="relative group">
                                <Avatar src={form.avatar || user?.avatar} size="lg" className="w-32 h-32 border-4" />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Camera size={24} className="text-white" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarSelect}
                                />
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input label="Full Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                                    <Input label="Email" value={user?.email || ''} readOnly className="opacity-70 bg-black/20" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500">Bio</label>
                                    <textarea 
                                        className="w-full bg-black/10 dark:bg-white/5 border border-dark-border rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-primary h-24"
                                        value={form.bio}
                                        onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t dark:border-dark-border flex justify-end">
                            <Button onClick={save}>Save Profile</Button>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Github size={20} /> Social Accounts</h2>
                    <div className="surface p-8 rounded-2xl border space-y-4">
                        <div className="space-y-3 p-4 rounded-xl border border-dark-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Github size={24} />
                                    <div>
                                        <p className="font-bold">GitHub</p>
                                        <p className="text-xs text-gray-500">{form.githubUrl ? 'Connected' : 'Not connected'}</p>
                                    </div>
                                </div>
                                {form.githubUrl && (
                                    <a
                                        href={normalizeUrl(form.githubUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-primary"
                                    >
                                        Open
                                    </a>
                                )}
                            </div>
                            <Input
                                label="GitHub Profile URL"
                                placeholder="https://github.com/yourname"
                                value={form.githubUrl}
                                onChange={(e) => setForm((p) => ({ ...p, githubUrl: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-3 p-4 rounded-xl border border-dark-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Twitter size={24} className="text-gray-500" />
                                    <div>
                                        <p className="font-bold">Twitter</p>
                                        <p className="text-xs text-gray-500">{form.twitterUrl ? 'Connected' : 'Not connected'}</p>
                                    </div>
                                </div>
                                {form.twitterUrl && (
                                    <a
                                        href={normalizeUrl(form.twitterUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-primary"
                                    >
                                        Open
                                    </a>
                                )}
                            </div>
                            <Input
                                label="Twitter Profile URL"
                                placeholder="https://x.com/yourname"
                                value={form.twitterUrl}
                                onChange={(e) => setForm((p) => ({ ...p, twitterUrl: e.target.value }))}
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Lock size={20} /> Security</h2>
                    <div className="surface p-8 rounded-2xl border space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input label="New Password" type="password" placeholder="••••••••" />
                            <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                        </div>
                        <div className="pt-4 border-t dark:border-dark-border flex justify-between items-center">
                            <p className="text-xs text-gray-500 italic">Last changed 3 months ago</p>
                            <Button variant="secondary">Update Password</Button>
                        </div>
                    </div>
                </section>

                 <section className="pt-10 flex border-t dark:border-dark-border justify-center">
                    <Button variant="ghost" onClick={logout} className="text-danger flex items-center gap-2 hover:bg-danger/10">
                        <LogOut size={18} /> Sign Out of All Devices
                    </Button>
                </section>
            </div>
        </PageShell>
    );
};

export default ProfileSettings;
