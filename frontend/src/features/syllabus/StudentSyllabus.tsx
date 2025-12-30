import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StudentSyllabus = () => {
    // Mock data based on what teacher would have entered
    const data = [
        { name: 'Completed', value: 65 },
        { name: 'Pending', value: 35 },
    ];

    const COLORS = ['#10b981', '#e2e8f0']; // Emerald for completed, Slate for pending

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Syllabus Progress</CardTitle>
                        <CardDescription>Calculus 101 Overview</CardDescription>
                    </CardHeader>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-16">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-slate-900 dark:text-white">65%</div>
                                <div className="text-sm text-slate-500">Completed</div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Topic Breakdown</CardTitle>
                        <CardDescription>Detailed status of course modules</CardDescription>
                    </CardHeader>
                    <div className="p-6 pt-0 space-y-4">
                        {[
                            { title: 'Limits & Continuity', status: 'COMPLETED' },
                            { title: 'Derivatives: Definition', status: 'COMPLETED' },
                            { title: 'Derivatives: Chain Rule', status: 'COMPLETED' },
                            { title: 'Applications of Derivatives', status: 'PENDING' },
                            { title: 'Integrals', status: 'PENDING' },
                        ].map((topic, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{topic.title}</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${topic.status === 'COMPLETED'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400'
                                    }`}>
                                    {topic.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StudentSyllabus;
