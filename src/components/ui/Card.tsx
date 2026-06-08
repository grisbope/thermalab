import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <section
      className={`rounded-lg border border-slate-700/60 bg-slate-900/80 p-4 shadow-glow backdrop-blur md:p-5 dark:border-slate-700/60 dark:bg-slate-900/80 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-lg font-bold text-slate-100">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
