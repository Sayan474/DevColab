import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Kanban,
  FileCode,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button, Input, Modal } from "../../components/ui";
import { useAuth } from "../../context/useAuth";
import api, { unwrap } from "../../lib/api";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
      // ADD THIS — check for pending invite after login
    const pendingToken = localStorage.getItem('pendingInviteToken');
    if (pendingToken) {
      localStorage.removeItem('pendingInviteToken');
      navigate(`/invite/accept/${pendingToken}`);
    } else {
      navigate('/dashboard');
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
      const data = unwrap(await api.post("/auth/password/reset", { email: resetEmail, otp: resetOtp, password: resetPassword }));
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

            <span className="text-3xl font-black tracking-tight">
              DevCollab
            </span>
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
            <form
              className="space-y-5"
              onSubmit={handleSubmit}
            >
              {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
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
              <div className="space-y-2">
                <div className="flex items-center justify-between pr-1">
                  <label className="text-sm font-medium text-zinc-300">
                    Password
                  </label>

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
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
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
                      "
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-zinc-400">
                  <input
                    type="checkbox"
                    className="
                      rounded
                      cursor-pointer
                      border-white/10
                      bg-white/5
                      accent-indigo-500
                    "
                  />

                  Remember me
                </label>
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
                to="/signup"
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
        footer={(
          <>
            {resetStep === "request" && (
              <Button variant="secondary" onClick={() => setResetOpen(false)}>Cancel</Button>
            )}
            {resetStep === "verify" && (
              <Button variant="secondary" onClick={() => setResetStep("request")}>Back</Button>
            )}
          </>
        )}
      >
        <div className="space-y-4">
          {resetError && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{resetError}</p>}
          {resetMessage && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">{resetMessage}</p>}

          {resetStep === "request" && (
            <>
              <Input
                label="Email address"
                type="email"
                placeholder="john@example.com"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
              />
              <Button className="w-full" onClick={requestOtp} disabled={!resetEmail || resetLoading}>
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
              <Button className="w-full" onClick={resetPasswordWithOtp} disabled={resetLoading || !resetOtp || !resetPassword}>
                {resetLoading ? "Updating..." : "Update password"}
              </Button>
            </>
          )}

          {resetStep === "done" && (
            <Button className="w-full" onClick={() => setResetOpen(false)}>
              Back to login
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Login;
