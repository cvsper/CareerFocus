import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  action?: React.ReactNode;
}
export function Card({
  children,
  className = '',
  title,
  description,
  footer,
  action
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>

      {(title || description || action) &&
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start">
          <div>
            {title &&
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          }
            {description &&
          <p className="text-sm text-slate-500 mt-1">{description}</p>
          }
          </div>
          {action && <div className="ml-4">{action}</div>}
        </div>
      }
      <div className="p-6">{children}</div>
      {footer &&
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          {footer}
        </div>
      }
    </div>);

}