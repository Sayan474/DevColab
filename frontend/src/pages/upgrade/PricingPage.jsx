import { useState } from "react";
import { PageShell } from "../../components/layout/PageShell";
import { Button, Modal, Input, Avatar } from "../../components/ui";
import { Check, ShieldCheck, Zap, Star } from "lucide-react";

const PricingPage = () => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = () => {
    setIsUpgradeModalOpen(true);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsUpgradeModalOpen(false);
      alert("Upgrade successful! Welcome to Pro.");
    }, 2000);
  };

  return (
    <PageShell breadcrumbs={["Settings", "Upgrade"]}>
      <div className="max-w-6xl mx-auto py-12 space-y-20">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Simple, transparent pricing.
          </h1>
          <p className="text-xl text-gray-500">
            Pick a plan and move faster with your team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Free Plan */}
          <div className="surface p-10 rounded-3xl border space-y-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-dark-border flex items-center justify-center text-gray-500">
                  <Star size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Starter</h3>
                  <p className="text-gray-500">Best for small experiments</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-gray-500">/ forever</span>
              </div>
              <ul className="space-y-4">
                {[
                  "Up to 3 active projects",
                  "5 team members",
                  "Standard project board",
                  "Snippet sharing",
                  "Community support",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400">
                    <Check size={18} className="text-success flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="secondary" className="w-full py-4 text-lg">
              Current Plan
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-primary/10 border-4 border-primary p-10 rounded-3xl space-y-8 flex flex-col justify-between relative overflow-hidden hover:scale-[1.02] transition-transform duration-500 group shadow-2xl shadow-primary/20">
            <div className="absolute top-6 right--10 bg-primary text-white px-10 py-1 rotate-45 text-xs font-bold uppercase tracking-widest">
              Best Value
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">Pro Team</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    For high-performance teams
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-primary">$19</span>
                <span className="text-gray-500">/ member / month</span>
              </div>
              <ul className="space-y-4">
                {[
                  "Unlimited active projects",
                  "Unlimited team members",
                  "Advanced AI Assistant",
                  "AI Code Reviewer",
                  "Custom Wiki branding",
                  "Priority 24/7 support",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check size={18} className="text-primary flex-shrink-0" />
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button className="w-full py-4 text-lg" onClick={handleUpgrade}>
              Upgrade to Pro
            </Button>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8 pt-20 border-t dark:border-dark-border">
          {[
            {
              name: "Sarah Chen",
              role: "CTO @ Flux",
              text: "DevCollab transformed our workflow. The AI code reviewer alone saves us hours every week.",
            },
            {
              name: "Mark Wilson",
              role: "Engineering Lead",
              text: "Best engineering dashboard I've used. Clean, fast, and stays out of the way.",
            },
            {
              name: "Emily Blunt",
              role: "Product Manager",
              text: "The real-time wiki is a game changer for our documentation process. Highly recommended.",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="surface p-6 rounded-2xl italic text-gray-400 text-sm border"
            >
              <p className="mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3 not-italic">
                <Avatar
                  src={`https://ui-avatars.com/api/?name=${t.name.replace(" ", "+")}`}
                  size="xs"
                />
                <div>
                  <p className="font-bold text-gray-100">{t.name}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock Checkout Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Checkout"
        footer={
          <Button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Pay $19.00"}
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-center justify-between mb-4">
            <span className="font-bold">Pro Team Plan</span>
            <span className="font-bold text-primary">$19.00/mo</span>
          </div>
          <Input label="Card Number" placeholder="4242 4242 4242 4242" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Expiry Date" placeholder="MM/YY" />
            <Input label="CVC" placeholder="123" />
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 pt-2">
            <ShieldCheck size={14} className="text-success" />
            <span>Secure encrypted payment via Stripe</span>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default PricingPage;
