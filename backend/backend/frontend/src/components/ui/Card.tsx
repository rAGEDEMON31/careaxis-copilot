import React from 'react';
import { cn } from '@/src/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const Card = ({ title, subtitle, footer, children, className, ...props }: CardProps) => {
  return (
    <div className={cn('card-medical', className)} {...props}>
      {(title || subtitle) && (
        <div className="border-b border-slate-100 px-6 py-4">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3">{footer}</div>}
    </div>
  );
};
