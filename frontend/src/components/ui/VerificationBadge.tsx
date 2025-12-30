import { Shield, Check, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface VerificationBadgeProps {
    thoughtProofId: string;
    verifiedAt: Date;
    replayHash: string;
    onClick?: () => void;
}

const VerificationBadge = ({ thoughtProofId, verifiedAt, replayHash, onClick }: VerificationBadgeProps) => {
    return (
        <div
            onClick={onClick}
            className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all group"
        >
            {/* Shield Icon with Glow */}
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-md animate-pulse"></div>
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" fill="currentColor" />
                    <Check className="w-3 h-3 text-white absolute" strokeWidth={3} />
                </div>
            </div>

            {/* Badge Content */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        Verified Human Thought
                    </h4>
                    <ExternalLink className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {format(verifiedAt, 'MMM d, yyyy • h:mm a')}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                    Hash: {replayHash.slice(0, 16)}...
                </p>
            </div>

            {/* Verified Checkmark */}
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
        </div>
    );
};

export default VerificationBadge;
