import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button, Input } from "../../components/ui";
import { cn } from "../../assets/utils";
import { useAuth } from "../../context/useAuth";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: searchParams.get('email') || "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsOpened, setTermsOpened] = useState(false);
  const [privacyOpened, setPrivacyOpened] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password Strength Logic
  const getStrength = (password) => {
    let score = 0;

    if (!password) return 0;

    // Length
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;

    // Character checks
    if (/[a-z]/.test(password)) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;

    return Math.min(score, 100);
  };

  const getStrengthColor = (strength) => {
    if (strength < 40) return "bg-red-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = (strength) => {
    if (strength < 40) return "Weak";
    if (strength < 75) return "Medium";
    return "Strong";
  };

  const strength = getStrength(password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register(form.name, form.email, password);
      const pendingToken = localStorage.getItem('pendingInviteToken') || searchParams.get('invite');
      if (pendingToken) {
        localStorage.removeItem('pendingInviteToken');
        navigate(`/invite/accept/${pendingToken}`);
      } else {
        navigate('/onboarding/workspace');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070709] text-white overflow-hidden relative font-sans">
      {/* Background Grid Pattern & Glowing Pulsing Lines */}
      <div className="absolute inset-0 glowing-grid pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_800px,rgba(139,92,246,0.08),transparent)] pointer-events-none" />

      {/* FLOATING GLOWS */}
      <div className="absolute top-20 left-1/4 w-[40rem] h-[40rem] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[40rem] right-1/4 w-[35rem] h-[35rem] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden p-12 flex-col justify-between border-r border-white/5 bg-white/[0.01] backdrop-blur-[2px] z-10">
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-2xl font-black">D</span>
            </div>

            <span className="text-3xl font-black tracking-tight">
              DevCollab
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-6xl font-black leading-[1.05] tracking-tight mb-6 max-w-xl text-white bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            Build software together — faster than ever.
          </h1>

          <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
            Manage projects, collaborate in real-time, and supercharge your
            workflow with AI-powered development tools.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-10">
          <div>
            <h3 className="text-3xl font-bold">10k+</h3>
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Developers
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-bold">500k+</h3>
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Tasks Managed
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-bold">99.9%</h3>
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Uptime
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative z-10">
        {/* Signup Card */}
        <div
          className="
            w-full
            max-w-md
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
            backdrop-blur-2xl
            p-8
            shadow-2xl
            hover:scale-[1.01]
            transition-all
            duration-300
          "
        >
          {/* Heading */}
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-black tracking-tight mb-3 text-white">
              Create Account
            </h2>

            <p className="text-zinc-400 text-sm">
              Start collaborating with your team today.
            </p>
          </div>

          {/* FORM */}
          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
            {/* Full Name */}
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="
                bg-white/5
                border-white/10
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/30
                transition-all
              "
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="jane@example.com"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="
                bg-white/5
                border-white/10
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/30
                transition-all
              "
            />

            {/* Password */}
            <div className="space-y-3">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    bg-white/5
                    border-white/10
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-500/30
                    transition-all
                    pr-12
                  "
                />

                {/* Toggle Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    absolute
                    right-4
                    top-1/2
                    text-zinc-400
                    hover:text-white
                    transition
                  "
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {/* Strength Bar */}
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      getStrengthColor(strength)
                    )}
                    style={{ width: `${strength}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">
                    Use 8+ chars with numbers & symbols
                  </span>

                  <span
                    className={cn(
                      "font-medium",
                      strength < 40 && "text-red-400",
                      strength >= 40 &&
                        strength < 75 &&
                        "text-yellow-400",
                      strength >= 75 && "text-green-400"
                    )}
                  >
                    {getStrengthLabel(strength)}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-start gap-3">
                {/* Hidden native input for HTML5 form validation */}
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={acceptTerms}
                  readOnly
                  className="sr-only"
                />
                
                {/* Custom styled checkbox with SVG checkmark */}
                <div
                  onClick={() => {
                    if (termsOpened && privacyOpened) {
                      setAcceptTerms(!acceptTerms);
                    }
                  }}
                  className={`
                    mt-0.5
                    w-5
                    h-5
                    rounded
                    border
                    flex
                    items-center
                    justify-center
                    cursor-pointer
                    transition-all
                    shrink-0
                    ${acceptTerms 
                      ? "bg-indigo-600 border-indigo-500 text-white" 
                      : "border-white/20 bg-white/5 hover:border-white/40"
                    }
                    ${(!termsOpened || !privacyOpened) 
                      ? "opacity-30 cursor-not-allowed" 
                      : ""
                    }
                  `}
                >
                  {acceptTerms && (
                    <svg 
                      className="w-3.5 h-3.5 stroke-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="3.5"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4.5 12.75l6 6 9-13.5" 
                      />
                    </svg>
                  )}
                </div>

                <label
                  htmlFor="terms"
                  className="text-xs leading-relaxed text-zinc-400"
                >
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setTermsOpened(true)}
                    className="text-white hover:text-indigo-400 transition underline decoration-indigo-500/50 font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setPrivacyOpened(true)}
                    className="text-white hover:text-indigo-400 transition underline decoration-indigo-500/50 font-medium"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {(!termsOpened || !privacyOpened) && (
                <div className="text-[10px] text-zinc-500 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  Please open both links to enable the agreement checkbox.
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!acceptTerms || submitting}
              className="
                w-full
                py-3
                cursor-pointer
                rounded-xl
                font-semibold
                bg-gradient-to-r
                from-indigo-500
                to-purple-600
                hover:opacity-90
                disabled:opacity-40
                disabled:cursor-not-allowed
                shadow-lg
                shadow-indigo-500/30
                transition-all
              "
            >
              {submitting ? "Creating..." : "Create Account"}
            </Button>
          </form>

          {/* Bottom */}
          <div className="mt-6 space-y-3 text-center">
            <p className="text-xs text-zinc-500">
              Trusted by student teams from 20+ colleges
            </p>

            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-zinc-400">
                Already have an account?
              </span>

              <Link
                to="/login"
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
