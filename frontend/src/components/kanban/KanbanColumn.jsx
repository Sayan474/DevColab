import { MoreHorizontal } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { cn } from '../../assets/utils';

export const KanbanColumn = ({ title, tasks, onAddTask, onTaskClick, users }) => {
    return (
        <div className="w-[300px] flex-shrink-0 flex flex-col gap-4">
            <div className={cn(
                "flex items-center justify-between p-2 border-t-2",
                title === 'To Do' ? "border-gray-500" : title === 'In Progress' ? "border-info" : title === 'In Review' ? "border-warning" : "border-success"
            )}>
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{title}</h3>
                    <span className="text-[10px] bg-dark-border px-1.5 py-0.5 rounded text-gray-500">{tasks.length}</span>
                </div>
                <button className="text-gray-500 hover:text-white"><MoreHorizontal size={14} /></button>
            </div>

            <div className="flex-1 space-y-3 bg-black/10 dark:bg-white/1 rounded-lg p-1">
                {tasks.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onClick={() => onTaskClick(task)} 
                        assignee={users.find(u => u.id === task.assignee)}
                    />
                ))}
                <button 
                    onClick={onAddTask}
                    className="w-full py-2 border border-dashed border-dark-border rounded-lg text-xs text-gray-500 hover:border-primary hover:text-primary transition-all"
                >
                    + Add Task
                </button>
            </div>
        </div>
    );
};
