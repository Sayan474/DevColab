import { Badge, Avatar } from "../ui";
import { Paperclip, MessageSquare, MoreHorizontal } from "lucide-react";

export const TaskCard = ({ task, onClick, assignee }) => {
  const getPriorityBadge = (p) => {
    if (p === "P0")
      return (
        <Badge
          variant="danger"
          className="bg-danger/20 text-danger border-none"
        >
          P0
        </Badge>
      );
    if (p === "P1")
      return (
        <Badge
          variant="warning"
          className="bg-amber-500/20 text-amber-400 border-none"
        >
          P1
        </Badge>
      );
    return (
      <Badge
        variant="info"
        className="bg-blue-500/20 text-blue-400 border-none"
      >
        P2
      </Badge>
    );
  };

  return (
    <div
      onClick={onClick}
      className="surface p-4 rounded-xl space-y-4 hover:translate-y-[-2px] transition-all cursor-pointer group shadow-sm border dark:border-dark-border/50"
    >
      <div className="flex items-center justify-between">
        {getPriorityBadge(task.priority)}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="text-gray-500 hover:text-white">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">
        {task.title}
      </h4>
      <div className="flex flex-wrap gap-1">
        {task.labels.map((l) => (
          <span
            key={l}
            className="text-[10px] text-gray-500 bg-dark-border px-1.5 py-0.5 rounded font-medium"
          >
            #{l}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-dark-border/50">
        <div className="flex items-center gap-3 text-gray-500">
          {task.attachments > 0 && (
            <span className="text-[10px] flex items-center gap-1">
              <Paperclip size={10} /> {task.attachments}
            </span>
          )}
          <span className="text-[10px] flex items-center gap-1">
            <MessageSquare size={10} /> 4
          </span>
        </div>
        <Avatar src={assignee?.avatar} name={assignee?.name} size="xs" />
      </div>
    </div>
  );
};
