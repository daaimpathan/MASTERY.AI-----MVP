import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
    Users,
    CheckCircle2,
    ArrowUpRight,
    Search,
    MoreVertical,
    ChevronLeft
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface SubmissionData {
    id: string;
    groupName: string;
    members: string[];
    submittedAt: string;
    score: number | null;
    feedback: string | null;
    status: 'Graded' | 'Pending';
}

const ProjectSubmissions = () => {
    const { id } = useParams();

    const { data: submissions, isLoading } = useQuery<SubmissionData[]>({
        queryKey: ['project-submissions', id],
        queryFn: () => api.get(`/projects/${id}/submissions`).then(res => res.data)
    });

    // Mock submissions
    const mockSubmissions: SubmissionData[] = [
        { id: 'S1', groupName: 'Team Alpha', members: ['Alice', 'Bob'], submittedAt: '2024-05-10', score: 85, feedback: 'Excellent technical depth.', status: 'Graded' },
        { id: 'S2', groupName: 'Solar Pioneers', members: ['Charlie', 'Dana'], submittedAt: '2024-05-12', score: null, feedback: null, status: 'Pending' },
        { id: 'S3', groupName: 'Eco-Builders', members: ['Eve', 'Frank'], submittedAt: '2024-05-14', score: 92, feedback: 'Very creative approach.', status: 'Graded' },
    ];

    const displaySubmissions = submissions || mockSubmissions;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link to={`/dashboard/projects/${id}`}>
                    <Button variant="ghost" size="sm" className="rounded-full bg-slate-800 p-2">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Submission Console</h2>
                    <p className="text-slate-400 mt-1">Reviewing work evidence for Project ID: {id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Received', value: '12', color: 'text-primary-400' },
                    { label: 'Pending Review', value: '5', color: 'text-amber-400' },
                    { label: 'Avg Achievement', value: '78%', color: 'text-emerald-400' },
                    { label: 'Incomplete', value: '2', color: 'text-rose-400' },
                ].map((stat, i) => (
                    <Card key={i}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <div>
                        <CardTitle>Evidence Queue</CardTitle>
                        <CardDescription>Filter and evaluate team contributions</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                            <input type="text" placeholder="Filter teams..." className="bg-slate-900 border border-white/5 rounded-lg pl-8 pr-4 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500" />
                        </div>
                        <Button variant="ghost" size="sm" className="bg-slate-800 p-2">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Team / Group</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Evidence Count</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Submission Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading && !submissions ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 animate-pulse">Scanning records...</td></tr>
                            ) : displaySubmissions.map((sub) => (
                                <tr key={sub.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-primary-400 group-hover:bg-primary-500/10 transition-all">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{sub.groupName}</p>
                                                <p className="text-[10px] text-slate-500">{sub.members.join(', ')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => <div key={i} className="w-4 h-1 rounded-full bg-primary-500/20"></div>)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs text-slate-400 font-medium">{sub.submittedAt}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.status === 'Graded' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'
                                            }`}>
                                            {sub.status === 'Graded' && <CheckCircle2 className="w-2.5 h-2.5" />}
                                            {sub.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <Link to={`/dashboard/projects/evaluate/${sub.id}`}>
                                            <Button variant="ghost" size="sm" className="group-hover:bg-primary-500/10 group-hover:text-primary-400">
                                                Evaluate
                                                <ArrowUpRight className="w-3 h-3 ml-2" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ProjectSubmissions;
