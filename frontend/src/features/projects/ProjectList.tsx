import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
    BookOpen,
    Calendar,
    Users,
    Plus,
    Search,
    Filter,
    ChevronRight,
    Trash2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';



const ProjectList = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: projects, isLoading } = useQuery<any[]>({
        queryKey: ['projects'],
        queryFn: () => api.get('/projects/').then(res => res.data)
    });

    const deleteMutation = useMutation({
        mutationFn: (projectId: string) => api.delete(`/projects/${projectId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });

    // Map backend data to display format
    const displayProjects = projects?.map((p: any) => ({
        id: p.id,
        title: p.title,
        subject: p.subject || 'General',
        deadline: p.end_date ? new Date(p.end_date).toLocaleDateString() : 'No Deadline',
        teams: 0, // Backend doesn't return team count yet, defaulting to 0
        status: p.is_active ? 'Active' : 'Completed' // Derive status
    })) || [];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">PBL Projects</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Cross-disciplinary projects focused on real-world impact</p>
                </div>
                {user?.role !== 'student' && (
                    <Link to="/dashboard/projects/create">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            New Project
                        </Button>
                    </Link>
                )}
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search projects by title or subject..."
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-sm dark:shadow-inner"
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="glass h-[200px] animate-pulse"></div>)
                ) : displayProjects.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No projects found. Create one to get started!
                    </div>
                ) : (
                    displayProjects.map((project: any) => (
                        <Card key={project.id} className="group relative">
                            {user?.role !== 'student' && (
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (window.confirm('Are you sure you want to delete this project?')) {
                                                deleteMutation.mutate(project.id);
                                            }
                                        }}
                                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider h-fit self-center ${project.status === 'Active' ? 'text-emerald-400 bg-emerald-400/10' :
                                        project.status === 'Completed' ? 'text-slate-400 bg-slate-400/10' :
                                            'text-amber-400 bg-amber-400/10'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            ) || (
                                    <div className="absolute top-4 right-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${project.status === 'Active' ? 'text-emerald-400 bg-emerald-400/10' :
                                            project.status === 'Completed' ? 'text-slate-400 bg-slate-400/10' :
                                                'text-amber-400 bg-amber-400/10'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                )}

                            <div className="mb-6 pt-6">
                                <div className="p-3 w-fit rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 mb-4 group-hover:bg-primary-500/20 transition-all transform group-hover:-translate-y-1">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors uppercase tracking-tight">{project.title}</h3>
                                <p className="text-xs text-slate-500 mt-1 uppercase font-semibold text-[10px] tracking-widest">{project.subject}</p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Deadline: {project.deadline}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{project.teams || 0} Teams</span>
                                    </div>
                                </div>

                                <Link to={`/dashboard/projects/${project.id}`} className="block">
                                    <Button variant="ghost" className="w-full border-slate-100 dark:border-white/5 hover:border-primary-500/30 group">
                                        Open Dashboard
                                        <ChevronRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectList;
