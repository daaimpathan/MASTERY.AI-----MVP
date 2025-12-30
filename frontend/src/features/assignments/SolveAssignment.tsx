import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, HelpCircle, Save } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

interface Question {
    id: string;
    question_text: string;
    question_type: string;
    options?: Record<string, string>;
    points: number;
}

interface Assignment {
    id: string;
    title: string;
    questions: Question[];
}

const SolveAssignment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        // Mock fetch for specific assignment details as we need the questions
        // In a real app, this would be a dedicated endpoint GET /assignments/:id/solve
        const fetchAssignment = async () => {
            try {
                const token = localStorage.getItem('access_token');
                // GET /api/v1/mastery/assignments/{id}/solve
                const response = await fetch(`http://localhost:8000/api/v1/mastery/assignments/${id}/solve`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAssignment(data);
                }
            } catch (error) {
                console.error("Failed to load assignment", error);
            }
        };

        if (id && user) fetchAssignment();
    }, [id, user]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/v1/mastery/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    assignment_id: id,
                    answers: answers
                })
            });

            if (response.ok) {
                const data = await response.json();
                setSubmitted(true);
                // Calculate simple percentage for display
                const correctCount = data.responses.filter((r: any) => r.is_correct).length;
                const total = data.responses.length;
                setScore(Math.round((correctCount / total) * 100));
            }
        } catch (error) {
            console.error("Failed to submit assignment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) return (
        <div className="p-8 max-w-2xl mx-auto text-center animate-fade-in">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Assignment Submitted!</h1>
            <p className="text-slate-500 mb-8">Your answers have been recorded.</p>

            <Card className="p-8 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 mb-8">
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-2">Mastery Score</p>
                <p className="text-5xl font-black text-slate-900 dark:text-white">{score}%</p>
                <p className="text-sm text-slate-500 mt-2">Points added to your mastery profile</p>
            </Card>

            <Button onClick={() => navigate('/dashboard/student/assignments')}>
                Back to Assignments
            </Button>
        </div>
    );

    if (!assignment) return (
        <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <Button variant="ghost" onClick={() => navigate('/dashboard/student/assignments')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{assignment.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-slate-500 text-sm">
                    <span className="flex items-center gap-1">
                        <HelpCircle className="w-4 h-4" /> {assignment.questions.length} Questions
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Estimated: 15 mins
                    </span>
                </div>
            </div>

            <div className="space-y-8">
                {assignment.questions.map((q, index) => (
                    <Card key={q.id} className="p-6">
                        <div className="flex items-start gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-500">
                                {index + 1}
                            </span>
                            <div className="flex-1 space-y-4">
                                <p className="font-medium text-lg text-slate-900 dark:text-white">{q.question_text}</p>

                                {q.question_type === 'mcq' && q.options && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(q.options).map(([key, value]) => (
                                            <button
                                                key={key}
                                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: key }))}
                                                className={`p-4 rounded-xl text-left border-2 transition-all ${answers[q.id] === key
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                                                    }`}
                                            >
                                                <span className="font-bold mr-2">{key}.</span> {value}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.question_type !== 'mcq' && (
                                    <textarea
                                        value={answers[q.id] || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none h-32 resize-none"
                                        placeholder="Type your answer here..."
                                    />
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end pt-8">
                <Button size="lg" onClick={handleSubmit} isLoading={isSubmitting} disabled={Object.keys(answers).length < assignment.questions.length}>
                    <Save className="w-4 h-4 mr-2" /> Submit Assignment
                </Button>
            </div>
        </div>
    );
};

export default SolveAssignment;
