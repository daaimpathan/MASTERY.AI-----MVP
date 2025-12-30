import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: string;
    className?: string;
}

export const StatCard = ({ label, value, icon: Icon, trend, color = 'text-primary-400', className }: StatCardProps) => {
    return (
        <Card className={cn("group", className)}>
            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className="flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-400/10">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>

            {/* Background Shape */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-200/20 dark:bg-white/5 rounded-full blur-2xl group-hover:bg-primary-500/5 transition-all"></div>
        </Card>
    );
};
