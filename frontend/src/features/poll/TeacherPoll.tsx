import { useState, useEffect } from 'react';
import { MessageCircle, Send, Users, CheckCircle2, XCircle, BarChart3, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { db, ref, set, onValue, remove } from '../../lib/firebase';

interface PollData {
    id: string;
    question: string;
    created_at: string;
    is_active: boolean;
}

interface PollResponse {
    studentName: string;
    answer: 'yes' | 'no';
    timestamp: string;
}

const TeacherPoll = () => {
    const [question, setQuestion] = useState('');
    const [activePoll, setActivePoll] = useState<PollData | null>(null);
    const [responses, setResponses] = useState<PollResponse[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        // Real-time listener for the active poll
        const pollRef = ref(db, 'polls/active');
        const unsubscribePoll = onValue(pollRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setActivePoll(data);
            } else {
                setActivePoll(null);
                setResponses([]); // Clear responses if no poll
            }
        });

        // Real-time listener for responses
        const responsesRef = ref(db, 'polls/active/responses');
        const unsubscribeResponses = onValue(responsesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Firebase returns object with keys, convert to array
                const responseList = Object.values(data) as PollResponse[];
                setResponses(responseList);
            } else {
                setResponses([]);
            }
        });

        return () => {
            unsubscribePoll();
            unsubscribeResponses();
        };
    }, []);

    const handleCreatePoll = async () => {
        if (!question.trim()) return;
        setIsCreating(true);
        const poll: PollData = {
            id: Math.random().toString(36).substring(2, 8),
            question: question.trim(),
            created_at: new Date().toISOString(),
            is_active: true
        };

        try {
            // Write to Firebase
            await set(ref(db, 'polls/active'), poll);
            // Clear previous responses
            await remove(ref(db, 'polls/active/responses'));

            setQuestion('');
        } catch (error) {
            console.error("Error creating poll:", error);
            alert("Failed to create poll. Check Firebase config.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleEndPoll = async () => {
        if (!activePoll) return;
        try {
            // Soft close: Keep persistence but mark inactive so students see results
            await set(ref(db, 'polls/active'), { ...activePoll, is_active: false });
        } catch (error) {
            console.error("Error ending poll:", error);
        }
    };

    const handleClearPoll = async () => {
        try {
            await remove(ref(db, 'polls/active'));
            await remove(ref(db, 'polls/active/responses'));
        } catch (error) {
            console.error("Error clearing poll:", error);
        }
    };



    const yesCount = responses.filter(r => r.answer === 'yes').length;
    const noCount = responses.filter(r => r.answer === 'no').length;
    const totalResponses = responses.length;
    const yesPercentage = totalResponses > 0 ? Math.round((yesCount / totalResponses) * 100) : 0;
    const noPercentage = totalResponses > 0 ? Math.round((noCount / totalResponses) * 100) : 0;

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-primary-500" />
                        Quick Polls (Firebase Realtime)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Create instant Yes/No polls for your class</p>
                </div>
                {activePoll && (
                    <div className="flex items-center gap-2 text-sm text-emerald-500">
                        <RefreshCw className="w-4 h-4 animate-spin-slow" />
                        Live updates
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Send className="w-5 h-5 text-primary-500" />
                        Create New Poll
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Question</label>
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="e.g., Did everyone understand today's concept?"
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none h-32"
                                disabled={!!activePoll}
                            />
                        </div>
                        {activePoll ? (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-sm">
                                A poll is already active. End it first to create a new one.
                            </div>
                        ) : (
                            <Button className="w-full" onClick={handleCreatePoll} disabled={!question.trim() || isCreating} isLoading={isCreating}>
                                <Send className="w-4 h-4 mr-2" /> Send Poll to All Students
                            </Button>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-bold text-slate-500 mb-3">Quick Templates:</p>
                        <div className="flex flex-wrap gap-2">
                            {["Did everyone understand?", "Ready to move on?", "Need more examples?", "Any questions?"].map((template, i) => (
                                <button key={i} onClick={() => setQuestion(template)} disabled={!!activePoll}
                                    className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-primary-100 dark:hover:bg-primary-500/20 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {template}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    {activePoll ? (
                        <>
                            <Card className="p-6 bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/30">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${activePoll.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                        <span className={`text-sm font-bold uppercase tracking-wider ${activePoll.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {activePoll.is_active ? 'Live Poll' : 'Poll Ended'}
                                        </span>
                                    </div>
                                    {activePoll.is_active ? (
                                        <Button size="sm" variant="ghost" onClick={handleEndPoll} className="text-slate-400 border-rose-500/30 hover:bg-rose-500/10">
                                            End Poll (Show Results)
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="ghost" onClick={handleClearPoll} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                            Close & Clear
                                        </Button>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">"{activePoll.question}"</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> Yes
                                            </span>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{yesCount} ({yesPercentage}%)</span>
                                        </div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${yesPercentage}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                                <XCircle className="w-4 h-4" /> No
                                            </span>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{noCount} ({noPercentage}%)</span>
                                        </div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500" style={{ width: `${noPercentage}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                                    <span className="text-sm text-slate-500 flex items-center gap-2">
                                        <Users className="w-4 h-4" /> {totalResponses} responses
                                    </span>
                                </div>
                            </Card>
                            <Card className="p-6">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-primary-500" /> Individual Responses
                                </h4>
                                {responses.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-4">Waiting for students to respond...</p>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {responses.map((resp, i) => (
                                            <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${resp.answer === 'yes' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                                                <span className="font-medium text-slate-900 dark:text-white">{resp.studentName}</span>
                                                <span className={`flex items-center gap-1 text-sm font-bold ${resp.answer === 'yes' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {resp.answer === 'yes' ? <><CheckCircle2 className="w-4 h-4" /> Yes</> : <><XCircle className="w-4 h-4" /> No</>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </>
                    ) : (
                        <Card className="p-6 text-center">
                            <div className="py-12">
                                <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Poll</h3>
                                <p className="text-slate-500">Create a poll to get instant feedback from your students</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherPoll;
