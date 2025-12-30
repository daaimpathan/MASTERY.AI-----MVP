import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
    AlertCircle,
    Calendar,
    Layers,
    FileText,
    MessageSquare,
    CheckCircle2,
    Users,
    ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Card, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import SubmitWorkModal from './SubmitWorkModal';
import ProjectForum from './ProjectForum';
import { useState } from 'react';

interface RubricCriterion {
    criterion_name: string;
    max_score: number;
    weight: number;
    description: string;
}

interface Rubric {
    id: string;
    name: string;
    description: string;
    criteria: RubricCriterion[];
}

interface ProjectDetailData {
    id: string;
    title: string;
    subject: string;
    description: string;
    end_date: string;
    is_group_project: boolean;
    max_group_size: number;
    rubric: Rubric;
}

const ProjectDetails = () => {
    const { id } = useParams();
    const { user } = useAuthStore();
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showForum, setShowForum] = useState(false);

    const { data: project, isLoading } = useQuery<ProjectDetailData>({
        queryKey: ['project', id],
        queryFn: () => api.get(`/projects/${id}`).then(res => res.data)
    });

    // Mock data if API fails
    const mockProject: ProjectDetailData = {
        id: '1',
        title: 'Sustainable Urban Planning',
        subject: 'Social Studies & Engineering',
        description: 'Design a carbon-neutral city layout for 50,000 residents, considering renewable energy, waste management, and green transit systems. Use multidisciplinary concepts to evaluate trade-offs between cost and impact.',
        deadline: '2024-05-15',
        minGroups: 2,
        maxGroups: 4,
        status: 'Active',
        rubric: [
            { criterion: 'Technical Viability', weight: 30, description: 'Scientific accuracy of energy and waste models.' },
            { criterion: 'Interdisciplinary Insight', weight: 25, description: 'Synthesis of economic and social factors.' },
            { criterion: 'Creative Delivery', weight: 25, description: 'Novelty of solutions and presentation quality.' },
            { criterion: 'Team Collaboration', weight: 20, description: 'Balanced contribution and evidence of group work.' },
        ]
    };

    const displayProject = project || mockProject;

    if (isLoading) return <div className="animate-pulse glass h-[600px]"></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex items-center gap-4">
                <Link to="/dashboard/projects">
                    <Button variant="ghost" size="sm" className="rounded-full bg-slate-100 dark:bg-slate-800 p-2">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{displayProject.title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{displayProject.subject}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mission Brief</CardTitle>
                        </CardHeader>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {displayProject.description}
                        </p>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Rubric</CardTitle>
                            <CardDescription>Performance metrics for final evaluation</CardDescription>
                        </CardHeader>
                        <div className="space-y-6">
                            {displayProject.rubric?.criteria?.map((item, i) => (
                                <div key={i} className="relative pl-6 border-l-2 border-slate-100 dark:border-primary-500/20 group">
                                    <div className="absolute left-[-2px] top-0 w-[2px] h-0 bg-primary-600 dark:bg-primary-500 group-hover:h-full transition-all duration-500"></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{item.criterion_name}</h4>
                                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded">{Math.round(item.weight * 100)}%</span>
                                    </div>
                                    <p className="text-xs text-slate-500 transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-300">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="border-l-4 border-l-primary-500">
                        <CardHeader className="mb-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Project Vital Signs</CardTitle>
                        </CardHeader>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary-600 dark:text-primary-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Final Submission</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{displayProject.end_date}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-amber-500 dark:text-amber-400">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Team Constraints</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{displayProject.max_group_size} Members</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Phase</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Execution</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-3">
                        {user?.role?.toLowerCase() === 'student' ? (
                            <Button
                                onClick={() => setShowSubmitModal(true)}
                                className="w-full h-14 rounded-2xl gap-2 font-black uppercase tracking-widest"
                            >
                                <FileText className="w-5 h-5" />
                                Submit Work Evidence
                            </Button>
                        ) : (
                            <Link to={`/dashboard/projects/${id}/submissions`} className="block">
                                <Button className="w-full h-14 rounded-2xl gap-2 font-black uppercase tracking-widest">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Review Submissions
                                </Button>
                            </Link>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setShowForum(true)}
                            className="w-full h-14 rounded-2xl gap-2 font-black uppercase tracking-widest"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Project Forum
                        </Button>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            Submission evidence must include both design models and a recorded presentation for full credit in creative delivery.
                        </p>
                    </div>
                </div>
            </div>

            {showSubmitModal && id && (
                <SubmitWorkModal
                    projectId={id}
                    onClose={() => setShowSubmitModal(false)}
                />
            )}

            {showForum && id && (
                <ProjectForum
                    projectId={id}
                    projectTitle={displayProject.title}
                    onClose={() => setShowForum(false)}
                />
            )}
        </div>
    );
};

export default ProjectDetails;
