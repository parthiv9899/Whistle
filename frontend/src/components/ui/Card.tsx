import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const baseStyles = 'bg-surface rounded-base border border-border transition-smooth';
  const hoverStyles = hover ? 'hover:bg-surface-hover hover:border-border-hover hover:shadow-card-hover cursor-pointer' : '';
  const clickStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${clickStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
