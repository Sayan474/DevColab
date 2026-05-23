export const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

export const labelToStatus = {
  'To Do': 'todo',
  'In Progress': 'in_progress',
  'In Review': 'in_review',
  Done: 'done',
};

export const statusOrder = ['todo', 'in_progress', 'in_review', 'done'];

export const taskAssigneeId = (task) => task.assigneeId?._id || task.assigneeId || task.assignee;

export const formatDate = (value) => {
  if (!value) return 'No date';
  return new Date(value).toLocaleDateString();
};

export const timeAgo = (value) => {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(Math.floor(diff / 60000), 0);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};
