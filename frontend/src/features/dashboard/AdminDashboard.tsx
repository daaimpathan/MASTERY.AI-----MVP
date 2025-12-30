import {
    Shield,
    Users,
    Globe,
    Activity,
    Layers,
    ChevronRight
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    ZAxis,
    Cell
} from 'recharts';
import { Card, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';

import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    // Mock data for holistic institutional growth
    const institutionalMetrics = [
        { month: 'Sep', engagement: 68, mastery: 55 },
        { month: 'Oct', engagement: 72, mastery: 62 },
        { month: 'Nov', engagement: 78, mastery: 68 },
        { month: 'Dec', engagement: 82, mastery: 74 },
    ];

    const teacherPerformance = [
        { name: 'Dr. Aris', engagementIndex: 92, masteryGrowth: 85, students: 120 },
        { name: 'Prof. Leigh', engagementIndex: 78, masteryGrowth: 72, students: 85 },
        { name: 'Dr. Vance', engagementIndex: 65, masteryGrowth: 90, students: 150 },
        { name: 'Ms. Sato', engagementIndex: 88, masteryGrowth: 65, students: 95 },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Shield className="w-8 h-8 text-secondary-500" />
                        Admin Stratos
                    </h2>
                    <p className="text-slate-400 mt-1">Institutional health and cross-departmental analytics</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm">Export Report</Button>
                    <Button size="sm" onClick={() => navigate('/dashboard/users')}>Manage Users</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total User Population" value="1,240" icon={Users} trend="+85" />
                <StatCard label="Institutional Engagement" value="79%" icon={Activity} trend="+4.2%" />
                <StatCard label="Active PBL Projects" value="42" icon={Layers} trend="+6" />
                <StatCard label="System Uptime" value="99.9%" icon={Globe} color="text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Institutional Growth Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Institutional Mastery & Engagement Growth</CardTitle>
                        <CardDescription>Correlation between adaptive mastery and student retention</CardDescription>
                    </CardHeader>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={institutionalMetrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                                />
                                <Bar dataKey="engagement" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Avg Engagement" />
                                <Bar dataKey="mastery" fill="#d946ef" radius={[4, 4, 0, 0]} name="Avg Mastery" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Growth Heatmap (Scatter interpretation) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Teacher Success Matrix</CardTitle>
                    </CardHeader>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid stroke="#1e293b" />
                                <XAxis type="number" dataKey="engagementIndex" name="Engagement" stroke="#64748b" unit="%" />
                                <YAxis type="number" dataKey="masteryGrowth" name="Mastery" stroke="#64748b" unit="%" />
                                <ZAxis type="number" dataKey="students" range={[60, 400]} name="Students" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Teachers" data={teacherPerformance} fill="#38bdf8">
                                    {teacherPerformance.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-4 text-[10px] text-center text-slate-500 italic">Bubbles represent total student reach</p>
                </Card>
            </div>

            {/* Department Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['STEM', 'Humanities', 'Fine Arts'].map((dept) => (
                    <Card key={dept} className="group cursor-pointer">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{dept} Department</h4>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs text-slate-500">12 Courses Active</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const COLORS = ['#38bdf8', '#fbbf24', '#f87171', '#d946ef'];

export default AdminDashboard;
