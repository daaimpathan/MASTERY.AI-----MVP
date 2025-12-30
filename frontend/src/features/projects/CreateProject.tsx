import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Save,
    Plus,
    Trash2,
    Settings,
    ChevronLeft,
    Layers,
    Type,
    School,
    ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface ProjectCriterion {
    criterion: string;
    weight: number;
    description: string;
}

interface ProjectPayload {
    title: string;
    description: string;
    subject: string;
    deadline: string;
    minGroupSize: number;
    maxGroupSize: number;
    rubric: {
        name: string;
        criteria: ProjectCriterion[];
    };
}

const CreateProject = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [deadline, setDeadline] = useState('');
    const [minGroupSize, setMinGroupSize] = useState(1);
    const [maxGroupSize, setMaxGroupSize] = useState(4);
    const [classId, setClassId] = useState('');

    // Fetch classes
    // Fetch classes
    const { data: apiClasses } = useQuery({
        queryKey: ['classes'],
        queryFn: () => api.getClasses()
    });

    // Fallback mock classes if API fails or returns empty
    // Fallback mock classes if API fails or returns empty
    const classes = (apiClasses && apiClasses.length > 0) ? apiClasses : [];

    // Rubric builder state
    const [rubricCriteria, setRubricCriteria] = useState<ProjectCriterion[]>([
        { criterion: 'Technical Depth', weight: 40, description: 'Scientific accuracy and implementation' },
        { criterion: 'Creative Innovation', weight: 30, description: 'Originality of solutions' }
    ]);

    const [showSuccess, setShowSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: (newProject: ProjectPayload) => api.post('/projects/', newProject),
        onSuccess: () => {
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/projects');
            }, 2000);
        },
        onError: (error: any) => {
            console.error('Project creation failed:', error);
            const message = error.response?.data?.detail || error.message || 'Unknown error occurred';
            alert(`Failed to deploy project: ${message}`);
        }
    });

    const addCriterion = () => {
        setRubricCriteria([...rubricCriteria, { criterion: '', weight: 0, description: '' }]);
    };

    const removeCriterion = (index: number) => {
        setRubricCriteria(rubricCriteria.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !subject.trim() || !deadline || !classId) {
            alert("Please fill in all required fields:\n- Title\n- Subject\n- Class\n- Deadline");
            return;
        }

        mutation.mutate({
            title,
            description,
            subject,
            start_date: new Date().toISOString(),
            end_date: new Date(deadline).toISOString(),
            is_group_project: maxGroupSize > 1,
            max_group_size: maxGroupSize,
            class_id: classId,
            rubric: {
                name: `${title} Rubric`,
                description: "Project Rubric",
                criteria: rubricCriteria.map(c => ({
                    criterion_name: c.criterion,
                    criterion_type: "technical",
                    description: c.description,
                    max_score: 100,
                    weight: c.weight / 100 // Convert percentage to decimal (0.4 instead of 40)
                }))
            }
        } as any); // Cast to any because frontend ProjectPayload interface is outdated but we are fixing the backend call first
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex items-center gap-4">
                <Link to="/dashboard/projects">
                    <Button variant="ghost" size="sm" className="rounded-full bg-slate-800 p-2">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Project Architect</h2>
                    <p className="text-slate-400 mt-1">Design a multidisciplinary learning experience</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary-400" />
                                Core Configuration
                            </CardTitle>
                        </CardHeader>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <School className="w-3 h-3" />
                                    Assign to Class
                                </label>
                                <select
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                >
                                    <option value="">Select a class...</option>
                                    {classes?.map((cls: any) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Type className="w-3 h-3" />
                                    Project Title
                                </label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    type="text"
                                    placeholder="e.g. Sustainable City 2050"
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Layers className="w-3 h-3" />
                                        Primary Subject
                                    </label>
                                    <input
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        type="text"
                                        placeholder="e.g. STEM"
                                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Layers className="w-3 h-3" />
                                        Due Date
                                    </label>
                                    <input
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        type="date"
                                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Mission Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    placeholder="Outline the project goals, interdisciplinarity, and required outputs..."
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Min Team Size</label>
                                    <input
                                        type="number"
                                        value={minGroupSize}
                                        onChange={(e) => setMinGroupSize(parseInt(e.target.value))}
                                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Max Team Size</label>
                                    <input
                                        type="number"
                                        value={maxGroupSize}
                                        onChange={(e) => setMaxGroupSize(parseInt(e.target.value))}
                                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Rubric Builder */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-accent-400" />
                                    Rubric Architect
                                </CardTitle>
                                <CardDescription>Balance total weight to 100%</CardDescription>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={addCriterion} className="rounded-full bg-slate-800 p-2">
                                <Plus className="w-4 h-4 text-primary-400" />
                            </Button>
                        </CardHeader>

                        <div className="space-y-6">
                            {rubricCriteria.map((rc, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4 group">
                                    <div className="flex justify-between items-center">
                                        <input
                                            value={rc.criterion}
                                            onChange={(e) => {
                                                const newR = [...rubricCriteria];
                                                newR[i].criterion = e.target.value;
                                                setRubricCriteria(newR);
                                            }}
                                            placeholder="Criterion Name"
                                            className="bg-transparent text-sm font-bold text-white outline-none border-b border-white/10 focus:border-primary-500 transition-all w-1/2"
                                        />
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                value={rc.weight}
                                                onChange={(e) => {
                                                    const newR = [...rubricCriteria];
                                                    newR[i].weight = parseInt(e.target.value);
                                                    setRubricCriteria(newR);
                                                }}
                                                className="w-16 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none"
                                            />
                                            <span className="text-xs text-slate-500 font-bold">%</span>
                                            <button type="button" onClick={() => removeCriterion(i)} className="p-1 hover:text-rose-500 text-slate-700 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        value={rc.description}
                                        onChange={(e) => {
                                            const newR = [...rubricCriteria];
                                            newR[i].description = e.target.value;
                                            setRubricCriteria(newR);
                                        }}
                                        placeholder="Assessment guideline for this criterion..."
                                        className="w-full bg-transparent text-xs text-slate-400 outline-none"
                                    />
                                </div>
                            ))}

                            <div className="flex justify-between items-center pt-6 border-t border-white/5 px-2">
                                <span className="text-xs font-bold text-slate-500 uppercase italic">Total Weight</span>
                                <span className={`text-lg font-black ${rubricCriteria.reduce((a, b) => a + b.weight, 0) === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {rubricCriteria.reduce((a, b) => a + b.weight, 0)}%
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Button
                        type="submit"
                        isLoading={mutation.isPending}
                        className="w-full h-16 rounded-2xl gap-2 font-black uppercase tracking-[0.2em] shadow-2xl"
                    >
                        <Save className="w-5 h-5" />
                        Deploy Project
                    </Button>
                </div>
            </form>

            {/* Success Popup */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-emerald-500/20 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center transform scale-100 animate-scale-in">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Layers className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Project Deployed!</h3>
                        <p className="text-slate-500 dark:text-slate-400">Your project is now live and visible to all students and teachers.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateProject;
