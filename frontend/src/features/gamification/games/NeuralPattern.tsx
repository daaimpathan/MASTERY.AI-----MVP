import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface NeuralPatternProps {
    onComplete: (score: number) => void;
    onFailure: () => void;
}

const GRID_SIZE = 3;
const SEQUENCE_LENGTH = 5;

const NeuralPattern = ({ onComplete, onFailure }: NeuralPatternProps) => {
    const [gameState, setGameState] = useState<'memorize' | 'recall'>('memorize');
    const [pattern, setPattern] = useState<number[]>([]);
    const [playerSequence, setPlayerSequence] = useState<number[]>([]);
    const [showingIndex, setShowingIndex] = useState(-1);
    const [timeLeft, setTimeLeft] = useState(15);

    // Initial Pattern Generation
    useEffect(() => {
        const newPattern = [];
        for (let i = 0; i < SEQUENCE_LENGTH; i++) {
            newPattern.push(Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)));
        }
        setPattern(newPattern);
    }, []);

    // Play pattern animation
    useEffect(() => {
        if (pattern.length > 0 && gameState === 'memorize') {
            let i = 0;
            const interval = setInterval(() => {
                setShowingIndex(pattern[i]);
                setTimeout(() => setShowingIndex(-1), 500); // Highlight duration
                i++;
                if (i >= pattern.length) {
                    clearInterval(interval);
                    setTimeout(() => setGameState('recall'), 800);
                }
            }, 800); // Delay between flashes

            return () => clearInterval(interval);
        }
    }, [gameState, pattern]);

    // Timer for recall phase
    useEffect(() => {
        if (gameState === 'recall') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        onFailure();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState, onFailure]);

    const handleTileClick = (index: number) => {
        if (gameState !== 'recall') return;

        const newSequence = [...playerSequence, index];
        setPlayerSequence(newSequence);

        // Check correct input immediately
        if (pattern[newSequence.length - 1] !== index) {
            onFailure();
            return;
        }

        if (newSequence.length === pattern.length) {
            const finalScore = (timeLeft * 10) + 100;
            onComplete(finalScore);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-slate-400 text-sm font-medium">
                <span>{gameState === 'memorize' ? 'WATCH SEQUENCE' : 'REPLICATE SEQUENCE'}</span>
                <div className={`flex items-center gap-2 ${timeLeft < 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    <Clock className="w-4 h-4" />
                    {timeLeft}s
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 aspect-square max-w-[300px] mx-auto">
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                    <motion.button
                        key={i}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTileClick(i)}
                        className={`rounded-xl border-2 transition-all duration-200 ${showingIndex === i
                                ? 'bg-fuchsia-500 border-fuchsia-400 shadow-[0_0_20px_rgba(232,121,249,0.5)] scale-105'
                                : 'bg-slate-800/50 border-white/5 hover:border-white/10'
                            }`}
                        disabled={gameState !== 'recall'}
                    />
                ))}
            </div>
        </div>
    );
};

export default NeuralPattern;
