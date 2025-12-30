import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20',
            secondary: 'bg-accent-600 hover:bg-accent-500 text-white shadow-lg shadow-accent-500/20',
            ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-transparent',
            danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20',
            outline: 'bg-transparent border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5'
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs',
            md: 'px-6 py-2.5 text-sm',
            lg: 'px-8 py-3.5 text-base'
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={cn(
                    'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
