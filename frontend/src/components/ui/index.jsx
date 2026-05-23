import { forwardRef } from 'react';
import { cn } from '../../assets/utils';

export const Button = forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-danger text-white hover:bg-danger/90',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      ref={ref}
      className={cn('btn', variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

export const Badge = ({ className, variant = 'default', children }) => {
  const variants = {
    default: 'bg-gray-500/20 text-gray-400',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    danger: 'bg-danger/20 text-danger',
    info: 'bg-info/20 text-info',
    primary: 'bg-primary/20 text-primary',
  };

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', variants[variant], className)}>
      {children}
    </span>
  );
};

export const Avatar = ({ src, name, size = 'md', className }) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <img
      src={src}
      alt={name}
      className={cn('rounded-full bg-dark-border object-cover border-2 dark:border-dark-border light:border-light-border', sizes[size], className)}
    />
  );
};

export const Input = forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-xs font-medium text-gray-500">{label}</label>}
      <input
        ref={ref}
        className={cn('input-field', error && 'border-danger focus:ring-danger', className)}
        {...props}
      />
      {error && <p className="text-[10px] text-danger">{error}</p>}
    </div>
  );
});

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="surface glass relative w-full max-w-md rounded-xl shadow-2xl p-6 animate-fade-in">
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <div className="mb-6">{children}</div>
        {footer && <div className="flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};
