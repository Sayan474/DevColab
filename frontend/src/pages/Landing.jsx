import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  Kanban,
  FileCode,
  Sparkles,
  BookOpen,
  ArrowRight,
  Code,
  Shield,
  Zap,
  Globe,
  Terminal
} from "lucide-react";

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const gridRef = useRef(null);

  const scrollTo = (id) => {
  const element = document.getElementById(id);
  if (!element) return;

  const navbarHeight = 95; // adjust if needed

  window.scrollTo({
    top: element.offsetTop - navbarHeight,
    behavior: "smooth",
  });
};

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // Detect touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetOpacity = 0;
    let currentOpacity = 0;
    let frameId = null;

    const handleMouseMove = (e) => {
      const rect = grid.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      
      // Check if mouse is within browser window viewport bounds
      if (
        e.clientX > 0 &&
        e.clientY > 0 &&
        e.clientX < window.innerWidth &&
        e.clientY < window.innerHeight
      ) {
        targetOpacity = 0.85;
      } else {
        targetOpacity = 0;
      }
    };

    const handleMouseLeave = () => {
      targetOpacity = 0;
    };

    const handleMouseOut = (e) => {
      // If the cursor leaves the window entirely
      if (!e.relatedTarget || e.relatedTarget.nodeName === "HTML") {
        targetOpacity = 0;
      }
    };

    const handleWindowBlur = () => {
      targetOpacity = 0;
    };

    const updateCoordinates = () => {
      // Smooth linear interpolation (lerp)
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;
      currentOpacity += (targetOpacity - currentOpacity) * 0.08;

      grid.style.setProperty('--mouse-x', `${currentX}px`);
      grid.style.setProperty('--mouse-y', `${currentY}px`);
      grid.style.setProperty('--glow-opacity', currentOpacity);

      frameId = requestAnimationFrame(updateCoordinates);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('blur', handleWindowBlur);
    frameId = requestAnimationFrame(updateCoordinates);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('blur', handleWindowBlur);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const features = [
    {
      icon: <Kanban className="text-indigo-400" size={24} />,
      title: "Realtime Kanban",
      desc: "Organize, track, and move tasks instantly with your team. Updates propagate in real-time so everyone stays aligned.",
      color: "from-indigo-500/20 to-purple-500/5",
      borderColor: "group-hover:border-indigo-500/50"
    },
    {
      icon: <FileCode className="text-emerald-400" size={24} />,
      title: "Shared Snippets",
      desc: "Save, categorize, and share reusable code snippets with your team. Beautiful syntax highlighting and direct search.",
      color: "from-emerald-500/20 to-teal-500/5",
      borderColor: "group-hover:border-emerald-500/50"
    },
    {
      icon: <BookOpen className="text-blue-400" size={24} />,
      title: "Collaborative Wiki",
      desc: "Document your architecture, APIs, and guides. Write in Markdown, link pages, and build an engineering brain.",
      color: "from-blue-500/20 to-cyan-500/5",
      borderColor: "group-hover:border-blue-500/50"
    },
    {
      icon: <Sparkles className="text-amber-400" size={24} />,
      title: "AI Agent Assistant",
      desc: "Let AI help you write documentation, analyze code snippets, generate task descriptions, and brainstorm ideas.",
      color: "from-amber-500/20 to-orange-500/5",
      borderColor: "group-hover:border-amber-500/50"
    }
  ];

  return (
    <div ref={gridRef} className="min-h-screen bg-[#070709] text-zinc-100 overflow-x-hidden relative font-sans">
      {/* Background Grid Pattern & Glowing Pulsing Lines */}
      <div className="absolute inset-0 glowing-grid pointer-events-none" />
      <div className="ambient-glow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_800px,rgba(139,92,246,0.08),transparent)] pointer-events-none" />

      {/* FLOATING GLOWS */}
      <div className="absolute top-20 left-1/4 w-[40rem] h-[40rem] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[40rem] right-1/4 w-[35rem] h-[35rem] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

      {/* HEADER NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6">
        <div className={`max-w-7xl mx-auto px-6 h-16 flex items-center justify-between transition-all duration-300 rounded-2xl border ${scrolled
            ? "border-white/10 bg-black/40 backdrop-blur-xl shadow-lg shadow-black/30"
            : "border-transparent bg-transparent backdrop-blur-none shadow-none"
          }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-lg font-black">D</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white to-zinc-400">
              DevCollab
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <button onClick={() => scrollTo("features")}>
                Features
            </button>

            <button onClick={() => scrollTo("preview")}>
                Preview
            </button>

            <button onClick={() => scrollTo("tech")}>
                Tech Stack
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 border border-indigo-400/20"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
          Where developer teams <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">
            move fast together.
          </span>
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          DevCollab brings your Kanban boards, shared code snippets, collaborative wikis,
          and a developer-focused AI Assistant into one blazing-fast, cohesive ecosystem.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 border border-indigo-400/20 flex items-center justify-center gap-2 group"
            >
              Enter Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 flex items-center justify-center gap-2 group"
              >
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white font-semibold hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2"
              >
                Log In to Workspace
              </Link>
            </>
          )}
        </div>

        {/* INTERACTIVE BROWSER PREVIEW */}
        <div id="preview" className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-zinc-900/40 p-1.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-950/60 rounded-t-xl">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/50" />
              <span className="w-3 h-3 rounded-full bg-amber-500/50" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/50" />
            </div>
            <div className="text-xs text-zinc-500 font-mono bg-white/5 px-4 py-0.5 rounded-full border border-white/5">
              devcollab.sh/workspace/main
            </div>
            <div className="w-12" />
          </div>

          <div className="bg-zinc-950/80 rounded-b-xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left min-h-[300px]">
            {/* Board Column Mockup */}
            <div className="border border-white/5 bg-white/[0.02] p-4 rounded-xl flex flex-col gap-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">In Progress</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-[10px] text-indigo-300 font-mono">3</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/5 shadow-md flex flex-col gap-2">
                <div className="text-xs font-semibold text-white">Implement WebSockets Sync</div>
                <div className="text-[10px] text-zinc-500">Realtime collaboration triggers</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] text-rose-400 font-bold uppercase">High</span>
                  <span className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[9px] text-white font-bold">U</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/5 shadow-md flex flex-col gap-2">
                <div className="text-xs font-semibold text-white">Create Wiki Page Templates</div>
                <div className="text-[10px] text-zinc-500">Markdown rendering configuration</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] text-emerald-400 font-bold uppercase">Low</span>
                  <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] text-white font-bold">A</span>
                </div>
              </div>
            </div>

            {/* Code Snippet Mockup */}
            <div className="border border-white/5 bg-white/[0.02] p-4 rounded-xl flex flex-col gap-3 md:col-span-2">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Shared Snippet: api-client.ts</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px] text-emerald-300 font-mono">TypeScript</span>
              </div>
              <div className="flex-1 font-mono text-[11px] bg-zinc-900/90 p-3 rounded-lg border border-white/5 text-zinc-400 overflow-x-auto leading-relaxed">
                <div><span className="text-purple-400">const</span> fetchWorkspace = <span className="text-blue-400">async</span> (id: <span className="text-amber-300">string</span>) =&gt; &#123;</div>
                <div className="pl-4"><span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> api.get(<span className="text-emerald-300">`/workspace/&#36;&#123;id&#125;`</span>);</div>
                <div className="pl-4 text-zinc-500">// Realtime updates handles the state propagation</div>
                <div className="pl-4"><span className="text-purple-400">return</span> response.data;</div>
                <div>&#125;;</div>
                <div className="mt-4"><span className="text-purple-400">export default</span> fetchWorkspace;</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Everything developer teams need.
          </h2>
          <p className="text-zinc-400 text-base max-w-xl mx-auto">
            Stop context switching. Bring project management, sharing, and documentation into the same workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="group p-8 rounded-2xl border border-white/5 bg-gradient-to-br bg-zinc-900/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-zinc-900/40 relative overflow-hidden"
            >
              {/* Highlight Background Glow */}
              <div className={`absolute -right-20 -bottom-20 w-44 h-44 rounded-full bg-gradient-to-br ${feat.color} blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK & ATTRIBUTES */}
      <section id="tech" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="group p-8 rounded-2xl border border-white/5 bg-gradient-to-br bg-zinc-900/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-zinc-900/40 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/5 blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors">High Performance</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Built on Vite, React 19, and Node.js for lightning-fast loads and rendering.</p>
            </div>
          </div>
          {/* Card 2 */}
          <div className="group p-8 rounded-2xl border border-white/5 bg-gradient-to-br bg-zinc-900/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-zinc-900/40 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-44 h-44 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/5 blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-300 transition-colors">Secure by Default</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Protected workspace scopes, secure token invites, and OTP verification code logins.</p>
            </div>
          </div>
          {/* Card 3 */}
          <div className="group p-8 rounded-2xl border border-white/5 bg-gradient-to-br bg-zinc-900/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-zinc-900/40 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-44 h-44 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/5 blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors">Realtime Infrastructure</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Powered by WebSockets to broadcast updates across board boards, pages, and editors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 text-center border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Ready to supercharge <br />
            your team's shipping speed?
          </h2>
          <p className="text-zinc-400 text-base mb-10 max-w-lg mx-auto">
            Create your workspace in seconds. Invite teammates, import repositories, and start building.
          </p>

          <div className="flex justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 border border-indigo-400/20 flex items-center gap-2 group"
              >
                Go to Workspace
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                to="/signup"
                className="px-8 py-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 flex items-center gap-2 group"
              >
                Start for Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-black">D</span>
            </div>
            <span className="text-base font-bold text-white">DevCollab</span>
          </div>

          <div className="text-xs text-zinc-500 font-mono">
            © 2026 DevCollab Inc. Built for high-performance engineering.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
