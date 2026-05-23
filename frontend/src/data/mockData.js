export const mockData = {
  workspaces: [
    { id: 'ws1', name: 'TechSquad', slug: 'techsquad', avatar: 'https://ui-avatars.com/api/?name=Tech+Squad&background=7C3AED&color=fff' }
  ],
  projects: [
    { id: 'p1', name: 'Auth Service', color: '#7C3AED', tasksCount: 5, members: ['u1', 'u2', 'u3'] },
    { id: 'p2', name: 'Mobile App', color: '#10B981', tasksCount: 3, members: ['u1', 'u4'] },
    { id: 'p3', name: 'DevCollab Platform', color: '#3B82F6', tasksCount: 8, members: ['u1', 'u2', 'u5', 'u6'] }
  ],
  users: [
    { id: 'u1', name: 'John Doe', avatar: 'https://ui-avatars.com/api/?name=John+Doe', role: 'Lead Developer' },
    { id: 'u2', name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith', role: 'Senior Engineer' },
    { id: 'u3', name: 'Alice Brown', avatar: 'https://ui-avatars.com/api/?name=Alice+Brown', role: 'UI/UX Designer' },
    { id: 'u4', name: 'Bob Wilson', avatar: 'https://ui-avatars.com/api/?name=Bob+Wilson', role: 'QA Engineer' },
    { id: 'u5', name: 'Charlie Davis', avatar: 'https://ui-avatars.com/api/?name=Charlie+Davis', role: 'Product Manager' },
    { id: 'u6', name: 'Eve Miller', avatar: 'https://ui-avatars.com/api/?name=Eve+Miller', role: 'DevOps Engineer' }
  ],
  tasks: [
    { id: 't1', title: 'Implement JWT Auth', status: 'To Do', priority: 'P0', assignee: 'u1', dueDate: '2026-05-25', labels: ['Backend', 'Security'], attachments: 2, description: '# JWT Auth Implementation\nNeed to add access and refresh tokens.' },
    { id: 't2', title: 'Design Layout System', status: 'In Progress', priority: 'P1', assignee: 'u3', dueDate: '2026-05-22', labels: ['UI', 'Design'], attachments: 5, description: 'Design tokens for light/dark mode.' },
    { id: 't3', title: 'Setup CI/CD Pipeline', status: 'In Review', priority: 'P0', assignee: 'u6', dueDate: '2026-05-20', labels: ['DevOps'], attachments: 1, description: 'GitHub Actions config.' },
    { id: 't4', title: 'Fix Header Bug', status: 'Done', priority: 'P2', assignee: 'u2', dueDate: '2026-05-18', labels: ['Bug'], attachments: 0, description: 'Header was overlapping.' },
    { id: 't5', title: 'Setup Unit Tests', status: 'To Do', priority: 'P1', assignee: 'u4', dueDate: '2026-05-28', labels: ['Testing'], attachments: 0, description: 'Jest + Vitest setup.' }
  ],
  snippets: [
    { id: 's1', title: 'Auth Hook', language: 'javascript', code: "const useAuth = () => {\n  const context = useContext(AuthContext);\n  if (!context) throw new Error('useAuth must be used within AuthProvider');\n  return context;\n};", description: 'Custom hook for authentication context.', tags: ['React', 'Auth'] },
    { id: 's2', title: 'Tailwind Config Wrapper', language: 'javascript', code: "import { clsx } from 'clsx';\nimport { twMerge } from 'tailwind-merge';\n\nexport function cn(...inputs) {\n  return twMerge(clsx(inputs));\n}", description: 'Utility for merging tailwind classes.', tags: ['Utils', 'Tailwind'] }
  ],
  wikiPages: [
    { id: 'w1', title: 'Getting Started', content: '# Welcome to TechSquad\nThis is our internal wiki.', author: 'u1', lastEdited: '2h ago' },
    { id: 'w2', title: 'Design System', content: '# Brand Guidelines\nUse Inter font for everything.', author: 'u3', lastEdited: '1d ago' }
  ],
  activities: [
    { id: 'a1', user: 'u1', action: 'moved Implement JWT Auth to To Do', type: 'task', timestamp: '2h ago' },
    { id: 'a2', user: 'u3', action: 'updated wiki Design System', type: 'doc', timestamp: '5h ago' },
    { id: 'a3', user: 'u6', action: 'pushed to master', type: 'code', timestamp: 'Yesterday' }
  ]
};
