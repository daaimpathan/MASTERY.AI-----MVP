import { useNavigate } from 'react-router-dom';
import { Gamepad2, Play, Users, Zap } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const AdaptivePractice = () => {
    const navigate = useNavigate();

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mastery Hub</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Launch live quizzes and track student mastery in real-time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Host Live Quiz Card */}
                <Card className="p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/40 transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => navigate('/dashboard/quiz/host')}>
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <Gamepad2 className="w-10 h-10" />
                        </div>
                        <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
                            Live
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Host Live Quiz</h2>
                    <p className="text-primary-100 mb-6">Create a real-time multiplayer quiz challenge. Students join automatically and compete live!</p>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                        <div className="flex items-center gap-2 text-sm text-primary-100">
                            <Users className="w-4 h-4" />
                            <span>Auto-join enabled</span>
                        </div>
                        <Button className="ml-auto bg-white text-primary-600 hover:bg-primary-50 border-none shadow-lg group-hover:scale-105 transition-transform">
                            <Play className="w-4 h-4 mr-2" /> Launch
                        </Button>
                    </div>
                </Card>

                {/* Quick Practice Card */}
                <Card className="p-8 bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/40 transition-all hover:scale-[1.02] cursor-pointer group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <Zap className="w-10 h-10" />
                        </div>
                        <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
                            Adaptive
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Adaptive Practice</h2>
                    <p className="text-amber-100 mb-6">AI-powered practice that adapts to each student's mastery level automatically.</p>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                        <div className="flex items-center gap-2 text-sm text-amber-100">
                            <Zap className="w-4 h-4" />
                            <span>Personalized difficulty</span>
                        </div>
                        <Button
                            className="ml-auto bg-white text-amber-600 hover:bg-amber-50 border-none shadow-lg group-hover:scale-105 transition-transform"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/dashboard/quiz/host');
                            }}
                        >
                            Start Now
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">12</p>
                    <p className="text-sm text-slate-500">Quizzes Hosted</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-primary-600">156</p>
                    <p className="text-sm text-slate-500">Total Participants</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-600">78%</p>
                    <p className="text-sm text-slate-500">Avg. Score</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-amber-600">24</p>
                    <p className="text-sm text-slate-500">Questions Bank</p>
                </Card>
            </div>
        </div>
    );
};

export default AdaptivePractice;
