import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import CreateWorkspace from "./pages/onboarding/CreateWorkspace";
import Dashboard from "./pages/dashboard/Dashboard";
import KanbanPage from "./pages/project/KanbanPage";
import SnippetsPage from "./pages/project/SnippetsPage";
import WikiPage from "./pages/project/WikiPage";
import ActivityPage from "./pages/project/ActivityPage";
import AIPage from "./pages/project/AIPage";
import WorkspaceSettings from "./pages/settings/WorkspaceSettings";
import ProfileSettings from "./pages/settings/ProfileSettings";
import PricingPage from "./pages/upgrade/PricingPage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { useAuth } from "./context/useAuth";
import { useWorkspace } from "./context/useWorkspace";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen surface flex items-center justify-center text-gray-400">Loading DevCollab...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const WorkspaceRoute = ({ children }) => {
  const { workspaces, loading } = useWorkspace();
  if (loading) return <div className="min-h-screen surface flex items-center justify-center text-gray-400">Loading workspace...</div>;
  if (!workspaces.length) return <Navigate to="/onboarding/workspace" replace />;
  return children;
};

const AppRoutes = () => {
  const guarded = (element) => <ProtectedRoute><WorkspaceRoute>{element}</WorkspaceRoute></ProtectedRoute>;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding/workspace" element={<ProtectedRoute><CreateWorkspace /></ProtectedRoute>} />
      <Route path="/dashboard" element={guarded(<Dashboard />)} />
      <Route path="/project/:id/board" element={guarded(<KanbanPage />)} />
      <Route path="/project/:id/snippets" element={guarded(<SnippetsPage />)} />
      <Route path="/project/:id/wiki" element={guarded(<WikiPage />)} />
      <Route path="/project/:id/activity" element={guarded(<ActivityPage />)} />
      <Route path="/project/:id/ai" element={guarded(<AIPage />)} />
      <Route path="/settings/workspace" element={guarded(<WorkspaceSettings />)} />
      <Route path="/settings/profile" element={guarded(<ProfileSettings />)} />
      <Route path="/upgrade" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <AppRoutes />
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
