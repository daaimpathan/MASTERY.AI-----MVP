import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Play, CheckCircle2, Users, Zap } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

const ACTIVE_QUIZ_KEY = 'mastery_active_quiz';

interface QuizSession {
    quiz_id: string;
    title: string;
    created_at: string;
    questions: Array<{
        question_text: string;
        options: Record<string, string>;
        correct_answer: string;
    }>;
}

const StudentJoin = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [activeQuiz, setActiveQuiz] = useState<QuizSession | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);

    // Check for active quiz session
    useEffect(() => {
        const checkActiveQuiz = () => {
            const stored = localStorage.getItem(ACTIVE_QUIZ_KEY);
            if (stored) {
                setActiveQuiz(JSON.parse(stored));
            } else {
                setActiveQuiz(null);
                setHasJoined(false);
            }
        };

        checkActiveQuiz();
        // Poll for new sessions
        const interval = setInterval(checkActiveQuiz, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleJoinQuiz = () => {
        if (!activeQuiz || !user) return;

        setIsJoining(true);

        // Add student to the joined list
        const studentName = `${user.first_name} ${user.last_name}`;
        const studentsData = localStorage.getItem('mastery_quiz_students');
        const students = studentsData ? JSON.parse(studentsData) : [];

        if (!students.includes(studentName)) {
            students.push(studentName);
            localStorage.setItem('mastery_quiz_students', JSON.stringify(students));
        }

        setHasJoined(true);
        setIsJoining(false);
    };

    const handleEnterQuiz = () => {
        if (activeQuiz) {
            navigate(`/dashboard/quiz/session/${activeQuiz.quiz_id}`, {
                state: { role: 'student', studentName: `${user?.first_name} ${user?.last_name}` }
            });
        }
    };

    // No active quiz
    if (!activeQuiz) {
        return (
            <div className="p-8 animate-fade-in">
                <div className="max-w-2xl mx-auto text-center py-16">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Gamepad2 className="w-12 h-12 text-slate-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">No Active Quiz</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">
                        Wait for your teacher to start a live quiz session. You'll be able to join automatically!
                    </p>
                    <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        Checking for active sessions...
                    </div>
                </div>
            </div>
        );
    }

    // Has joined - waiting for quiz to start
    if (hasJoined) {
        return (
            <div className="p-8 animate-fade-in">
                <div className="max-w-2xl mx-auto text-center py-16">
                    <div className="w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">You're In!</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">
                        Successfully joined: <span className="font-bold text-primary-600">{activeQuiz.title}</span>
                    </p>
                    <p className="text-slate-400 mb-8">
                        Waiting for teacher to start the quiz...
                    </p>

                    <Card className="inline-block p-6 bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900 dark:text-white">{user?.first_name} {user?.last_name}</p>
                                <p className="text-sm text-emerald-500 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Ready to play
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="mt-8">
                        <Button onClick={handleEnterQuiz}>
                            <Play className="w-4 h-4 mr-2" /> Enter Quiz Room
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Active quiz found - show join option
    return (
        <div className="p-8 animate-fade-in">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30 animate-bounce">
                        <Gamepad2 className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Live Quiz Available!</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Your teacher has started a quiz session</p>
                </div>

                <Card className="p-8 border-2 border-primary-500/30 bg-gradient-to-br from-primary-500/5 to-transparent shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-primary-500/10 rounded-2xl">
                            <Zap className="w-8 h-8 text-primary-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{activeQuiz.title}</h2>
                            <p className="text-slate-500 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {activeQuiz.questions.length} questions
                            </p>
                        </div>
                        <div className="ml-auto">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-sm font-bold flex items-center gap-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Live
                            </span>
                        </div>
                    </div>

                    <Button
                        className="w-full py-4 text-lg shadow-xl shadow-primary-500/20"
                        onClick={handleJoinQuiz}
                        isLoading={isJoining}
                    >
                        <Play className="w-5 h-5 mr-2" /> Join Quiz Now
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default StudentJoin;
