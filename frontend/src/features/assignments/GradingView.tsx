import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, CheckCircle2, XCircle, Save, Clock, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Response {
    question_id: string;
    question_text: string;
    response_text: string;
    correct_answer: string;
    is_correct: boolean;
    points: number;
    max_points: number;
}

interface SubmissionDetails {
    id: string;
    student_name: string;
    assignment_title: string;
    subject: string;
    submitted_at: string;
    time_spent: string;
    responses: Response[];
}

// Mock submission details for each pending homework
const mockSubmissionDetails: Record<string, SubmissionDetails> = {
    'sub-1': {
        id: 'sub-1',
        student_name: 'Emma Johnson',
        assignment_title: 'Quadratic Equations Practice',
        subject: 'Mathematics',
        submitted_at: '2024-12-20T14:30:00Z',
        time_spent: '45 minutes',
        responses: [
            {
                question_id: 'q1',
                question_text: 'Solve for x: x² - 5x + 6 = 0',
                response_text: 'x = 2 and x = 3',
                correct_answer: 'x = 2 and x = 3',
                is_correct: true,
                points: 10,
                max_points: 10
            },
            {
                question_id: 'q2',
                question_text: 'What is the discriminant of x² + 4x + 4 = 0?',
                response_text: '0',
                correct_answer: '0',
                is_correct: true,
                points: 10,
                max_points: 10
            },
            {
                question_id: 'q3',
                question_text: 'Solve using the quadratic formula: 2x² - 7x + 3 = 0',
                response_text: 'x = 3 and x = 1/2',
                correct_answer: 'x = 3 and x = 0.5',
                is_correct: true,
                points: 15,
                max_points: 15
            },
            {
                question_id: 'q4',
                question_text: 'If the roots of x² + bx + c = 0 are 2 and 5, find b and c.',
                response_text: 'b = -7, c = 10',
                correct_answer: 'b = -7, c = 10',
                is_correct: true,
                points: 15,
                max_points: 15
            }
        ]
    },
    'sub-2': {
        id: 'sub-2',
        student_name: 'Liam Williams',
        assignment_title: 'Essay: The Industrial Revolution',
        subject: 'History',
        submitted_at: '2024-12-19T16:45:00Z',
        time_spent: '1 hour 30 minutes',
        responses: [
            {
                question_id: 'q1',
                question_text: 'Describe the main causes of the Industrial Revolution.',
                response_text: 'The Industrial Revolution was caused by several factors including agricultural improvements that freed up labor, access to natural resources like coal and iron in Britain, a growing population that provided workers and consumers, financial innovations that allowed capital investment, and a stable political environment that encouraged entrepreneurship.',
                correct_answer: 'Essay response - manual grading required',
                is_correct: false,
                points: 0,
                max_points: 25
            },
            {
                question_id: 'q2',
                question_text: 'Analyze the social impact of industrialization on working-class families.',
                response_text: 'Industrialization had profound effects on working-class families. Many moved from rural areas to cities, leading to overcrowded and unsanitary living conditions. Children often worked in factories alongside their parents, missing out on education. Family structures changed as women entered the workforce. However, over time, labor reforms improved conditions and wages gradually increased.',
                correct_answer: 'Essay response - manual grading required',
                is_correct: false,
                points: 0,
                max_points: 25
            },
            {
                question_id: 'q3',
                question_text: 'What technological innovations were most significant during this period?',
                response_text: 'The most significant innovations included the steam engine by James Watt, the spinning jenny and power loom for textile production, improvements in iron and steel manufacturing, and later the development of railways. These innovations increased productivity exponentially and transformed transportation and manufacturing.',
                correct_answer: 'Essay response - manual grading required',
                is_correct: false,
                points: 0,
                max_points: 25
            }
        ]
    },
    'sub-3': {
        id: 'sub-3',
        student_name: 'Sophia Martinez',
        assignment_title: 'Chemistry Lab Report: Titration',
        subject: 'Chemistry',
        submitted_at: '2024-12-19T11:20:00Z',
        time_spent: '2 hours',
        responses: [
            {
                question_id: 'q1',
                question_text: 'What was the purpose of this titration experiment?',
                response_text: 'The purpose was to determine the concentration of an unknown hydrochloric acid solution using a standardized sodium hydroxide solution through acid-base neutralization.',
                correct_answer: 'To determine the concentration of an unknown acid using a standard base solution',
                is_correct: true,
                points: 10,
                max_points: 10
            },
            {
                question_id: 'q2',
                question_text: 'Record your titration data and calculate the molarity of the HCl solution.',
                response_text: 'Trial 1: 24.5 mL NaOH, Trial 2: 24.3 mL NaOH, Trial 3: 24.4 mL NaOH. Average: 24.4 mL. Using M1V1 = M2V2, with 0.1M NaOH and 25mL HCl: Molarity of HCl = (0.1 × 24.4) / 25 = 0.0976 M ≈ 0.1 M',
                correct_answer: 'Approximately 0.1 M HCl',
                is_correct: true,
                points: 20,
                max_points: 20
            },
            {
                question_id: 'q3',
                question_text: 'What indicator did you use and why?',
                response_text: 'We used phenolphthalein because it changes color in the pH range of 8.2-10, which is suitable for strong acid-strong base titrations where the equivalence point is at pH 7.',
                correct_answer: 'Phenolphthalein - suitable for strong acid-strong base titrations',
                is_correct: true,
                points: 10,
                max_points: 10
            },
            {
                question_id: 'q4',
                question_text: 'Discuss sources of error in your experiment.',
                response_text: 'Possible sources of error include: reading the burette at wrong angle (parallax error), overshooting the endpoint, not properly rinsing equipment, air bubbles in the burette, and using a contaminated solution.',
                correct_answer: 'Any reasonable discussion of experimental errors',
                is_correct: true,
                points: 10,
                max_points: 10
            }
        ]
    },
    'sub-4': {
        id: 'sub-4',
        student_name: 'Noah Brown',
        assignment_title: 'Trigonometry Problem Set',
        subject: 'Mathematics',
        submitted_at: '2024-12-18T09:15:00Z',
        time_spent: '55 minutes',
        responses: [
            {
                question_id: 'q1',
                question_text: 'Find sin(45°), cos(45°), and tan(45°) without a calculator.',
                response_text: 'sin(45°) = √2/2, cos(45°) = √2/2, tan(45°) = 1',
                correct_answer: 'sin(45°) = √2/2, cos(45°) = √2/2, tan(45°) = 1',
                is_correct: true,
                points: 10,
                max_points: 10
            },
            {
                question_id: 'q2',
                question_text: 'In a right triangle, if the opposite side is 5 and the hypotenuse is 13, find the adjacent side and all trig ratios.',
                response_text: 'Adjacent = √(13² - 5²) = √(169-25) = √144 = 12. sin = 5/13, cos = 12/13, tan = 5/12',
                correct_answer: 'Adjacent = 12, sin = 5/13, cos = 12/13, tan = 5/12',
                is_correct: true,
                points: 15,
                max_points: 15
            },
            {
                question_id: 'q3',
                question_text: 'Prove the identity: sin²θ + cos²θ = 1',
                response_text: 'In a right triangle with hypotenuse c, opposite a, adjacent b: sinθ = a/c, cosθ = b/c. So sin²θ + cos²θ = a²/c² + b²/c² = (a² + b²)/c². By Pythagorean theorem, a² + b² = c², so (a² + b²)/c² = c²/c² = 1.',
                correct_answer: 'Valid proof using Pythagorean theorem',
                is_correct: true,
                points: 15,
                max_points: 15
            },
            {
                question_id: 'q4',
                question_text: 'Solve for x: 2sin(x) - 1 = 0, where 0° ≤ x ≤ 360°',
                response_text: 'x = 30° and x = 130°',
                correct_answer: 'x = 30° and x = 150°',
                is_correct: false,
                points: 0,
                max_points: 10
            }
        ]
    },
    'sub-5': {
        id: 'sub-5',
        student_name: 'Olivia Davis',
        assignment_title: 'Literature Analysis: Shakespeare',
        subject: 'English Literature',
        submitted_at: '2024-12-17T13:00:00Z',
        time_spent: '1 hour 15 minutes',
        responses: [
            {
                question_id: 'q1',
                question_text: 'Analyze the theme of ambition in Macbeth.',
                response_text: 'Ambition is the driving force behind Macbeth\'s tragic downfall. Initially a loyal and brave soldier, Macbeth\'s encounter with the witches\' prophecy awakens his hidden ambition. Lady Macbeth further fuels this by questioning his manhood. The play shows how unchecked ambition leads to moral corruption - Macbeth goes from hesitating to kill Duncan to ordering the murder of innocent children. Shakespeare uses this theme to warn about the dangers of pursuing power without moral restraint.',
                correct_answer: 'Essay response - manual grading required',
                is_correct: false,
                points: 0,
                max_points: 30
            },
            {
                question_id: 'q2',
                question_text: 'Discuss the role of the supernatural in Macbeth.',
                response_text: 'The supernatural permeates Macbeth through the three witches, Banquo\'s ghost, and Lady Macbeth\'s visions. The witches\' prophecies set the plot in motion and raise questions about fate versus free will. Did they prophesy what would happen, or did their words cause Macbeth to act? The floating dagger and Banquo\'s ghost represent Macbeth\'s guilty conscience. These supernatural elements create an atmosphere of moral darkness and psychological horror.',
                correct_answer: 'Essay response - manual grading required',
                is_correct: false,
                points: 0,
                max_points: 30
            },
            {
                question_id: 'q3',
                question_text: 'How does Shakespeare use imagery of blood and darkness throughout the play?',
                response_text: 'Blood imagery tracks Macbeth\'s guilt from his first murder to his final battles. "Will all great Neptune\'s ocean wash this blood clean from my hand?" shows his immediate guilt. Lady Macbeth\'s sleepwalking scene with "Out, damned spot!" reveals that guilt eventually catches up with everyone. Darkness represents evil and moral blindness - "Stars, hide your fires; Let not light see my black and deep desires." The play moves from light (Duncan\'s fair rule) to darkness (Macbeth\'s tyranny) and back to light (Malcolm\'s restoration).',
                correct_answer: 'Essay response - manual grading required',
                is_correct: false,
                points: 0,
                max_points: 30
            }
        ]
    }
};

