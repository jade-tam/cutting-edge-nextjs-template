import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  const loadingClass = isLoading ? 'loading' : '';

  const classes = `${baseClasses} ${variantClasses} ${sizeClasses} ${loadingClass} ${className}`;

  return (
    <button
      className={classes}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {!isLoading && children}
    </button>
  );
}