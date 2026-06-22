import { useCallback, useEffect, useState } from 'react';
import api, { unwrap } from '../lib/api';
import { useAuth } from './useAuth';
import { WorkspaceContext } from './workspace-context';

export const WorkspaceProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      setHasLoaded(false);
      return [];
    }
    if (!isAuthenticated) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setProjects([]);
      setHasLoaded(true);
      setLoading(false);
      return [];
    }
    setLoading(true);
    try {
      const data = unwrap(await api.get('/workspaces'));
      const nextWorkspaces = data.workspaces || [];
      setWorkspaces(nextWorkspaces);
      setCurrentWorkspace((prev) => {
        const prevId = prev?._id || prev?.id;
        return nextWorkspaces.find((workspace) => (workspace._id || workspace.id) === prevId) || nextWorkspaces[0] || null;
      });
      return nextWorkspaces;
    } finally {
      setHasLoaded(true);
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

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
    fetchWorkspaces();
  }, [user, fetchWorkspaces]);

  useEffect(() => {
    if (currentWorkspace) {
      fetchProjects(currentWorkspace._id || currentWorkspace.id);
    } else {
      setProjects([]);
    }
  }, [currentWorkspace, fetchProjects]);

  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, setCurrentWorkspace, workspaces, setWorkspaces, projects, loading, hasLoaded, fetchWorkspaces, createWorkspace, fetchProjects, createProject }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
