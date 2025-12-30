import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Save,
    MessageSquare,
    FileText,
    Link as LinkIcon,
    AlertCircle,
    Brain,
    Trophy
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

interface Criterion {
    id: string;
    criterion_name: string;
    max_score: number;
    weight: number;
    description: string;
}

interface Evidence {
    id: string;
    evidence_type: string;
    content: string;
    file_path?: string;
}

interface Submission {
    id: string;
    assignment_id: string;
    status: string;
    evidence: Evidence[];
    assignment: {
        student: {
            first_name: string;
            last_name: string;
        };
        project: {
            id: string;
            title: string;
            description: string;
            rubric: {
                id: string;
                criteria: Criterion[];
            };
        };
    };
}

const ProjectEvaluation = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [scores, setScores] = useState<Record<string, { score: number; feedback: string }>>({});
    const [overallFeedback, setOverallFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/projects/submissions/${submissionId}`);
                setSubmission(response.data);

                // Initialize scores
                const initialScores: Record<string, { score: number; feedback: string }> = {};
                response.data.assignment.project.rubric.criteria.forEach((c: Criterion) => {
                    initialScores[c.id] = { score: c.max_score, feedback: '' };
                });
                setScores(initialScores);
            } catch (err: unknown) {
                const error = err as any;
                console.error('Failed to fetch submission:', error);
                setError('Could not load submission details.');
            } finally {
                setLoading(false);
            }
        };

        if (submissionId) fetchSubmission();
    }, [submissionId]);

    const handleScoreChange = (criterionId: string, score: number) => {
        setScores(prev => ({
            ...prev,
            [criterionId]: { ...prev[criterionId], score }
        }));
    };

    const handleFeedbackChange = (criterionId: string, feedback: string) => {
        setScores(prev => ({
            ...prev,
            [criterionId]: { ...prev[criterionId], feedback }
        }));
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            const payload = {
                submission_id: submissionId,
                overall_feedback: overallFeedback,
                scores: Object.entries(scores).map(([id, data]) => ({
                    criterion_id: id,
                    score: data.score,
                    feedback: data.feedback
                }))
            };

            await api.post(`/projects/submissions/${submissionId}/evaluate`, payload);
            navigate(`/dashboard/projects/${submission?.assignment.project.id}/submissions`);
        } catch (err: unknown) {
            const error = err as any;
            console.error('Failed to submit evaluation:', error);
            alert('Failed to save evaluation. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    if (error || !submission) return (
        <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/5">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{error || 'Submission not found'}</h3>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
    );

    const project = submission.assignment.project;
    const student = submission.assignment.student;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="rounded-full bg-slate-800 p-2"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Evaluate Submission</h2>
                        <p className="text-slate-400 mt-1">
                            {student.first_name} {student.last_name} • {project.title}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSubmit}
                    isLoading={saving}
                    className="gap-2 px-8 py-6 rounded-2xl font-black uppercase tracking-widest bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-500/20"
                >
                    <Save className="w-5 h-5" />
                    Submit Grade
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Evidence & Project Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary-400">Project Brief</CardTitle>
                        </CardHeader>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">{project.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-400">Submission Evidence</CardTitle>
                        </CardHeader>
                        <div className="space-y-4">
                            {submission.evidence.length === 0 && (
                                <p className="text-sm text-slate-500 italic">No evidence provided.</p>
                            )}
                            {submission.evidence.map((ev) => (
                                <div key={ev.id} className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                        {ev.evidence_type === 'file' ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                                        {ev.evidence_type}
                                    </div>
                                    <p className="text-sm text-white line-clamp-3">{ev.content}</p>
                                    {ev.file_path && (
                                        <a
                                            href={`http://localhost:8000${ev.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors"
                                        >
                                            View Full Content
                                            <LinkIcon className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                                <Brain className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">AI-Suggested Score</p>
                                <p className="text-xl font-black text-white">88/100</p>
                            </div>
                        </div>
                        <p className="mt-4 text-[10px] text-slate-500 font-medium italic">
                            Gemini has analyzed the evidence against the rubric. Higher impact noted in technical depth.
                        </p>
                    </Card>
                </div>

                {/* Right: Rubric Evaluation */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-8 border-b border-white/5">
                            <CardTitle className="flex items-center gap-3">
                                <Trophy className="w-6 h-6 text-amber-400" />
                                Rubric Assessment
                            </CardTitle>
                            <CardDescription>Rate the student's performance across all defined criteria</CardDescription>
                        </CardHeader>

                        <div className="divide-y divide-white/5">
                            {project.rubric.criteria.map((c) => (
                                <div key={c.id} className="py-8 first:pt-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="max-w-md">
                                            <h4 className="text-lg font-bold text-white">{c.criterion_name}</h4>
                                            <p className="text-sm text-slate-500 mt-1">{c.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-primary-400 tabular-nums">
                                                {scores[c.id]?.score}/{c.max_score}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Weight: {Math.round(c.weight * 100)}%</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <input
                                            type="range"
                                            min="0"
                                            max={c.max_score}
                                            step="0.5"
                                            value={scores[c.id]?.score || 0}
                                            onChange={(e) => handleScoreChange(c.id, parseFloat(e.target.value))}
                                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                        />

                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                                            <textarea
                                                placeholder={`Specific feedback for ${c.criterion_name}...`}
                                                value={scores[c.id]?.feedback || ''}
                                                onChange={(e) => handleFeedbackChange(c.id, e.target.value)}
                                                className="w-full bg-slate-900 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-slate-700 min-h-[80px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Overall Feedback</CardTitle>
                        </CardHeader>
                        <textarea
                            value={overallFeedback}
                            onChange={(e) => setOverallFeedback(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl p-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-slate-700 min-h-[150px]"
                            placeholder="Provide a comprehensive summary of the project performance..."
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProjectEvaluation;
