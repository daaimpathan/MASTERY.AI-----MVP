import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Crown, Activity, CheckCircle2, ArrowRight, Play } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Keys for localStorage synchronization
const ACTIVE_QUIZ_KEY = 'mastery_active_quiz';
const QUIZ_STUDENTS_KEY = 'mastery_quiz_students';
const QUIZ_RESPONSES_KEY = 'mastery_quiz_responses';

interface Player {
    id: string;
    name: string;
    score: number;
}

interface Question {
    question_text: string;
    options: Record<string, string>;
    correct_answer: string;
}

interface QuizState {
    quiz_id: string;
    title: string;
    questions: Question[];
    status: 'LOBBY' | 'QUESTION' | 'LEADERBOARD';
    current_index: number;
}

const ActiveQuizSession = () => {
    const { id: quizId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Role determination
    const role = location.state?.role || 'student';
    // For students, use the passed name or fallback to a stored user name/email if available
    // In a real app, this would come from auth context
    const studentName = location.state?.studentName || "Guest Student";

    // State - Initialize optimistically if passed from Lobby
    const [quizState, setQuizState] = useState<QuizState | null>(() => {
        if (location.state?.quiz) return location.state.quiz;
        const stored = localStorage.getItem(ACTIVE_QUIZ_KEY);
        return stored ? JSON.parse(stored) : null;
    });
    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    // Initial Join Logic (Student)
    useEffect(() => {
        if (role === 'student' && quizId && !isJoined) {
            const joinSession = () => {
                const storedStudents = localStorage.getItem(QUIZ_STUDENTS_KEY);
                const currentStudents: string[] = storedStudents ? JSON.parse(storedStudents) : [];

                if (!currentStudents.includes(studentName)) {
                    const updatedStudents = [...currentStudents, studentName];
                    localStorage.setItem(QUIZ_STUDENTS_KEY, JSON.stringify(updatedStudents));
                }
                setIsJoined(true);
            };
            joinSession();
        }
    }, [role, quizId, studentName, isJoined]);

    // Polling Logic (Sync State)
    useEffect(() => {
        const syncState = () => {
            try {
                // 1. Sync Quiz State
                const storedQuiz = localStorage.getItem(ACTIVE_QUIZ_KEY);
                let currentQuizData = quizState;

                if (storedQuiz) {
                    const parsedQuiz = JSON.parse(storedQuiz) as QuizState;
                    currentQuizData = parsedQuiz;
                    // Only update if something changed to avoid re-renders (simple check)
                    setQuizState(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(parsedQuiz)) return parsedQuiz;
                        return prev;
                    });
                } else {
                    // If quiz is gone and we are student, redirect
                    if (role === 'student') {
                        navigate('/dashboard');
                        return;
                    }
                }

                // 2. Sync Players & Calculate Scores
                const storedStudents = localStorage.getItem(QUIZ_STUDENTS_KEY);
                if (storedStudents) {
                    const studentNames: string[] = JSON.parse(storedStudents);

                    // Get data for score calc
                    const storedResponses = localStorage.getItem(QUIZ_RESPONSES_KEY);
                    const allResponses: { studentName: string, questionIndex: number, answer: string }[] = storedResponses ? JSON.parse(storedResponses) : [];

                    const mappedPlayers: Player[] = studentNames.map(name => {
                        let score = 0;
                        if (currentQuizData) {
                            allResponses.forEach(r => {
                                if (r.studentName === name) {
                                    const question = currentQuizData?.questions[r.questionIndex];
                                    if (question && r.answer === question.correct_answer) {
                                        score += 100;
                                    }
                                }
                            });
                        }

                        return {
                            id: name,
                            name: name,
                            score: score
                        };
                    });

                    // Only update if changed (deep compare simplified)
                    setPlayers(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(mappedPlayers)) return mappedPlayers;
                        return prev;
                    });
                }
            } catch (e) {
                console.error("Error syncing quiz state:", e);
            }
        };

        syncState();
        const interval = setInterval(syncState, 1000); // Poll every 1s
        return () => clearInterval(interval);
    }, [role, navigate]); // removed quizState dependency properly


    // Helper: Update Quiz State in LocalStorage
    const updateQuizState = (updates: Partial<QuizState>) => {
        if (!quizState) return;
        const newState = { ...quizState, ...updates };
        localStorage.setItem(ACTIVE_QUIZ_KEY, JSON.stringify(newState));
        setQuizState(newState); // Optimistic update
    };

    // Host Actions
    const startQuiz = () => {
        updateQuizState({ status: 'QUESTION', current_index: 0 });
    };

    const nextQuestion = () => {
        if (!quizState) return;
        const nextIndex = quizState.current_index + 1;
        if (nextIndex < quizState.questions.length) {
            updateQuizState({ current_index: nextIndex });
            // Reset local host view state if needed
        } else {
            updateQuizState({ status: 'LEADERBOARD' });
        }
    };

    // Student Actions
    const submitAnswer = (optionKey: string) => {
        if (hasAnswered || !quizState) return;
        setSelectedAnswer(optionKey);
        setHasAnswered(true);

        const storedResponses = localStorage.getItem(QUIZ_RESPONSES_KEY);
        const responses = storedResponses ? JSON.parse(storedResponses) : [];

        responses.push({
            studentName: studentName,
            questionIndex: quizState.current_index,
            answer: optionKey
        });

        localStorage.setItem(QUIZ_RESPONSES_KEY, JSON.stringify(responses));
    };

    // Reset answer state when question changes
    useEffect(() => {
        if (quizState?.current_index !== undefined) {
            setHasAnswered(false);
            setSelectedAnswer(null);
        }
    }, [quizState?.current_index]);


    if (!quizState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    const currentQuestion = quizState.questions[quizState.current_index];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">

                {/* Lobby View */}
                {quizState.status === 'LOBBY' && (
                    <div className="text-center space-y-8">
                        <div>
                            <span className="inline-block px-4 py-1 rounded-full bg-primary-500/10 text-primary-500 font-bold mb-4 uppercase tracking-widest text-xs">
                                Game Code
                            </span>
                            <h1 className="text-6xl font-black tracking-tighter mb-2 font-mono">{quizState.quiz_id}</h1>
                            <p className="text-slate-500 dark:text-slate-400">Waiting for players to join...</p>
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center">
                            {players.map((p) => (
                                <div key={p.id} className="bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-in zoom-in duration-300">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center font-bold text-white text-xs">
                                        {p.name[0]}
                                    </div>
                                    <span className="font-bold">{p.name}</span>
                                </div>
                            ))}
                        </div>

                        {role === 'host' ? (
                            <Button size="lg" className="w-64 py-6 text-xl shadow-xl shadow-primary-500/20" onClick={startQuiz}>
                                <Play className="w-6 h-6 mr-2" /> Start Quiz
                            </Button>
                        ) : (
                            <div className="p-8 glass rounded-3xl max-w-sm mx-auto">
                                <Activity className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-bounce" />
                                <h3 className="text-xl font-bold mb-2">You're In!</h3>
                                <p className="text-slate-500 dark:text-slate-400">Watch the big screen. The game will start soon.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Question View */}
                {quizState.status === 'QUESTION' && currentQuestion && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-full font-bold font-mono">
                                Q{quizState.current_index + 1} / {quizState.questions.length}
                            </div>
                            {role === 'host' && (
                                <Button onClick={nextQuestion}>
                                    Next Question <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>

                        <Card className="p-8 text-center min-h-[200px] flex items-center justify-center bg-white dark:bg-[#1e293b] shadow-2xl">
                            <h2 className="text-2xl md:text-4xl font-bold leading-tight">{currentQuestion.question_text}</h2>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(currentQuestion.options).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => role === 'student' && submitAnswer(key)}
                                    disabled={role === 'host' || hasAnswered}
                                    className={`
                                        p-6 rounded-2xl text-left transition-all transform active:scale-95 border-2
                                        ${role === 'host' ? 'cursor-default' : 'cursor-pointer hover:shadow-xl'}
                                        ${selectedAnswer === key
                                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30 ring-4 ring-primary-500/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border-2
                                            ${selectedAnswer === key ? 'bg-white text-primary-600 border-transparent' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}
                                        `}>
                                            {key}
                                        </div>
                                        <span className="text-lg font-bold">{value}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {hasAnswered && (
                            <div className="text-center animate-fade-in-up">
                                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-bold">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Answer Submitted
                                </span>
                            </div>
                        )}
                        {role === 'host' && (
                            <div className="text-center text-slate-500 text-sm">
                                Teacher View - You cannot vote.
                            </div>
                        )}
                    </div>
                )}

                {/* Leaderboard View */}
                {quizState.status === 'LEADERBOARD' && (
                    <div className="text-center space-y-8">
                        <Crown className="w-24 h-24 text-amber-400 mx-auto fill-current animate-bounce" />
                        <h1 className="text-5xl font-black">Game Over!</h1>

                        <div className="max-w-md mx-auto space-y-4">
                            {players.sort((a, b) => b.score - a.score).slice(0, 5).map((p, i) => (
                                <div key={p.id} className={`
                                    flex items-center justify-between p-4 rounded-2xl border-2
                                    ${i === 0 ? 'bg-amber-100 dark:bg-amber-900/20 border-amber-500/50 scale-105 shadow-xl' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}
                                `}>
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                                            ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-slate-200 dark:bg-slate-600 text-slate-500'}
                                        `}>
                                            {i + 1}
                                        </div>
                                        <span className="font-bold text-lg">{p.name}</span>
                                    </div>
                                    <span className="font-black font-mono text-xl">{p.score}</span>
                                </div>
                            ))}
                        </div>

                        <Button onClick={() => navigate('/dashboard')} variant="outline" className="mt-8">
                            Exit to Dashboard
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveQuizSession;
