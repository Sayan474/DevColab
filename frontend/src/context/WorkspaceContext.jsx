import { useCallback, useEffect, useState } from 'react';
import api, { unwrap } from '../lib/api';
import { useAuth } from './useAuth';
import { WorkspaceContext } from './workspace-context';

export const WorkspaceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      return [];
    }
    setLoading(true);
    try {
      const data = unwrap(await api.get('/workspaces'));
      setWorkspaces(data.workspaces || []);
      setCurrentWorkspace((prev) => prev || data.workspaces?.[0] || null);
      return data.workspaces || [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createWorkspace = async (payload) => {
    const data = unwrap(await api.post('/workspaces', payload));
    await fetchWorkspaces();
    setCurrentWorkspace(data.workspace);
    return data.workspace;
  };

  const fetchProjects = useCallback(async (workspaceId = currentWorkspace?._id || currentWorkspace?.id) => {
    if (!workspaceId) {
      setProjects([]);
      return [];
    }
    const data = unwrap(await api.get(`/projects/workspace/${workspaceId}`));
    setProjects(data.projects || []);
    return data.projects || [];
  }, [currentWorkspace]);

  const createProject = async (payload) => {
    const data = unwrap(await api.post('/projects', { ...payload, workspaceId: payload.workspaceId || currentWorkspace?._id || currentWorkspace?.id }));
    await fetchProjects(payload.workspaceId || currentWorkspace?._id || currentWorkspace?.id);
    return data.project;
  };

  useEffect(() => {
    if (user) fetchWorkspaces();
  }, [user, fetchWorkspaces]);

  useEffect(() => {
    if (currentWorkspace) fetchProjects(currentWorkspace._id || currentWorkspace.id);
  }, [currentWorkspace, fetchProjects]);

  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, setCurrentWorkspace, workspaces, projects, loading, fetchWorkspaces, createWorkspace, fetchProjects, createProject }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
