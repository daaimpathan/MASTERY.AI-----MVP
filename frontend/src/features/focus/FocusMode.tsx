import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocus } from './FocusContext';
import FocusTimer from './FocusTimer';
import BlackHoleBackground from './BlackHoleBackground';

interface FocusModeProps {
    children: React.ReactNode;
}

const FocusMode = ({ children }: FocusModeProps) => {
    const { isDeepDive, endDeepDive, focusTopic } = useFocus();

    const [holdProgress, setHoldProgress] = useState(0);
    const [isThinking, setIsThinking] = useState(false);

    // Handle holding to exit
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isThinking) {
            interval = setInterval(() => {
                setHoldProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        endDeepDive();
                        return 0;
                    }
                    return prev + 2; // Takes ~2.5 seconds (50 ticks * 50ms)
                });
            }, 50);
        } else {
            setHoldProgress(0);
        }
        return () => clearInterval(interval);
    }, [isThinking, endDeepDive]);

    return (
        <AnimatePresence>
            {isDeepDive && (
                <motion.div
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black"
                >
                    {/* The Void */}
                    <BlackHoleBackground />

                    {/* HUD Overlay */}
                    <div className="relative z-10 w-full h-full flex flex-col pointer-events-none">

                        {/* Status Bar */}
                        <div className="w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                            <div className="flex items-center gap-3">
                                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-mono font-bold border border-red-500/50 animate-pulse">
                                    • LIVE BROADCAST
                                </span>
                                {isDeepDive && ( // Only show if active
                                    <span className="text-white/50 text-sm font-mono uppercase tracking-widest max-w-xs truncate">
                                        // {useFocus().focusTopic} (Cant call hook here directly inside render, grab from props or parent context)
                                    </span>
                                )}
                            </div>

                            {/* Central Timer HUD */}
                            <FocusTimer />

                            {/* Spacer for balance */}
                            <div className="w-32"></div>
                        </div>

                        {/* Central Focus Area (For assignments/content) */}
                        <div className="flex-1 flex items-center justify-center p-8 pointer-events-auto">
                            <div className="max-w-4xl w-full bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl overflow-y-auto max-h-[80vh]">
                                {children}
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="p-8 flex justify-center pb-12 pointer-events-auto relative z-50">
                            <button
                                onMouseDown={() => setIsThinking(true)}
                                onMouseUp={() => setIsThinking(false)}
                                onMouseLeave={() => setIsThinking(false)}
                                className="group relative px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all overflow-hidden"
                            >
                                <span className="relative z-10 text-sm font-bold tracking-widest uppercase">
                                    {holdProgress > 0 ? `DISENGAGING ${holdProgress}%` : "HOLD TO EXIT SINGULARITY"}
                                </span>
                                {/* Progress Bar Fill */}
                                <div
                                    className="absolute left-0 top-0 h-full bg-red-600/50 transition-all duration-75 ease-linear"
                                    style={{ width: `${holdProgress}%` }}
                                />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FocusMode;
