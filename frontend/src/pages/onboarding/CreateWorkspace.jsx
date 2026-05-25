import React, { useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Upload, X, Users, CreditCard, Check } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { cn } from "../../assets/utils";
import { useWorkspace } from "../../context/useWorkspace";

const CreateWorkspace = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef(null);
  const { createWorkspace, createProject } = useWorkspace();
  const navigate = useNavigate();
  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  const addEmail = (e) => {
    e.preventDefault();
    if (emailInput && !emails.includes(emailInput)) {
      setEmails([...emails, emailInput]);
      setEmailInput('');
    }
  };
  const removeEmail = (email) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleLogoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file for the logo.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(String(reader.result || ''));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const completeSetup = async () => {
    setSubmitting(true);
    setError("");
    try {
      const payload = { name };
      if (logoPreview) payload.avatar = logoPreview;
      const workspace = await createWorkspace(payload);
      await createProject({ workspaceId: workspace._id || workspace.id, name: "DevCollab Platform", description: "Your first collaboration project", color: "#3B82F6" });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create workspace");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center surface p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-dark-border -translate-y-1/2 -z-0" />
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-all duration-500",
                step >= s ? "bg-primary text-white" : "bg-dark-surface text-gray-500 border border-dark-border"
              )}
            >
              {step > s ? <Check size={16} /> : s}
            </div>
          ))}
        </div>
         <div className="space-y-8 animate-fade-in">
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">{error}</p>}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Create your workspace</h2>
                <p className="text-gray-500">This is where your team's projects will live.</p>
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-2xl bg-dark-border border border-dashed border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors overflow-hidden"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Workspace logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-500" />
                        <span className="text-[10px] font-bold uppercase text-gray-500">Upload Logo</span>
                      </>
                    )}
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="absolute -top-2 -right-2 bg-dark-surface border border-dark-border text-gray-400 hover:text-white rounded-full w-6 h-6 flex items-center justify-center"
                      aria-label="Remove logo"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoSelect}
                  />
                </div>
                <div className="w-full space-y-4">
                  <Input 
                    label="Workspace Name" 
                    placeholder="Acme Corp" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Workspace URL</label>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm whitespace-nowrap">devcollab.com/</span>
                        <Input 
                            placeholder="my-workspace" 
                            className="flex-1"
                            value={name.toLowerCase().replace(/\s+/g, '-')}
                            readOnly
                        />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Invite your team</h2>
                <p className="text-gray-500">Collaborate with your coworkers in real-time.</p>
              </div>
              <form onSubmit={addEmail} className="flex gap-2">
                <Input 
                    placeholder="Enter email address..." 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    type="email"
                />
                <Button type="submit" variant="secondary">Add</Button>
              </form>
              <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-black/10 dark:bg-white/5 rounded-xl border border-dark-border">
                {emails.length === 0 && <p className="text-gray-500 text-sm m-auto">No invites added yet.</p>}
                {emails.map(email => (
                  <div key={email} className="bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {email}
                    <X size={14} className="cursor-pointer" onClick={() => removeEmail(email)} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Pick a plan</h2>
                <p className="text-gray-500">Choose the best fit for your team size.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <div className="surface p-6 rounded-2xl border-2 border-transparent hover:border-dark-border transition-all cursor-pointer group">
                    <h3 className="text-xl font-bold mb-1">Starter</h3>
                    <p className="text-gray-500 text-sm mb-4">For individuals & small teams</p>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold">$0</span>
                        <span className="text-gray-500">/mo</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-3 text-sm text-gray-400">
                            <Check size={16} className="text-success" /> Up to 3 projects
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-400">
                            <Check size={16} className="text-success" /> 5 team members
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-400">
                            <X size={16} className="text-danger" /> AI Assistant
                        </li>
                    </ul>
                    <Button variant="secondary" className="w-full">Choose Starter</Button>
                </div>
                {/* Pro Plan */}
                <div className="bg-primary/10 border-2 border-primary p-6 rounded-2xl relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">Popular</div>
                    <h3 className="text-xl font-bold mb-1 text-primary">Pro Team</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Everything in Starter, plus more.</p>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold text-primary">$19</span>
                        <span className="text-gray-500">/mo</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-3 text-sm">
                            <Check size={16} className="text-primary" /> Unlimited projects
                        </li>
                        <li className="flex items-center gap-3 text-sm">
                            <Check size={16} className="text-primary" /> Unlimited members
                        </li>
                        <li className="flex items-center gap-3 text-sm">
                            <Check size={16} className="text-primary" /> Advanced AI Support
                        </li>
                    </ul>
                    <Button className="w-full">Upgrade to Pro</Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between pt-8">
            <Button 
                variant="ghost" 
                onClick={prevStep} 
                className={cn("gap-2", step === 1 && "invisible")}
            >
              <ChevronLeft size={18} /> Back
            </Button>
            <Button 
                onClick={
                step === 3
                  ? completeSetup
                  : nextStep
              }
              className="gap-2"
              disabled={(step === 1 && !name) || submitting}
            >
              {step === 3 ? (submitting ? "Creating..." : "Complete Setup") : "Continue"}{" "}
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateWorkspace;