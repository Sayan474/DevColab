import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Inbox, 
  Folder, 
  ChevronDown, 
  User, 
  Moon, 
  Sun,
  Plus
} from 'lucide-react';
import { useWorkspace } from '../../context/useWorkspace';
import { useTheme } from '../../context/useTheme';
import { cn } from '../../assets/utils';

export const Sidebar = ({ isCollapsed }) => {
  const { currentWorkspace, projects } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
    { icon: Inbox, label: 'Inbox', path: '/inbox', badge: 3 },
    { icon: Folder, label: 'All Projects', path: '/projects' },
  ];

  return (
    <aside className={cn(
      "surface sticky top-0 h-screen transition-all duration-300 flex flex-col z-40 border-r",
      isCollapsed ? "w-[60px]" : "w-[240px]"
    )}>
      {/* Workspace Switcher */}
      <div className="p-4 border-b dark:border-dark-border light:border-light-border">
        <button 
          onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
          className="flex items-center gap-3 w-full hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-md transition-all pt-1"
        >
          <img src={currentWorkspace?.avatar || 'https://ui-avatars.com/api/?name=DevCollab'} alt="" className="w-8 h-8 rounded-md" />
          {!isCollapsed && (
            <>
              <span className="font-semibold truncate flex-1 text-left">{currentWorkspace?.name || 'Workspace'}</span>
              <ChevronDown size={16} className={cn("transition-transform", isWorkspaceOpen && "rotate-180")} />
            </>
          )}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all group",
              isActive ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <item.icon size={20} />
            {!isCollapsed && (
              <span className="flex-1 font-medium">{item.label}</span>
            )}
            {!isCollapsed && item.badge && (
              <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>
            )}
          </NavLink>
        ))}

        <div className="pt-4 pb-2 px-3">
          {!isCollapsed && <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Projects</span>}
        </div>

        {projects.map((project) => (
          <NavLink
            key={project._id || project.id}
            to={`/project/${project._id || project.id}/board`}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
              isActive ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color || '#7C3AED' }} />
            {!isCollapsed && <span className="truncate flex-1">{project.name}</span>}
          </NavLink>
        ))}
        
        {!isCollapsed && (
          <NavLink
            to="/projects/new"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 w-full rounded-md transition-all mt-2",
              isActive ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <Plus size={16} />
            <span>New Project</span>
          </NavLink>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t dark:border-dark-border light:border-light-border space-y-1">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 w-full text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-all"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!isCollapsed && <span className="font-medium">Theme</span>}
        </button>
        <NavLink
          to="/settings/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <User size={20} />
          {!isCollapsed && <span className="font-medium">Profile</span>}
        </NavLink>
      </div>
    </aside>
  );
};
