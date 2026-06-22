import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { unwrap } from "../../lib/api";
import { useAuth } from "../../context/useAuth";
import { useWorkspace } from "../../context/useWorkspace";

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { fetchWorkspaces } = useWorkspace();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loading) return; // wait for auth to hydrate

    const handleInvite = async () => {
      // ── NOT logged in → validate invite first, then redirect to signup/login ──
      if (!isAuthenticated) {
        // Set token FIRST before any API call — so it's never lost
        localStorage.setItem("pendingInviteToken", token);

        try {
          const data = unwrap(await api.get(`/invites/accept/${token}`));
          const emailParam = data.email
            ? `&email=${encodeURIComponent(data.email)}`
            : "";
          if (data.registered === false) {
            navigate(`/signup?invite=${token}${emailParam}`);
          } else {
            navigate(`/login?invite=${token}${emailParam}`);
          }
        } catch {
          // Even on error, token is already saved
          // Show error but give them buttons to login/signup
          setMessage(
            "Could not validate invite. Try logging in or signing up.",
          );
          setStatus("error");
        }
        return;
      }

      // ── LOGGED IN → accept the invite via POST ──
      try {
        const data = unwrap(await api.post(`/invites/accept/${token}`));
        localStorage.removeItem("pendingInviteToken");
        await fetchWorkspaces(); // refresh workspace list in context
        setStatus("success");
        setMessage(data.message || `You joined the workspace!`);
        setTimeout(() => navigate("/dashboard"), 2500);
      } catch (err) {
        const serverMsg = err?.response?.data?.message || "";
        // If the email doesn't match, tell them clearly
        if (err?.response?.status === 403) {
          setMessage(
            "This invite was sent to a different email address. Please log in with the correct account.",
          );
        } else {
          setMessage(serverMsg || "Invite is invalid or expired.");
        }
        setStatus("error");
      }
    };

    handleInvite();
  }, [token, isAuthenticated, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="surface rounded-2xl p-10 max-w-md w-full text-center space-y-4 border border-dark-border">
        {status === "loading" && (
          <p className="text-gray-400 animate-pulse">
            Validating your invite...
          </p>
        )}
        {status === "success" && (
          <>
            <div className="text-4xl">🎉</div>
            <h2 className="text-xl font-bold">You're in!</h2>
            <p className="text-gray-400">{message}</p>
            <p className="text-xs text-gray-500">Redirecting to dashboard...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-4xl">❌</div>
            <h2 className="text-xl font-bold">Invite Failed</h2>
            <p className="text-gray-400">{message}</p>
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => navigate(`/login?invite=${token}`)}
                className="px-6 py-2 rounded-xl bg-primary text-white text-sm"
              >
                Log In
              </button>
              <button
                onClick={() => navigate(`/signup?invite=${token}`)}
                className="px-6 py-2 rounded-xl border border-dark-border text-sm"
              >
                Sign Up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
