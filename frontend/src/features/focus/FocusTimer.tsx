import { Clock, Zap, AlertTriangle } from 'lucide-react';
import { useFocus } from './FocusContext';

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const FocusTimer = () => {
    const { sessionDuration, darkEnergyMined, distractions, isDistracted } = useFocus();

    return (
        <div className={`
            flex items-center gap-6 px-6 py-3 rounded-full border backdrop-blur-md transition-all duration-500
            ${isDistracted
                ? 'bg-red-900/40 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-black/40 border-white/10 shadow-lg'}
        `}>
            {/* Timer */}
            <div className="flex items-center gap-2 text-white font-mono text-xl tracking-wider font-bold">
                <Clock className={`w-5 h-5 ${isDistracted ? 'text-red-400' : 'text-blue-400'}`} />
                {formatTime(sessionDuration)}
            </div>

            <div className="w-px h-6 bg-white/20"></div>

            {/* Dark Energy Count */}
            <div className="flex items-center gap-2 font-mono font-bold">
                <Zap className={`w-5 h-5 ${isDistracted ? 'text-slate-500' : 'text-yellow-400 fill-yellow-400'}`} />
                <span className={`${isDistracted ? 'text-slate-400' : 'text-yellow-400'}`}>
                    +{darkEnergyMined} DE
                </span>
            </div>

            {/* Distractions Alert */}
            {distractions > 0 && (
                <>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="flex items-center gap-2 text-red-400 font-mono font-bold animate-pulse">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{distractions} DISTRACTIONS</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default FocusTimer;
