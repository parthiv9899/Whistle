import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-base transition-smooth inline-flex items-center justify-center gap-2';

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-hover active:bg-primary-active text-white disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-surface hover:bg-surface-hover active:bg-border text-text border border-border disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent hover:bg-surface-hover text-text disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-error hover:bg-error/90 active:bg-error/80 text-white disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
