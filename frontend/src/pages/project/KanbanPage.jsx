import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '../../components/layout/PageShell';
import { Badge, Avatar, Button, Input } from '../../components/ui';
import { cn } from '../../assets/utils';
import { Plus, MoreHorizontal, X, LayoutGrid, List, CalendarDays, Upload, Trash2 } from 'lucide-react';
import { KanbanColumn } from '../../components/kanban/KanbanColumn';
import MarkdownRenderer from '../../components/markdown/MarkdownRenderer';
import api, { unwrap } from '../../lib/api';
import { boardSocket, presenceSocket } from '../../lib/socket';
import { formatDate, statusLabels, statusOrder } from '../../lib/format';
import { useAuth } from '../../context/useAuth';

const emptyGrouped = () => ({ todo: [], in_progress: [], in_review: [], done: [] });

const KanbanPage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [grouped, setGrouped] = useState(emptyGrouped);
  const [projectName, setProjectName] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDraft, setTaskDraft] = useState(null);
  const [labelInput, setLabelInput] = useState('');
  const [view, setView] = useState('board');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const allTasks = useMemo(() => statusOrder.flatMap((status) => grouped[status] || []), [grouped]);
  const calendarMonth = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const startDay = monthStart.getDay();
    const totalDays = monthEnd.getDate();
    const tasksByDay = new Map();
    allTasks.forEach((task) => {
      if (!task.dueDate) return;
      const due = new Date(task.dueDate);
      if (due.getFullYear() !== year || due.getMonth() !== month) return;
      const key = due.toDateString();
      if (!tasksByDay.has(key)) tasksByDay.set(key, []);
      tasksByDay.get(key).push(task);
    });
    const cells = [];
    for (let i = 0; i < startDay; i += 1) cells.push(null);
    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(year, month, day);
      const key = date.toDateString();
      cells.push({ date, tasks: tasksByDay.get(key) || [] });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return { label: monthStart.toLocaleString('default', { month: 'long', year: 'numeric' }), cells };
  }, [allTasks]);
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
    const loadProject = async () => {
      const data = unwrap(await api.get(`/projects/${projectId}`));
      setProjectName(data.project?.name || '');
    };
    loadProject().catch(() => {});
  }, [projectId]);

  useEffect(() => {
    boardSocket.connect();
    presenceSocket.connect();
    boardSocket.emit('join_board', { projectId });
    presenceSocket.emit('join_board', { projectId, userId: user?._id || user?.id, userName: user?.name, avatar: user?.avatar });
    const upsertTask = (task) => {
      if (!task || (task.projectId?._id || task.projectId) !== projectId) return;
      setGrouped((prev) => {
      const next = emptyGrouped();
      statusOrder.forEach((status) => { next[status] = (prev[status] || []).filter((item) => (item._id || item.id) !== (task._id || task.id)); });
      next[task.status] = [...next[task.status], task].sort((a, b) => (a.position || 0) - (b.position || 0));
      return next;
      });
    };
    const removeTask = ({ taskId, projectId: removedProjectId }) => {
      if (removedProjectId && removedProjectId !== projectId) return;
      setGrouped((prev) => Object.fromEntries(statusOrder.map((status) => [status, (prev[status] || []).filter((task) => (task._id || task.id) !== taskId)])));
    };
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
  const title = newTitle.trim() || 'New Task';

  const data = unwrap(
    await api.post('/tasks', {
      title,
      projectId,
      status: 'todo',
    })
  );

  setNewTitle('');
  await loadTasks();

  setSelectedTask(data.task);
};

  const createTaskForStatus = async (status) => {
    const data = unwrap(await api.post('/tasks', { title: 'New Task', projectId, status }));
    await loadTasks();
    setSelectedTask(data.task);
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

  useEffect(() => {
    if (!selectedTask) {
      setTaskDraft(null);
      setLabelInput('');
      return;
    }
    setTaskDraft({
      id: selectedTask._id || selectedTask.id,
      title: selectedTask.title || '',
      description: selectedTask.description || '',
      status: selectedTask.status || 'todo',
      priority: selectedTask.priority || 'P1',
      assigneeId: selectedTask.assigneeId?._id || selectedTask.assigneeId || '',
      dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().slice(0, 10) : '',
      labels: selectedTask.labels || [],
    });
    setLabelInput((selectedTask.labels || []).join(', '));
  }, [selectedTask]);

  const saveTask = async () => {
    if (!taskDraft) return;
    setSaving(true);
    try {
      const payload = {
        title: taskDraft.title.trim(),
        description: taskDraft.description,
        status: taskDraft.status,
        priority: taskDraft.priority,
        assigneeId: taskDraft.assigneeId || undefined,
        dueDate: taskDraft.dueDate ? new Date(taskDraft.dueDate).toISOString() : undefined,
        labels: labelInput.split(',').map((label) => label.trim()).filter(Boolean),
      };
      const data = unwrap(await api.put(`/tasks/${taskDraft.id}`, payload));
      setSelectedTask(data.task);
      await loadTasks();
    } finally {
      setSaving(false);
    }
  };

  const uploadAttachment = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedTask) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/tasks/${selectedTask._id || selectedTask.id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = unwrap(await api.get(`/tasks/${selectedTask._id || selectedTask.id}`));
      setSelectedTask(data.task);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDragStart = (event, task) => {
    event.dataTransfer.setData('text/plain', task.id || task._id);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (status) => async (event) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    if (!taskId) return;
    const task = allTasks.find((item) => (item._id || item.id) === taskId);
    if (task && task.status !== status) await moveTask(task, status);
  };

  const getPriorityBadge = (p) => <Badge variant={p === 'P0' ? 'danger' : p === 'P1' ? 'warning' : 'info'}>{p}</Badge>;
  const statusColors = {
    todo: '#6B7280',
    in_progress: '#3B82F6',
    in_review: '#F59E0B',
    done: '#10B981',
  };

  const getDominantStatus = (tasks) => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'todo';
  };

  const toRgba = (hex, alpha) => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const deleteTask = async (task) => {
    const taskId = task._id || task.id;
    if (!taskId) return;
    if (!window.confirm('Delete this task?')) return;
    setGrouped((prev) => Object.fromEntries(statusOrder.map((status) => [status, (prev[status] || []).filter((item) => (item._id || item.id) !== taskId)])));
    setSelectedTask((prev) => (prev && (prev._id || prev.id) === taskId ? null : prev));
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch {
      await loadTasks();
    }
  };

  return (
    <PageShell breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: projectName || 'Project', to: `/project/${projectId}/board` }, { label: 'Board' }]}>
      <div className="h-full flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Kanban Board - {projectName || 'Project'}</h1>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">{viewers.slice(0, 5).map((v) => <Avatar key={v.socketId} src={v.avatar} name={v.userName} size="xs" className="ring-2 ring-dark-bg" />)}</div>
              <span className="text-xs text-gray-500">{viewers.length || 1} people viewing</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-dark-border rounded-lg p-1">
              <button onClick={() => setView('board')} className={cn("px-2 py-1 text-xs rounded-md flex items-center gap-1", view === 'board' && "bg-primary/20 text-primary")}><LayoutGrid size={14} /> Board</button>
              <button onClick={() => setView('list')} className={cn("px-2 py-1 text-xs rounded-md flex items-center gap-1", view === 'list' && "bg-primary/20 text-primary")}><List size={14} /> List</button>
              <button onClick={() => setView('calendar')} className={cn("px-2 py-1 text-xs rounded-md flex items-center gap-1", view === 'calendar' && "bg-primary/20 text-primary")}><CalendarDays size={14} /> Calendar</button>
            </div>
            <Input className="w-96" placeholder="New task title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Button size="sm" className="gap-2" onClick={createTask}><Plus size={14} /> New Task</Button>
          </div>
        </div>

        {view === 'board' && (
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {statusOrder.map((status) => (
              <KanbanColumn
                key={status}
                title={statusLabels[status]}
                tasks={(grouped[status] || []).map((task) => ({
                  ...task,
                  id: task._id || task.id,
                  status: statusLabels[task.status],
                  assignee: task.assigneeId?._id || task.assigneeId,
                  attachments: task.attachments?.length || 0,
                  comments: task.comments?.length || 0,
                  labels: task.labels || [],
                  dueDate: task.dueDate,
                  onDragStart: handleDragStart,
                  onDelete: deleteTask,
                }))}
                onTaskClick={(task) => setSelectedTask(allTasks.find((item) => (item._id || item.id) === task.id))}
                onAddTask={() => createTaskForStatus(status)}
                onDropTask={handleDrop(status)}
                users={users.map((u) => ({ ...u, id: u._id || u.id }))}
              />
            ))}
          </div>
        )}

        {view === 'list' && (
            <div className="surface rounded-2xl border border-dark-border overflow-hidden">
            <div className="grid grid-cols-7 text-xs text-gray-500 font-semibold px-4 py-3 border-b dark:border-dark-border">
              <span>Task</span>
              <span>Status</span>
              <span>Assignee</span>
              <span>Priority</span>
              <span>Due</span>
              <span>Labels</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y dark:divide-dark-border">
              {allTasks.map((task) => (
                <div
                  key={task._id || task.id}
                  className="grid grid-cols-7 px-4 py-3 text-sm text-left items-center hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <button onClick={() => setSelectedTask(task)} className="text-left font-medium">
                    {task.title}
                  </button>
                  <span className="text-gray-500">{statusLabels[task.status]}</span>
                  <span className="text-gray-500">{task.assigneeId?.name || 'Unassigned'}</span>
                  <span>{getPriorityBadge(task.priority)}</span>
                  <span className="text-gray-500">{formatDate(task.dueDate)}</span>
                  <span className="text-gray-500">{(task.labels || []).join(', ') || '—'}</span>
                  <button onClick={() => deleteTask(task)} className="text-gray-500 hover:text-danger justify-self-end">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'calendar' && (
          <div className="surface rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{calendarMonth.label}</h3>
              <span className="text-xs text-gray-500">{calendarMonth.cells.filter(Boolean).length} days</span>
            </div>
            <div className="grid grid-cols-7 text-[10px] text-gray-500 font-semibold">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarMonth.cells.map((cell, idx) => {
                const dominantStatus = cell?.tasks?.length ? getDominantStatus(cell.tasks) : null;
                const color = dominantStatus ? statusColors[dominantStatus] : null;
                const glowStyle = color ? { borderColor: color, boxShadow: `0 0 0 1px ${color}, 0 0 14px ${toRgba(color, 0.45)}` } : undefined;
                return (
                  <div
                    key={idx}
                    className={cn("min-h-[110px] rounded-xl border p-2 text-xs", cell ? "border-dark-border" : "border-transparent")}
                    style={glowStyle}
                  >
                    {cell && (
                      <div className="space-y-2">
                        <div className="text-[10px] text-gray-500">{cell.date.getDate()}</div>
                        <div className="space-y-1">
                          {cell.tasks.slice(0, 3).map((task) => (
                            <button
                              key={task._id || task.id}
                              onClick={() => setSelectedTask(task)}
                              className="w-full text-left flex items-center gap-2"
                            >
                              <span className={cn("w-2 h-2 rounded-full", task.status === 'todo' ? 'bg-gray-400' : task.status === 'in_progress' ? 'bg-info' : task.status === 'in_review' ? 'bg-warning' : 'bg-success')} />
                              <span className="truncate">{task.title}</span>
                            </button>
                          ))}
                          {cell.tasks.length > 3 && (
                            <span className="text-[10px] text-gray-500">+{cell.tasks.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className={cn("fixed inset-y-0 right-0 w-full max-w-lg surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l dark:border-dark-border", selectedTask ? "translate-x-0" : "translate-x-full")}>
        {selectedTask && (
          <div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto">
            <div className="flex items-center justify-between">
              <Badge variant="primary">DC-{(selectedTask._id || selectedTask.id).slice(-6).toUpperCase()}</Badge>
              <div className="flex items-center gap-4">
                <button onClick={() => deleteTask(selectedTask)} className="text-gray-500 hover:text-danger">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setSelectedTask(null)} className="text-gray-500 hover:text-white">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <input
                className="text-2xl font-bold bg-transparent border-b border-dark-border outline-none pb-2"
                value={taskDraft?.title || ''}
                onChange={(event) => setTaskDraft((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Priority</label>
                  <select
                    className="input-field mt-1"
                    value={taskDraft?.priority || 'P1'}
                    onChange={(event) => setTaskDraft((prev) => ({ ...prev, priority: event.target.value }))}
                  >
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Assignee</label>
                  <select
                    className="input-field mt-1"
                    value={taskDraft?.assigneeId || ''}
                    onChange={(event) => setTaskDraft((prev) => ({ ...prev, assigneeId: event.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    {users.map((person) => (
                      <option key={person._id || person.id} value={person._id || person.id}>{person.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Status</label>
                  <select
                    className="input-field mt-1"
                    value={taskDraft?.status || 'todo'}
                    onChange={(event) => setTaskDraft((prev) => ({ ...prev, status: event.target.value }))}
                  >
                    {statusOrder.map((status) => (
                      <option key={status} value={status}>{statusLabels[status]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Due date</label>
                  <input
                    type="date"
                    className="input-field mt-1"
                    value={taskDraft?.dueDate || ''}
                    onChange={(event) => setTaskDraft((prev) => ({ ...prev, dueDate: event.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Labels</label>
                <input
                  className="input-field mt-1"
                  value={labelInput}
                  onChange={(event) => setLabelInput(event.target.value)}
                  placeholder="design, api, urgent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Description</label>
                <textarea
                  className="input-field mt-1 min-h-[120px] resize-none"
                  value={taskDraft?.description || ''}
                  onChange={(event) => setTaskDraft((prev) => ({ ...prev, description: event.target.value }))}
                />
                {taskDraft?.description ? (
                  <div className="mt-3 rounded-xl border border-dark-border bg-black/10 dark:bg-white/5 p-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Markdown preview</p>
                    <MarkdownRenderer content={taskDraft.description} compact className="rounded-none" />
                  </div>
                ) : null}
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="gap-2" onClick={saveTask} disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold">Attachments</h4>
                <label className="text-xs text-primary flex items-center gap-1 cursor-pointer">
                  <Upload size={12} /> {uploading ? 'Uploading...' : 'Add file'}
                  <input type="file" className="hidden" onChange={uploadAttachment} />
                </label>
              </div>
              {(selectedTask.attachments || []).length === 0 && (
                <p className="text-xs text-gray-500">No attachments yet.</p>
              )}
              <div className="flex flex-col space-y-2">
                {(selectedTask.attachments || []).map((file) => (
                  <a
                    key={file._id || file.url}
                    href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${file.url}`}
                    className="text-xs text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {file.filename}
                  </a>
                ))}
              </div>
            </div>
            <form onSubmit={addComment} className="space-y-3 border-t dark:border-dark-border pt-6">
              <h4 className="font-bold">Comments <span className="text-xs text-gray-500">{selectedTask.comments?.length || 0}</span></h4>
              <textarea name="comment" placeholder="Add a comment... Use @Full Name to mention" className="w-full bg-black/10 dark:bg-white/5 border border-dark-border rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-primary h-20 resize-none" />
              <Button size="sm">Post Comment</Button>
              <div className="space-y-2">{selectedTask.comments?.map((comment) => <div key={comment._id} className="rounded-xl border border-dark-border bg-white/5 p-3"><p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">{comment.author?.name || "User"}</p><MarkdownRenderer content={comment.text || ''} compact className="rounded-none" /></div>)}</div>
            </form>
          </div>
        )}
      </div>
      {selectedTask && <div onClick={() => setSelectedTask(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />}
    </PageShell>
  );
};

export default KanbanPage;
