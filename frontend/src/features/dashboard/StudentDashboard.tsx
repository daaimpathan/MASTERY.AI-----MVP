import {
    Trophy,
    Brain,
    Target,
    Zap,
    Clock,
    ArrowRight,
    BookOpen,
    Layers,
    MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import NeuralBackground from '../landing/NeuralBackground';
import NeuralGalaxy from '../galaxy/NeuralGalaxy';
import GameScoreWidget from '../gamification/GameScoreWidget';

import { useState } from 'react';
import FocusMode from '../focus/FocusMode';
import FocusSetup from '../focus/FocusSetup';
import { FocusProvider, useFocus } from '../focus/FocusContext';

const DashboardContent = () => {
    // Mock data for student mastery radar chart


    const recommendations = [
        { title: 'Practice: Quadratic Equations', level: 'Action Required', concept: 'Algebra', XP: '+15' },
        { title: 'Review: Limits & Continuity', level: 'Hard', concept: 'Calculus', XP: '+30' },
        { title: 'Challenge: Logic Paradoxes', level: 'Expert', concept: 'Philosophy', XP: '+50' },
    ];

    const { startDeepDive, focusTopic, questions } = useFocus();
    const [isSetupOpen, setIsSetupOpen] = useState(false);

    // ... existing recommendations ...

    return (
        <>
            <FocusSetup
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onStart={(topic) => {
                    startDeepDive(topic);
                    setIsSetupOpen(false);
                }}
            />

            <FocusMode>
                {/* Content shown inside the Black Hole */}
                <div className="space-y-6 text-white w-full max-w-4xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Deep Dive Active</h2>
                        <p className="text-slate-400">Distractions are disabled. Timer resets on tab switch.</p>
                    </div>

                    {/* AI Assignment Content */}
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">{focusTopic || "Deep Work Session"}</h3>
                                <p className="text-slate-400 text-sm">Target Locked</p>
                            </div>
                            <div className="bg-indigo-500/20 px-4 py-2 rounded-lg border border-indigo-500/30">
                                <span className="text-indigo-400 font-mono font-bold">AI GENERATED</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {questions && questions.length > 0 ? (
                                questions.map((q, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-indigo-500/50 transition-colors">
                                        <p className="text-slate-300 font-medium text-lg leading-relaxed">{q}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl mt-4">
                                    <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
                                    <p className="text-slate-500 font-mono text-sm">SYNTHESIZING ASSIGNMENT...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </FocusMode>

            <div className="space-y-8 relative pb-10">
                {/* Neural Background - Fixed position */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                    <NeuralBackground />
                </div>

                {/* Header with Focus Trigger */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 shadow-2xl shadow-indigo-500/20 animate-fade-in">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tight mb-2">Student Hub</h2>
                            <p className="text-indigo-100 font-medium text-lg">Your personalized learning path and mastery growth</p>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={() => setIsSetupOpen(true)}
                                className="bg-black/20 hover:bg-black/40 text-white border border-white/20 backdrop-blur-md whitespace-nowrap gap-2"
                            >
                                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                Deep Dive Mode
                            </Button>

                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col gap-2 min-w-[200px] animate-slide-left">
                                <div className="flex justify-between items-center text-sm font-bold text-indigo-100">
                                    <span>LEVEL 14</span>
                                    <span>12,450 / 15,000 XP</span>
                                </div>
                                <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 w-[83%] shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ... rest of existing dashboard content ... */}


                {/* Quick Access Grid - New Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}> {/* Added animate-slide-up and delay */}
                    <Link to="/dashboard/student/assignments" className="group">
                        <div className="h-full p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                                <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Assignments</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">View pending homework and submit tasks</p>
                        </div>
                    </Link>

                    <Link to="/dashboard/projects" className="group">
                        <div className="h-full p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                                <Layers className="w-6 h-6 text-pink-600 dark:text-pink-400 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">PBL Projects</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Collaborate on real-world challenges</p>
                        </div>
                    </Link>

                    <Link to="/dashboard/student/interventions" className="group">
                        <div className="h-full p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center mb-4 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                <MessageSquare className="w-6 h-6 text-sky-600 dark:text-sky-400 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">My Tutor</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Get help from your AI assistant</p>
                        </div>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}> {/* Added animate-slide-up and delay */}
                    <StatCard label="Overall Mastery" value="74%" icon={Trophy} trend="+2.5%" color="text-amber-500 dark:text-amber-400" />
                    <StatCard label="Concepts Learned" value="38" icon={Brain} trend="+3" color="text-emerald-500 dark:text-emerald-400" />
                    <StatCard label="PBL Contribution" value="High" icon={Target} color="text-rose-500 dark:text-rose-400" />
                    <StatCard label="Daily Streak" value="12 Days" icon={Zap} color="text-yellow-500 dark:text-yellow-400" />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-slide-up" style={{ animationDelay: '250ms' }}>
                    {/* Neural Galaxy Section - Spans 3 columns */}
                    <Card className="lg:col-span-3 bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-purple-500/30 overflow-hidden">
                        <CardHeader className="border-b border-purple-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                        🌌 Neural Constellation
                                    </CardTitle>
                                    <CardDescription className="text-purple-200/70">
                                        Explore your knowledge universe in 3D
                                    </CardDescription>
                                </div>
                                <Link to="/dashboard/galaxy">
                                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2">
                                        Enter Galaxy
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <div className="h-[400px] w-full">
                            <NeuralGalaxy />
                        </div>
                    </Card>

                    {/* Game Score Widget - Right Sidebar */}
                    <div className="lg:col-span-1">
                        <GameScoreWidget />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
                    {/* Smart Recommendations */}
                    <Card className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400">AI Path Recommendations</CardTitle>
                            <CardDescription>Tailored for your current mastery gaps</CardDescription>
                        </CardHeader>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recommendations.map((rec, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase mb-1">{rec.level}</p>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{rec.title}</h4>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-[10px] text-slate-500 font-medium">{rec.concept}</span>
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-white bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-full">{rec.XP} XP</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-6 text-xs font-bold gap-2 border-slate-200 dark:border-slate-700 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50">
                            View Full Path
                            <ArrowRight className="w-3 h-3" />
                        </Button>
                    </Card>
                </div>

                {/* Recent Activity/Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-white">Upcoming Deadlines</CardTitle>
                        </CardHeader>
                        <div className="space-y-4">
                            {[
                                { task: 'Smart City PBL Submission', due: 'In 2 days', type: 'PBL' },
                                { task: 'Weekly Adaptive Quiz', due: 'Tomorrow', type: 'Practice' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-transparent">
                                            <Clock className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{item.task}</p>
                                            <p className="text-xs text-slate-500 font-medium">{item.type}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-500/10 px-3 py-1 rounded-full">{item.due}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-white">Recent Achievements</CardTitle>
                        </CardHeader>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: 'Algebra Ace', desc: 'Mastered 5 concepts in Algebra', icon: Brain, color: 'text-violet-500 dark:text-violet-400' },
                                { title: 'Early Bird', desc: 'Submitted 3 projects early', icon: Zap, color: 'text-yellow-500 dark:text-yellow-400' },
                            ].map((ach, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex flex-col items-center text-center hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">
                                    <ach.icon className={`w-10 h-10 ${ach.color} mb-3`} />
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{ach.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{ach.desc}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
};

const StudentDashboard = () => (
    <FocusProvider>
        <DashboardContent />
    </FocusProvider>
);

export default StudentDashboard;
