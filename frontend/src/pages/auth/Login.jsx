import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Kanban, FileCode, Eye, EyeOff } from "lucide-react";

import { Button, Input, Modal } from "../../components/ui";
import { useAuth } from "../../context/useAuth";
import api, { unwrap } from "../../lib/api";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState("request");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(form.email, form.password);
      const pendingToken =
        localStorage.getItem("pendingInviteToken") ||
        searchParams.get("invite");
      if (pendingToken) {
        localStorage.removeItem("pendingInviteToken");
        navigate(`/invite/accept/${pendingToken}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in");
    } finally {
      setSubmitting(false);
    }
  };

  const openReset = () => {
    setResetOpen(true);
    setResetStep("request");
    setResetEmail("");
    setResetOtp("");
    setResetPassword("");
    setResetConfirm("");
    setResetError("");
    setResetMessage("");
  };

  const requestOtp = async () => {
    setResetLoading(true);
    setResetError("");
    setResetMessage("");
    try {
      await api.post("/auth/password/otp", { email: resetEmail });
      setResetMessage("We sent a 6-digit code to your email.");
      setResetStep("verify");
    } catch (err) {
      setResetError(err.response?.data?.message || "Unable to send reset code");
    } finally {
      setResetLoading(false);
    }
  };

  const resetPasswordWithOtp = async () => {
    if (resetPassword !== resetConfirm) {
      setResetError("Passwords do not match");
      return;
    }
    setResetLoading(true);
    setResetError("");
    setResetMessage("");
    try {
      const data = unwrap(
        await api.post("/auth/password/reset", {
          email: resetEmail,
          otp: resetOtp,
          password: resetPassword,
        }),
      );
      if (data?.reset) {
        setResetMessage("Password updated. You can now log in.");
        setResetStep("done");
      }
    } catch (err) {
      setResetError(err.response?.data?.message || "Unable to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  return (
    <div className="flex min-h-screen bg-black text-white overflow-hidden">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black p-12 flex-col justify-between">
        {/* Background Noise */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        {/* Glow Effects */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/20 blur-3xl rounded-full" />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-2xl font-black">D</span>
            </div>

            <span className="text-3xl font-black tracking-tight">DevCollab</span>
          </div>

          {/* Heading */}
          <h1 className="text-6xl font-black leading-[1.05] tracking-tight mb-6 max-w-xl">
            Where developer teams move fast together.
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed max-w-md mb-10">
            Collaborate in real-time, manage projects beautifully, and let AI
            supercharge your engineering workflow.
          </p>

          {/* Features */}
          <div className="flex gap-x-7">
            <div className="flex items-center gap-4 bg-white/[0.05] border border-white/10 backdrop-blur-xl px-5 py-4 rounded-2xl w-fit shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Kanban className="text-indigo-400" size={20} />
              </div>

              <div>
                <h3 className="font-semibold">Realtime Kanban</h3>
                <p className="text-xs text-zinc-500">
                  Sync tasks instantly with your team
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/[0.05] border border-white/10 backdrop-blur-xl px-5 py-4 rounded-2xl w-fit shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileCode className="text-emerald-400" size={20} />
              </div>

              <div>
                <h3 className="font-semibold">Shared Snippets</h3>
                <p className="text-xs text-zinc-500">
                  Store reusable code beautifully
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-zinc-500">
          © 2026 DevColab Inc. Built for high-performance teams.
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_40%)]">
        {/* Login Card */}
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
            <h2 className="text-4xl font-black tracking-tight mb-3">
              Welcome Back
            </h2>

            <p className="text-zinc-400 text-sm">
              Sign in to continue collaborating with your team.
            </p>
          </div>

          <div className="space-y-5">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-400">
                    Password
                  </span>

                  <a
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      openReset();
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Forgot Password?
                  </a>
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
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

                  <div className="absolute right-4 inset-y-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                        text-zinc-400
                        hover:text-white
                        transition
                        cursor-pointer
                      "
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-sm select-none">
                <div className="flex items-center gap-2.5 text-zinc-400">
                  {/* Hidden native input for state access */}
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    readOnly
                    className="sr-only"
                  />

                  {/* Custom Checkbox */}
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`
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
                      ${rememberMe 
                        ? "bg-indigo-600 border-indigo-500 text-white" 
                        : "border-white/20 bg-white/5 hover:border-white/40"
                      }
                    `}
                  >
                    {rememberMe && (
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

                  <span 
                    onClick={() => setRememberMe(!rememberMe)}
                    className="cursor-pointer text-xs"
                  >
                    Remember me
                  </span>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
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
                  shadow-lg
                  shadow-indigo-500/30
                  transition-all
                "
              >
                {submitting ? "Signing in..." : "Log In"}
              </Button>
            </form>

            {/* --- SOCIAL LOGIN SECTION --- */}
            <div className="flex items-center gap-3 my-6">
              <hr className="flex-1 border-white/10" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                Or continue with
              </span>
              <hr className="flex-1 border-white/10" />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all rounded-xl py-2.5 shadow-lg cursor-pointer"
                onClick={() => handleSocialLogin('google')}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>

              <Button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all rounded-xl py-2.5 shadow-lg cursor-pointer"
                onClick={() => handleSocialLogin('github')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </Button>
            </div>
            {/* --- END SOCIAL LOGIN SECTION --- */}
          </div>

          {/* Bottom */}
          <div className="mt-6 space-y-3 text-center">
            <p className="text-xs text-zinc-500">
              Trusted by student developer teams across India
            </p>

            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-zinc-400">
                Don&apos;t have an account?
              </span>

              <Link
                to={
                  searchParams.get("invite")
                    ? `/signup?invite=${searchParams.get("invite")}${form.email ? `&email=${encodeURIComponent(form.email)}` : ""}`
                    : "/signup"
                }
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset your password"
        footer={
          <>
            {resetStep === "request" && (
              <Button
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setResetOpen(false)}
              >
                Cancel
              </Button>
            )}
            {resetStep === "verify" && (
              <Button
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setResetStep("request")}
              >
                Back
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {resetError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {resetError}
            </p>
          )}
          {resetMessage && (
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              {resetMessage}
            </p>
          )}

          {resetStep === "request" && (
            <>
              <Input
                label="Email address"
                type="email"
                placeholder="john@example.com"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
              />
              <Button
                className="w-full cursor-pointer"
                onClick={requestOtp}
                disabled={!resetEmail || resetLoading}
              >
                {resetLoading ? "Sending..." : "Send reset code"}
              </Button>
            </>
          )}

          {resetStep === "verify" && (
            <>
              <Input
                label="Email address"
                type="email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
              />
              <Input
                label="OTP code"
                placeholder="6-digit code"
                value={resetOtp}
                onChange={(event) => setResetOtp(event.target.value)}
              />
              <Input
                label="New password"
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
              />
              <Input
                label="Confirm new password"
                type="password"
                value={resetConfirm}
                onChange={(event) => setResetConfirm(event.target.value)}
              />
              <Button
                className="w-full"
                onClick={resetPasswordWithOtp}
                disabled={resetLoading || !resetOtp || !resetPassword}
              >
                {resetLoading ? "Updating..." : "Update password"}
              </Button>
            </>
          )}

          {resetStep === "done" && (
            <Button
              className="w-full cursor-pointer"
              onClick={() => setResetOpen(false)}
            >
              Back to login
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Login;