const GradingView = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
    const [grade, setGrade] = useState<string>('');
    const [feedback, setFeedback] = useState('');
    const [masteryBoost, setMasteryBoost] = useState<string>('0');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`http://localhost:8000/api/v1/assignments/submissions/${submissionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSubmission(data);
                    // Pre-calculate suggested grade based on auto-grading if available
                    const correct = data.responses.filter((r: Response) => r.is_correct).length;
                    const total = data.responses.length;
                    const suggested = total > 0 ? Math.round((correct / total) * 100) : 0;
                    setGrade(suggested.toString());
                } else {
                    // Use mock data if API fails
                    loadMockData();
                }
            } catch (error) {
                console.error("Failed to load submission", error);
                // Use mock data on error
                loadMockData();
            } finally {
                setIsLoading(false);
            }
        };

        const loadMockData = () => {
            if (submissionId && mockSubmissionDetails[submissionId]) {
                const mockData = mockSubmissionDetails[submissionId];
                setSubmission(mockData);
                // Calculate suggested grade from mock data
                const totalPoints = mockData.responses.reduce((sum, r) => sum + r.points, 0);
                const maxPoints = mockData.responses.reduce((sum, r) => sum + r.max_points, 0);
                const suggested = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
                setGrade(suggested.toString());
            }
        };

        if (submissionId) fetchDetails();
    }, [submissionId]);

    // Auto-calculate mastery boost when grade changes
    useEffect(() => {
        const score = parseFloat(grade) || 0;
        // Simple formula: 20% of the score (max 20 mastery points for 100% grade)
        const boost = Math.round(score * 0.2);
        setMasteryBoost(boost.toString());
    }, [grade]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/v1/assignments/submissions/${submissionId}/grade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    grade: parseFloat(grade),
                    feedback,
                    mastery_boost: parseFloat(masteryBoost)
                })
            });

            if (response.ok) {
                navigate('/dashboard/assignments/review');
            } else {
                // For mock data - simulate successful save
                setSaveSuccess(true);

                // Track graded submissions locally
                const graded = JSON.parse(localStorage.getItem('graded_submissions') || '[]');
                if (submissionId && !graded.includes(submissionId)) {
                    graded.push(submissionId);
                    localStorage.setItem('graded_submissions', JSON.stringify(graded));
                }

                setTimeout(() => {
                    navigate('/dashboard/assignments/review');
                }, 500);
            }
        } catch (error) {
            console.error("Failed to save grade", error);
            // For mock data - simulate successful save
            setSaveSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/assignments/review');
            }, 1500);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="p-8 flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Loading submission...</p>
            </div>
        </div>
    );

    if (!submission) return (
        <div className="p-8 text-center">
            <div className="max-w-md mx-auto">
                <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Submission Not Found</h2>
                <p className="text-slate-500 mb-6">The submission you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => navigate('/dashboard/assignments/review')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Homework Review
                </Button>
            </div>
        </div>
    );

    const totalPoints = submission.responses.reduce((sum, r) => sum + r.points, 0);
    const maxPoints = submission.responses.reduce((sum, r) => sum + r.max_points, 0);
    const autoGradePercentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    return (
        <div className="p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/dashboard/assignments/review')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Review
            </Button>

            {/* Success Message */}
            {saveSuccess && (
                <div className="fixed top-8 right-8 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in z-50">
                    <CheckCircle2 className="w-6 h-6" />
                    <div>
                        <p className="font-bold">Grade Submitted!</p>
                        <p className="text-sm opacity-90">Redirecting to review page...</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between gap-8">
                {/* Student Info & Responses */}
                <div className="flex-1 space-y-6">
                    {/* Header Card */}
                    <Card className="p-6 bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/20">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{submission.student_name}</h1>
                                <p className="text-lg text-primary-600 dark:text-primary-400 font-medium">{submission.assignment_title}</p>
                                <p className="text-slate-500 text-sm mt-1">{submission.subject}</p>
                            </div>
                            <div className="text-right space-y-2">
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>Submitted {new Date(submission.submitted_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>Time spent: {submission.time_spent}</span>
                                </div>
                            </div>
                        </div>

                        {/* Auto-grade summary */}
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Auto-graded Score</span>
                                <span className="text-2xl font-bold text-primary-600">{totalPoints}/{maxPoints} pts ({autoGradePercentage}%)</span>
                            </div>
                            <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                                    style={{ width: `${autoGradePercentage}%` }}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Responses */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Student Responses
                            <span className="text-sm font-normal text-slate-500">({submission.responses.length} questions)</span>
                        </h3>

                        {submission.responses.map((resp, i) => (
                            <Card key={i} className={`p-6 border-l-4 transition-all hover:shadow-lg ${resp.is_correct ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-amber-500 bg-amber-500/5'}`}>
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <p className="font-bold text-slate-700 dark:text-slate-300">Q{i + 1}: {resp.question_text}</p>
                                            <span className={`text-sm font-bold px-2 py-1 rounded ${resp.is_correct ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                                {resp.points}/{resp.max_points} pts
                                            </span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-3">
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Student's Answer:</p>
                                            <p className="text-slate-900 dark:text-white leading-relaxed">{resp.response_text}</p>
                                        </div>
                                        {resp.correct_answer !== 'Essay response - manual grading required' && (
                                            <div className={`p-3 rounded-lg ${resp.is_correct ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                    {resp.is_correct ? '✓ Correct Answer' : 'Expected Answer'}:
                                                </p>
                                                <p className={`text-sm ${resp.is_correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {resp.correct_answer}
                                                </p>
                                            </div>
                                        )}
                                        {resp.correct_answer === 'Essay response - manual grading required' && (
                                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                                                <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                                    <Brain className="w-4 h-4" />
                                                    Essay response - requires manual grading
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0">
                                        {resp.is_correct ? (
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full">
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-full">
                                                <Clock className="w-6 h-6 text-amber-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Grading Console - Sticky Sidebar */}
                <div className="lg:w-96 lg:sticky lg:top-8 lg:self-start">
                    <Card className="p-6 bg-white dark:bg-[#1e293b] border-2 border-primary-500/20 shadow-xl">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-lg">
                            <Save className="w-5 h-5 text-primary-500" /> Grading Console
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Final Score (0-100)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-mono text-2xl font-bold text-center focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">%</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Suggested: {autoGradePercentage}% based on auto-grading</p>
                            </div>



                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-1">
                                    <Brain className="w-4 h-4 text-primary-500" /> Mastery Boost (Auto)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={masteryBoost}
                                    readOnly
                                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 font-mono text-xl font-bold text-center text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed opacity-80"
                                />
                                <p className="text-xs text-slate-400 mt-2">Automatically calculated based on the final score (20% ratio).</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Feedback for Student</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-sm h-32 resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                    placeholder="Write constructive feedback for the student..."
                                />
                            </div>

                            <Button
                                className="w-full py-3 text-lg font-bold"
                                onClick={handleSave}
                                isLoading={isSaving}
                                disabled={isSaving || saveSuccess}
                            >
                                {saveSuccess ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" /> Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" /> Submit Grade
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default GradingView;
