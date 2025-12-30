import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Brain, X, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';
import { getGameById } from './GameRegistry';
import ScoreDashboard from './ScoreDashboard';

interface DailyGameInterfaceProps {
    onClose: () => void;
    onComplete: (score: number) => void;
}

const DailyGameInterface = ({ onClose, onComplete }: DailyGameInterfaceProps) => {
    const [gameState, setGameState] = useState<'loading' | 'intro' | 'playing' | 'result'>('loading');
    const [score, setScore] = useState(0);
    const [assignedGameId, setAssignedGameId] = useState<string | null>(null);
    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const data = await api.getDailyChallengeStatus();
                setStatus(data);
                // Use assigned_game_type from backend, fallback to neural_pattern
                setAssignedGameId(data.assigned_game_type || 'neural_pattern');
                setGameState('intro');
            } catch (error) {
                console.error("Failed to fetch game assignment", error);
                // Fallback to demo mode if API fails
                setStatus({ can_play: true, total_points: 0, last_played_date: null });
                setAssignedGameId('neural_pattern');
                setGameState('intro');
            }
        };
        fetchGame();
    }, []);

    const handleGameComplete = async (finalScore: number) => {
        setScore(finalScore);

        try {
            if (finalScore > 0 && assignedGameId) {
                await api.submitDailyChallenge({
                    score: finalScore,
                    game_type: assignedGameId
                });
                onComplete(finalScore);
            }
        } catch (err) {
            console.error("Failed to submit score", err);
        }

        setGameState('result');
    };

    const handleFailure = () => {
        handleGameComplete(0);
    };

    // Fallback loading state
    if (!assignedGameId) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="text-white animate-pulse">Accessing Neural Link...</div>
            </div>
        );
    }

    const GameMetadata = getGameById(assignedGameId);
    const GameComponent = GameMetadata.component;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
                <div className="relative w-full max-w-md mx-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="absolute -top-12 right-0 text-white hover:bg-white/10"
                    >
                        <X className="w-6 h-6" />
                    </Button>

                    <Card className={`bg-slate-900 border-${GameMetadata.color}-500/30 overflow-hidden shadow-2xl shadow-${GameMetadata.color}-500/20`}>
                        {/* Header */}
                        <div className={`p-6 text-center border-b border-white/10 bg-gradient-to-r from-${GameMetadata.color}-900/50 to-indigo-900/50`}>
                            <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                                <Brain className={`w-6 h-6 text-${GameMetadata.color}-400`} />
                                {GameMetadata.title}
                            </h2>
                            <p className={`text-${GameMetadata.color}-300 text-sm mt-1`}>Daily Cognitive Calibration</p>
                        </div>

                        <div className="p-8">
                            {gameState === 'loading' && (
                                <div className="text-center text-white">Initializing Neural Link...</div>
                            )}

                            {gameState === 'intro' && (
                                <div className="space-y-6">
                                    {/* Score Dashboard */}
                                    {status && (
                                        <ScoreDashboard
                                            totalPoints={status.total_points}
                                            lastPlayedDate={status.last_played_date}
                                        />
                                    )}

                                    <div className="text-center space-y-4">
                                        <div className={`w-20 h-20 mx-auto bg-${GameMetadata.color}-500/20 rounded-full flex items-center justify-center animate-pulse`}>
                                            <Trophy className={`w-10 h-10 text-${GameMetadata.color}-400`} />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-slate-300">{GameMetadata.description}</p>
                                        </div>

                                        {!status?.can_play ? (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center gap-2 justify-center">
                                                <AlertCircle className="w-4 h-4" />
                                                Calibration already completed for today.
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => setGameState('playing')}
                                                className={`w-full bg-${GameMetadata.color}-600 hover:bg-${GameMetadata.color}-700 text-white py-6 text-lg font-bold`}
                                            >
                                                Start Calibration
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {gameState === 'playing' && (
                                <GameComponent
                                    onComplete={handleGameComplete}
                                    onFailure={handleFailure}
                                />
                            )}

                            {gameState === 'result' && (
                                <div className="text-center space-y-6">
                                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${score > 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                        {score > 0 ? (
                                            <Trophy className="w-10 h-10 text-emerald-400" />
                                        ) : (
                                            <RotateCcw className="w-10 h-10 text-red-400" />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-3xl font-black text-white mb-2">
                                            {score > 0 ? 'Calibration Complete' : 'Sequence Failed'}
                                        </h3>
                                        <div className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-${GameMetadata.color}-400 to-indigo-400`}>
                                            +{score} NP
                                        </div>
                                    </div>

                                    <Button onClick={onClose} className="w-full bg-slate-700 hover:bg-slate-600 text-white">
                                        Return to Dashboard
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DailyGameInterface;
