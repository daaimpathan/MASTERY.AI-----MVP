import {
    Users,
    CheckCircle2,
    Activity,
    Target,
    Search,
    Plus,
    BookOpen,
    Brain,
    Calendar,
    BarChart2,
    Library
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
    LabelList
} from 'recharts';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import NeuralBackground from '../landing/NeuralBackground';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<'daily' | 'weekly'>('weekly');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data
    const engagementData = view === 'weekly' ? [
        { name: 'Mon', value: 65 },
        { name: 'Tue', value: 72 },
        { name: 'Wed', value: 85 },
        { name: 'Thu', value: 78 },
        { name: 'Fri', value: 90 },
        { name: 'Sat', value: 45 },
        { name: 'Sun', value: 30 },
    ] : [
        { name: '08:00', value: 20 },
        { name: '10:00', value: 45 },
        { name: '12:00', value: 88 },
        { name: '14:00', value: 76 },
        { name: '16:00', value: 92 },
        { name: '18:00', value: 40 },
        { name: '20:00', value: 15 },
    ];

    const masteryGaps = [
        { subject: 'Algebra', gap: 18 },
        { subject: 'Geometry', gap: 35 },
        { subject: 'Calculus', gap: 55 },
        { subject: 'Statistics', gap: 25 },
        { subject: 'Logic', gap: 10 },
    ];

    const atRiskStudents = [
        { name: 'Alex Thompson', issue: 'Low engagement in Calculus', risk: 'High' },
        { name: 'Sarah Miller', issue: 'Struggling with Algebra concepts', risk: 'Medium' },
        { name: 'Jason Lee', issue: 'Inconsistent PBL participation', risk: 'High' },
    ];

    return (
        <div className="space-y-8 relative pb-10">
            {/* Neural Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <NeuralBackground />
            </div>

            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 shadow-2xl shadow-emerald-500/20 animate-fade-in">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Teacher Command Center</h2>
                        <p className="text-emerald-100 text-lg">Real-time instructional insights and intervention queue</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Button
                                variant="outline"
                                className="gap-2 bg-white/10 border-emerald-400/30 text-white hover:bg-white/20 hover:text-white"
                                onClick={() => {
                                    setIsSearching(!isSearching);
                                    if (isSearching) setSearchQuery('');
                                }}
                            >
                                <Search className="w-4 h-4" />
                                {isSearching ? 'Close' : 'Search'}
                            </Button>
                            {isSearching && (
                                <div className="absolute top-full mt-2 right-0 w-64 glass p-2 rounded-xl border border-slate-200 dark:border-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-200 bg-white dark:bg-slate-900 shadow-xl">
                                    <input
                                        autoFocus
                                        placeholder="Type student name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 transition-all outline-none text-slate-900 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                        <Button
                            className="gap-2 shadow-lg shadow-black/20 bg-white text-emerald-600 hover:bg-emerald-50"
                            onClick={() => navigate('/dashboard/assignments/create')}
                        >
                            <Plus className="w-4 h-4" />
                            Create Task
                        </Button>
                    </div>
                </div>
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                {[
                    { title: 'Create Assignment', icon: BookOpen, color: 'bg-blue-500', path: '/dashboard/assignments/create' },
                    { title: 'Resource Requests', icon: Library, color: 'bg-emerald-500', path: '/dashboard/resources' },
                    { title: 'New Project', icon: Brain, color: 'bg-purple-500', path: '/dashboard/projects/create' },
                    { title: 'Class Analytics', icon: BarChart2, color: 'bg-blue-600', path: '/dashboard/analytics' },
                    { title: 'Schedule Poll', icon: Calendar, color: 'bg-amber-500', path: '/dashboard/polls' }
                ].map((item, index) => (
                    <Link
                        to={item.path}
                        key={index}
                        className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
                    >
                        <div className={`w-14 h-14 rounded-full ${item.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <item.icon className={`w-7 h-7 ${item.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors text-center">{item.title}</span>
                    </Link>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <StatCard label="Active Students" value="28" icon={Users} trend="+4%" className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm" />
                <StatCard label="Avg. Engagement" value="82%" icon={Activity} trend="+12%" className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm" />
                <StatCard label="Concepts Mastered" value="142" icon={CheckCircle2} trend="+8" className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm" />
                <StatCard label="At-Risk Alerts" value="3" icon={Target} color="text-rose-400" className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
                {/* Engagement Trend */}
                <Card className="lg:col-span-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-slate-900 dark:text-white">Class Engagement Trend</CardTitle>
                            <CardDescription>Aggregate participation across all active modules</CardDescription>
                        </div>
                        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                            <Button
                                variant={view === 'daily' ? 'secondary' : 'ghost'}
                                size="sm"
                                className={cn("text-xs h-8 px-4", view === 'daily' && "bg-white dark:bg-slate-700 shadow-sm")}
                                onClick={() => setView('daily')}
                            >
                                Daily
                            </Button>
                            <Button
                                variant={view === 'weekly' ? 'secondary' : 'ghost'}
                                size="sm"
                                className={cn("text-xs h-8 px-4", view === 'weekly' && "bg-white dark:bg-slate-700 shadow-sm")}
                                onClick={() => setView('weekly')}
                            >
                                Weekly
                            </Button>
                        </div>
                    </CardHeader>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={engagementData}>
                                <defs>
                                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#fff', marginBottom: '0.25rem' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#38bdf8" fillOpacity={1} fill="url(#colorEngagement)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Concept Mastery Balance */}
                <Card className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Concept Mastery Gaps</CardTitle>
                        <CardDescription>Target subjects for next lecture</CardDescription>
                    </CardHeader>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={masteryGaps}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                <XAxis dataKey="subject" stroke="#ffffff" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#fff', marginBottom: '0.25rem' }}
                                />
                                <Bar dataKey="gap" radius={[4, 4, 0, 0]} barSize={20}>
                                    {masteryGaps.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.gap > 25 ? '#f87171' : '#38bdf8'} />
                                    ))}
                                    <LabelList dataKey="gap" position="top" fill="#ffffff" fontSize={10} formatter={(value: any) => `${value}%`} /> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400 font-medium">Scores below 30 indicate critical concept gaps</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
                {/* At-Risk Students */}
                <Card className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="text-rose-500">At-Risk Intervention Queue</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dashboard/engagement')}
                        >
                            View All
                        </Button>
                    </CardHeader>
                    <div className="space-y-4">
                        {atRiskStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                            atRiskStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((student) => (
                                <div
                                    key={student.name}
                                    onClick={() => navigate('/dashboard/engagement')}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-primary-500/30 hover:bg-slate-100 dark:hover:bg-primary-500/5 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {student.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{student.issue}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${student.risk === 'High' ? 'text-rose-400 bg-rose-400/10' : 'text-amber-400 bg-amber-400/10'
                                            }`}>
                                            {student.risk} Risk
                                        </div>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">Declining Trend</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                                <p className="text-sm text-slate-500">No students matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* PBL Progress */}
                <Card className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="text-primary-500">Active PBL Overview</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dashboard/projects')}
                        >
                            Manage Boards
                        </Button>
                    </CardHeader>
                    <div className="space-y-6">
                        {[
                            { title: 'Smart City Infrastructure', progress: 75, teams: 6, status: 'Research phase' },
                            { title: 'Renewable Energy Lab', progress: 40, teams: 4, status: 'Experimentation' },
                        ].map((pbl) => (
                            <div key={pbl.title} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pbl.title}</h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{pbl.status} • {pbl.teams} Teams Active</p>
                                    </div>
                                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{pbl.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${pbl.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TeacherDashboard;
