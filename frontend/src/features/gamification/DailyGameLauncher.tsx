import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';
import api from '../../services/api';
import DailyGameInterface from './DailyGameInterface';

const DailyGameLauncher = () => {
    const [status, setStatus] = useState<{ can_play: boolean; next_play_at: string | null }>({
        can_play: false,
        next_play_at: null
    });
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const data = await api.getDailyChallengeStatus();
            setStatus(data);
        } catch (error) {
            console.error("Failed to fetch game status", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleComplete = () => {
        // Refresh status to start cooldown
        fetchStatus();
    };

    if (loading) return null;

    return (
        <>
            <AnimatePresence>
                {status.can_play && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 left-6 z-40"
                    >
                        <div className="relative group">
                            {/* Pulse effect */}
                            <div className="absolute inset-0 bg-fuchsia-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 animate-pulse transition-opacity" />

                            <button
                                onClick={() => setIsOpen(true)}
                                className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-full shadow-lg border border-white/20 hover:scale-110 active:scale-95 transition-all duration-300 group-hover:rotate-12"
                            >
                                <Gamepad2 className="w-7 h-7" />
                            </button>

                            {/* Tooltip */}
                            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none translate-x-2 group-hover:translate-x-0">
                                Play Daily Challenge
                                <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-slate-900" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cooldown Indicator (Optional - visible if game not playable?) 
                Currently only showing when playable to keep UI clean, 
                but we could show a "locked" state if desired.
            */}

            {isOpen && (
                <DailyGameInterface
                    onClose={() => setIsOpen(false)}
                    onComplete={handleComplete}
                />
            )}
        </>
    );
};

export default DailyGameLauncher;
