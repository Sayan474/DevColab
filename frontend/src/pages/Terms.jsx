import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#070709] text-zinc-300 font-sans py-20 px-6 relative">
      <div className="absolute inset-0 glowing-grid pointer-events-none opacity-40" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative z-10">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg font-black">D</span>
            </div>
            <h1 className="text-2xl font-black text-white">Terms of Service</h1>
          </div>
          <Link to="/signup" className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            <ArrowLeft size={16} />
            Back to Signup
          </Link>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          <p className="text-xs text-zinc-500">Last Updated: June 25, 2026</p>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By creating an account, accessing, or using the DevCollab workspace platform, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Description of Service</h2>
            <p>
              DevCollab provides real-time team collaboration tools including Kanban boards, code snippet sharing, documentation wikis, and an integrated AI Assistant.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. User Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your workspace invites, credentials, and passwords. You agree to immediately notify us of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. AI Features & Code Privacy</h2>
            <p>
              DevCollab integrates AI models to suggest code changes, summarize wiki pages, and assist in task creation. By submitting content to the AI, you grant permission to process this input to generate responses. We do not use your proprietary codebase to train public models.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Termination of Workspace</h2>
            <p>
              We reserve the right to suspend or terminate workspaces that violate intellectual property, distribute malware, or abuse the realtime socket infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Limitation of Liability</h2>
            <p>
              DevCollab is provided "as is". We are not liable for any lost data, project delays, or service interruptions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
