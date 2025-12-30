import { Trophy, Star, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';

interface ScoreDashboardProps {
    totalPoints: number;
    lastPlayedDate: string | null;
}

const ScoreDashboard = ({ totalPoints, lastPlayedDate }: ScoreDashboardProps) => {
    // Conversion Logic: 10000 Points = 1 Mark
    const marksEarned = Math.floor(totalPoints / 10000);
    const progressToNextMark = (totalPoints % 10000) / 10000 * 100;

    return (
        <Card className="bg-slate-900 border-violet-500/20 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Cognitive Performance
                </h3>
                <span className="text-xs text-slate-400">
                    Last calibrated: {lastPlayedDate || 'Never'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-sm text-slate-400 mb-1">Total Neural Points</div>
                    <div className="text-2xl font-black text-fuchsia-400">{totalPoints.toLocaleString()} NP</div>
                </div>

                <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 p-4 rounded-xl border border-violet-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Star className="w-12 h-12 text-yellow-400" />
                    </div>
                    <div className="text-sm text-violet-300 mb-1 flex items-center gap-1">
                        Bonus Marks Earned
                        <TrendingUp className="w-3 h-3" />
                    </div>
                    <div className="text-3xl font-black text-white flex items-baseline gap-1">
                        {marksEarned}
                        <span className="text-sm font-medium text-white/50">marks</span>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progress to next mark</span>
                    <span>{Math.round(progressToNextMark)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000"
                        style={{ width: `${progressToNextMark}%` }}
                    />
                </div>
            </div>
        </Card>
    );
};

export default ScoreDashboard;
