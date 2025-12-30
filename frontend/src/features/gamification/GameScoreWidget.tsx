import { useEffect, useState } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

const GameScoreWidget = () => {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await api.getDailyChallengeStatus();
                setStatus(data);
            } catch (error) {
                console.error("Failed to fetch game status", error);
                // Fallback data so widget is visible even on error
                setStatus({ total_points: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    // Default values if status is null or loading
    const totalPoints = status?.total_points || 0;

    // Conversion Logic: 10,000 Points = 1 Mark
    const marksEarned = Math.floor(totalPoints / 10000);
    const progressToNextMark = (totalPoints % 10000) / 10000 * 100;

    return (
        <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 border-violet-500/30 overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <Trophy className="w-16 h-16 text-violet-500 rotate-12" />
            </div>

            <div className="p-5 relative z-10 flex flex-col justify-between h-full">
                <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Cognitive Score
                </h3>

                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        <div className="h-10 bg-slate-700 rounded-xl w-full"></div>
                        <div className="h-2 bg-slate-700 rounded-full w-full"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm text-slate-400">Total Points</span>
                            <span className="text-2xl font-black text-fuchsia-400">{totalPoints.toLocaleString()}</span>
                        </div>

                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-bold text-white">Bonus Marks</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-white leading-none">{marksEarned}</span>
                                <span className="text-xs text-slate-400 mb-1">marks earned</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1 uppercase font-bold tracking-wider">
                                <span>Next Mark</span>
                                <span>{Math.round(progressToNextMark)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${progressToNextMark}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default GameScoreWidget;
