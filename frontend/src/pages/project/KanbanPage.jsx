import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '../../components/layout/PageShell';
import { Badge, Avatar, Button, Input } from '../../components/ui';
import { cn } from '../../assets/utils';
import { Plus, MoreHorizontal, X, UserPlus, Flag, Calendar, Hash, Clock } from 'lucide-react';
import { KanbanColumn } from '../../components/kanban/KanbanColumn';
import api, { unwrap } from '../../lib/api';
import { boardSocket, presenceSocket } from '../../lib/socket';
import { formatDate, statusLabels, statusOrder } from '../../lib/format';
import { useAuth } from '../../context/useAuth';

const emptyGrouped = () => ({ todo: [], in_progress: [], in_review: [], done: [] });

const KanbanPage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [grouped, setGrouped] = useState(emptyGrouped);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewers, setViewers] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const allTasks = useMemo(() => statusOrder.flatMap((status) => grouped[status] || []), [grouped]);
  const users = useMemo(() => {
    const byId = new Map();
    allTasks.forEach((task) => {
      if (task.assigneeId?._id) byId.set(task.assigneeId._id, task.assigneeId);
      if (task.createdBy?._id) byId.set(task.createdBy._id, task.createdBy);
    });
    if (user) byId.set(user._id || user.id, user);
    return Array.from(byId.values());
  }, [allTasks, user]);

  const loadTasks = async () => {
    const data = unwrap(await api.get(`/tasks/project/${projectId}?grouped=true`));
    setGrouped({ ...emptyGrouped(), ...(data.tasks || {}) });
  };

  useEffect(() => {
    loadTasks().catch(() => {});
  }, [projectId]);

  useEffect(() => {
    boardSocket.connect();
    presenceSocket.connect();
    boardSocket.emit('join_board', { projectId });
    presenceSocket.emit('join_board', { projectId, userId: user?._id || user?.id, userName: user?.name, avatar: user?.avatar });
    const upsertTask = (task) => setGrouped((prev) => {
      const next = emptyGrouped();
      statusOrder.forEach((status) => { next[status] = (prev[status] || []).filter((item) => (item._id || item.id) !== (task._id || task.id)); });
      next[task.status] = [...next[task.status], task].sort((a, b) => (a.position || 0) - (b.position || 0));
      return next;
    });
    const removeTask = ({ taskId }) => setGrouped((prev) => Object.fromEntries(statusOrder.map((status) => [status, (prev[status] || []).filter((task) => (task._id || task.id) !== taskId)])));
    const onMoved = ({ task }) => task && upsertTask(task);
    boardSocket.on('task:created', upsertTask);
    boardSocket.on('task:updated', upsertTask);
    boardSocket.on('task:moved', onMoved);
    boardSocket.on('task:deleted', removeTask);
    presenceSocket.on('presence:update', setViewers);
    return () => {
      boardSocket.off('task:created', upsertTask);
      boardSocket.off('task:updated', upsertTask);
      boardSocket.off('task:moved', onMoved);
      boardSocket.off('task:deleted', removeTask);
      presenceSocket.off('presence:update', setViewers);
      boardSocket.emit('leave_board', { projectId });
    };
  }, [projectId, user]);

  const createTask = async () => {
    if (!newTitle.trim()) return;
    const data = unwrap(await api.post('/tasks', { title: newTitle, projectId, status: 'todo' }));
    setNewTitle('');
    setGrouped((prev) => ({ ...prev, todo: [...prev.todo, data.task] }));
  };

  const moveTask = async (task, status) => {
    const data = unwrap(await api.put(`/tasks/${task._id || task.id}/move`, { status, position: (grouped[status]?.length || 0) + 1 }));
    setSelectedTask(data.task);
    await loadTasks();
  };

  const addComment = async (event) => {
    event.preventDefault();
    const text = event.currentTarget.elements.comment.value;
    if (!text.trim() || !selectedTask) return;
    await api.post(`/tasks/${selectedTask._id || selectedTask.id}/comments`, { text });
    event.currentTarget.reset();
    const data = unwrap(await api.get(`/tasks/${selectedTask._id || selectedTask.id}`));
    setSelectedTask(data.task);
  };

  const getPriorityBadge = (p) => <Badge variant={p === 'P0' ? 'danger' : p === 'P1' ? 'warning' : 'info'}>{p}</Badge>;

  return (
    <PageShell breadcrumbs={['Projects', 'Board']}>
      <div className="h-full flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Project Board</h1>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">{viewers.slice(0, 5).map((v) => <Avatar key={v.socketId} src={v.avatar} name={v.userName} size="xs" className="ring-2 ring-dark-bg" />)}</div>
              <span className="text-xs text-gray-500">{viewers.length || 1} people viewing</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input placeholder="New task title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Button size="sm" className="gap-2" onClick={createTask}><Plus size={14} /> New Task</Button>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {statusOrder.map((status) => (
            <KanbanColumn
              key={status}
              title={statusLabels[status]}
              tasks={(grouped[status] || []).map((task) => ({ ...task, id: task._id || task.id, status: statusLabels[task.status], assignee: task.assigneeId?._id || task.assigneeId, attachments: task.attachments?.length || 0 }))}
              onTaskClick={(task) => setSelectedTask(allTasks.find((item) => (item._id || item.id) === task.id))}
              users={users.map((u) => ({ ...u, id: u._id || u.id }))}
            />
          ))}
        </div>
      </div>

      <div className={cn("fixed inset-y-0 right-0 w-full max-w-lg surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l dark:border-dark-border", selectedTask ? "translate-x-0" : "translate-x-full")}>
        {selectedTask && (
          <div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto">
            <div className="flex items-center justify-between">
              <Badge variant="primary">DC-{(selectedTask._id || selectedTask.id).slice(-6).toUpperCase()}</Badge>
              <div className="flex items-center gap-4"><MoreHorizontal size={18} /><button onClick={() => setSelectedTask(null)} className="text-gray-500 hover:text-white"><X size={18} /></button></div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-gray-500 flex items-center gap-2"><Flag size={14} /> Priority</div><div>{getPriorityBadge(selectedTask.priority)}</div>
                <div className="text-gray-500 flex items-center gap-2"><Calendar size={14} /> Due Date</div><div className="flex items-center gap-2"><Clock size={14} /> {formatDate(selectedTask.dueDate)}</div>
                <div className="text-gray-500 flex items-center gap-2"><UserPlus size={14} /> Assignee</div><div>{selectedTask.assigneeId?.name || "Unassigned"}</div>
                <div className="text-gray-500 flex items-center gap-2"><Hash size={14} /> Status</div>
                <select className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1" value={selectedTask.status} onChange={(e) => moveTask(selectedTask, e.target.value)}>
                  {statusOrder.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-400 whitespace-pre-wrap">{selectedTask.description || "No description yet."}</p>
            <form onSubmit={addComment} className="space-y-3 border-t dark:border-dark-border pt-6">
              <h4 className="font-bold">Comments <span className="text-xs text-gray-500">{selectedTask.comments?.length || 0}</span></h4>
              <textarea name="comment" placeholder="Add a comment... Use @Full Name to mention" className="w-full bg-black/10 dark:bg-white/5 border border-dark-border rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-primary h-20 resize-none" />
              <Button size="sm">Post Comment</Button>
              <div className="space-y-2">{selectedTask.comments?.map((comment) => <div key={comment._id} className="text-xs bg-white/5 rounded-lg p-3"><strong>{comment.author?.name || "User"}:</strong> {comment.text}</div>)}</div>
            </form>
          </div>
        )}
      </div>
      {selectedTask && <div onClick={() => setSelectedTask(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />}
    </PageShell>
  );
};

export default KanbanPage;
