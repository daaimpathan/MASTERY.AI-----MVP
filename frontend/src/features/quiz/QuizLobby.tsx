import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Play, Plus, Trash2, Users, Zap, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

// Store active quiz session in localStorage for student auto-join
const ACTIVE_QUIZ_KEY = 'mastery_active_quiz';

interface QuizSession {
    quiz_id: string;
    title: string;
    created_at: string;
    questions: Question[];
    status: 'LOBBY' | 'QUESTION' | 'LEADERBOARD';
    current_index: number;
}

interface Question {
    question_text: string;
    options: Record<string, string>;
    correct_answer: string;
}

const QuizLobby = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionCreated, setSessionCreated] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState<QuizSession | null>(null);
    const [joinedStudents, setJoinedStudents] = useState<string[]>([]);

    const [questions, setQuestions] = useState<Question[]>([
        {
            question_text: "What is the powerhouse of the cell?",
            options: { "A": "Nucleus", "B": "Mitochondria", "C": "Ribosome", "D": "Endoplasmic Reticulum" },
            correct_answer: "B"
        },
        {
            question_text: "Solve for x: 2x + 10 = 20",
            options: { "A": "5", "B": "10", "C": "15", "D": "0" },
            correct_answer: "A"
        },
        {
            question_text: "Which planet is known as the Red Planet?",
            options: { "A": "Venus", "B": "Mars", "C": "Jupiter", "D": "Saturn" },
            correct_answer: "B"
        }
    ]);
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [newQuestion, setNewQuestion] = useState<Question>({
        question_text: '',
        options: { "A": "", "B": "", "C": "", "D": "" },
        correct_answer: 'A'
    });

    // AI Generation State
    const [aiTopic, setAiTopic] = useState('');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Load existing session
    useEffect(() => {
        const stored = localStorage.getItem(ACTIVE_QUIZ_KEY);
        if (stored) {
            const session = JSON.parse(stored);
            setActiveQuiz(session);
            setSessionCreated(true);
            // Don't overwrite if we have defaults and session has none (edge case, but safest is to trust session if exists)
            if (session.questions && session.questions.length > 0) {
                setQuestions(session.questions);
            }
        }
    }, []);

    const handleGenerateAI = async () => {
        if (!aiTopic) return;
        setIsGeneratingAI(true);
        try {
            const response = await api.generateAIQuiz({
                topic: aiTopic,
                count: 5,
                difficulty: 'Medium'
            });

            if (response.questions) {
                setQuestions([...questions, ...response.questions]);
                setAiTopic('');
                // Optional: Scroll to bottom or show toast
            }
        } catch (error) {
            console.error("AI Generation Failed", error);
            alert("Failed to generate questions. Please check your API key or try again.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const addQuestion = () => {
        if (!newQuestion.question_text.trim()) return;
        setQuestions([...questions, newQuestion]);
        setNewQuestion({
            question_text: '',
            options: { "A": "", "B": "", "C": "", "D": "" },
            correct_answer: 'A'
        });
        setShowAddQuestion(false);
    };

    const removeQuestion = (index: number) => {
        const updated = [...questions];
        updated.splice(index, 1);
        setQuestions(updated);
    };

    // Poll for joined students (real-time simulation)
    useEffect(() => {
        if (!sessionCreated) return;

        const pollStudents = () => {
            const studentsData = localStorage.getItem('mastery_quiz_students');
            if (studentsData) {
                setJoinedStudents(JSON.parse(studentsData));
            }
        };

        pollStudents();
        const interval = setInterval(pollStudents, 1000);
        return () => clearInterval(interval);
    }, [sessionCreated]);

    const handleCreateSession = async () => {
        setIsLoading(true);

        // Simulate backend call - create session locally
        const quizId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const session: QuizSession = {
            quiz_id: quizId,
            title: title || "Live Mastery Quiz",
            created_at: new Date().toISOString(),
            questions: questions,
            status: 'LOBBY',
            current_index: 0
        };

        // Store in localStorage for student auto-join
        localStorage.setItem(ACTIVE_QUIZ_KEY, JSON.stringify(session));
        localStorage.setItem('mastery_quiz_students', JSON.stringify([]));

        setActiveQuiz(session);
        setSessionCreated(true);
        setIsLoading(false);
    };

    const handleStartQuiz = () => {
        if (activeQuiz) {
            navigate(`/dashboard/quiz/session/${activeQuiz.quiz_id}`, { state: { role: 'host', quiz: activeQuiz } });
        }
    };

    const handleEndSession = () => {
        localStorage.removeItem(ACTIVE_QUIZ_KEY);
        localStorage.removeItem('mastery_quiz_students');
        setSessionCreated(false);
        setActiveQuiz(null);
        setJoinedStudents([]);
    };

    // Session Created - Show Lobby View
    if (sessionCreated && activeQuiz) {
        return (
            <div className="p-8 space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-emerald-500 text-sm font-bold uppercase tracking-wider">Live Session</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{activeQuiz.title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Students can join automatically from their dashboard</p>
                    </div>
                    <Button variant="outline" className="text-rose-500 border-rose-500/30 hover:bg-rose-500/10" onClick={handleEndSession}>
                        End Session
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Joined Students */}
                    <Card className="lg:col-span-2 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <Users className="w-6 h-6 text-primary-500" />
                                Waiting Room
                            </h3>
                            <span className="px-3 py-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full text-sm font-bold">
                                {joinedStudents.length} students joined
                            </span>
                        </div>

                        {joinedStudents.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 mb-2">Waiting for students to join...</p>
                                <p className="text-sm text-slate-400">Students will appear here when they join from their dashboard</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {joinedStudents.map((student, i) => (
                                    <div key={i} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {student.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{student}</p>
                                            <p className="text-xs text-emerald-600 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Ready
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Start Quiz */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none shadow-2xl shadow-primary-500/30">
                            <Zap className="w-12 h-12 mb-4 opacity-80" />
                            <h3 className="text-xl font-bold">Ready to Start?</h3>
                            <p className="text-primary-100 text-sm mt-2 mb-6">
                                {joinedStudents.length > 0
                                    ? `${joinedStudents.length} students are ready. Start the quiz when you're ready!`
                                    : "Wait for students to join, then start the quiz."
                                }
                            </p>

                            <Button
                                className="w-full bg-white text-primary-600 hover:bg-primary-50 border-none shadow-lg"
                                onClick={handleStartQuiz}
                                disabled={joinedStudents.length === 0}
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Start Quiz Now
                            </Button>
                        </Card>

                        <Card className="p-6">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Quiz Info</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Questions</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{activeQuiz.questions.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Session ID</span>
                                    <span className="font-mono font-bold text-primary-600">{activeQuiz.quiz_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Auto-Join</span>
                                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> Enabled
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Create Session View
    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Host Live Quiz</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Create a real-time multiplayer challenge for your class</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Quiz Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Algebra Review - Week 4"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Questions ({questions.length})</label>
                            <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAddQuestion(!showAddQuestion)}>
                                <Plus className="w-4 h-4" /> {showAddQuestion ? 'Cancel' : 'Add Question'}
                            </Button>
                        </div>

                        {showAddQuestion && (
                            <div className="p-4 mb-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-primary-500/30 animate-fade-in">
                                <div className="space-y-3">
                                    <input
                                        value={newQuestion.question_text}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                                        placeholder="Enter question text..."
                                        className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.keys(newQuestion.options).map((key) => (
                                            <div key={key} className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-500 w-4">{key}</span>
                                                <input
                                                    value={newQuestion.options[key]}
                                                    onChange={(e) => setNewQuestion({
                                                        ...newQuestion,
                                                        options: { ...newQuestion.options, [key]: e.target.value }
                                                    })}
                                                    placeholder={`Option ${key}`}
                                                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                                                />
                                                <input
                                                    type="radio"
                                                    name="correct"
                                                    checked={newQuestion.correct_answer === key}
                                                    onChange={() => setNewQuestion({ ...newQuestion, correct_answer: key })}
                                                    className="accent-emerald-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <Button size="sm" className="w-full mt-2" onClick={addQuestion} disabled={!newQuestion.question_text}>
                                        Save Question
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {questions.length === 0 ? (
                                <p className="text-center text-sm text-slate-500 py-4">No questions added yet.</p>
                            ) : (
                                questions.map((q, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between group hover:border-primary-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{q.question_text}</p>
                                                <p className="text-xs text-emerald-500">Correct: {q.correct_answer}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => removeQuestion(i)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none shadow-2xl shadow-primary-500/30">
                        <Gamepad2 className="w-12 h-12 mb-4 opacity-80" />
                        <h3 className="text-xl font-bold">Ready to Start?</h3>
                        <p className="text-primary-100 text-sm mt-2 mb-6">Launch the session. Students will join automatically from their dashboard!</p>

                        <Button
                            className="w-full bg-white text-primary-600 hover:bg-primary-50 border-none shadow-lg"
                            onClick={handleCreateSession}
                            isLoading={isLoading}
                            disabled={questions.length === 0}
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Launch Session
                        </Button>
                        {questions.length === 0 && (
                            <p className="text-xs text-rose-500 text-center mt-2">Add at least one question to start.</p>
                        )}
                    </Card>

                    {/* AI Generator Card */}
                    <Card className="p-6 border-violet-500/20 bg-violet-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-violet-500/10 rounded-lg">
                                <Zap className="w-5 h-5 text-violet-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">AI Question Generator</h4>
                                <p className="text-xs text-slate-500">Powered by Gemini</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <input
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder="Topic (e.g. Photosynthesis)"
                                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                            <Button
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                                onClick={handleGenerateAI}
                                isLoading={isGeneratingAI}
                                disabled={!aiTopic}
                            >
                                <Zap className="w-4 h-4 mr-2" /> Generate Questions
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Auto-Join Feature</h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>Students see active quiz on their dashboard</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>One-click join - no code needed</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>Real-time participant tracking</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default QuizLobby;
