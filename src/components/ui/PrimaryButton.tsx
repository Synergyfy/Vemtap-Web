import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function PrimaryButton({
  children,
  className = '',
  type = 'button',
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`w-full h-[54px] bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}