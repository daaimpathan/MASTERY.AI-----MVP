import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    className?: string;
    hover?: boolean;
}

export const Card = ({ children, className, hover = true, ...props }: CardProps) => {
    return (
        <div
            className={cn(
                "glass p-6 shadow-xl relative overflow-hidden",
                hover && "card-hover",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cn("mb-6", className)}>{children}</div>
);

export const CardTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
    <h3 className={cn("text-lg font-bold text-slate-900 dark:text-white", className)}>{children}</h3>
);

export const CardDescription = ({ children, className }: { children: ReactNode; className?: string }) => (
    <p className={cn("text-sm text-slate-500 dark:text-slate-400 mt-1", className)}>{children}</p>
);
