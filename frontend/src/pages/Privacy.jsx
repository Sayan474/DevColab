import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#070709] text-zinc-300 font-sans py-20 px-6 relative">
      <div className="absolute inset-0 glowing-grid pointer-events-none opacity-40" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative z-10">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg font-black">D</span>
            </div>
            <h1 className="text-2xl font-black text-white">Privacy Policy</h1>
          </div>
          <Link to="/signup" className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            <ArrowLeft size={16} />
            Back to Signup
          </Link>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          <p className="text-xs text-zinc-500">Last Updated: June 25, 2026</p>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Information We Collect</h2>
            <p>
              We collect your name, email address, profile preferences, and account credentials. In addition, we store project contents, collaborative wiki documents, and shared code snippets created in your workspace.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Cookies and Local Storage</h2>
            <p>
              We use secure cookies (httpOnly) for session authentication. Local storage is used to persist theme configurations and lightweight tokens for WebSocket connections.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Socket Connections and Real-time data</h2>
            <p>
              Real-time workspace state propagation uses secure WebSocket connections. Active collaborative sessions transmit client events (e.g. cursor moves, task movements) in real-time. This dynamic telemetry is not stored long-term.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. AI Processing</h2>
            <p>
              When utilizing the integrated AI chat and helper tools, code blocks and text prompts are securely transmitted to backend AI APIs for real-time response generation. This data is not cached or used to train third-party models.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Data Deletion</h2>
            <p>
              Workspace administrators may request deletion of all workspace telemetry, projects, wikis, and member accounts at any time from the Workspace Settings panel.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
