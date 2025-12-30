import { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { db, ref, push, onValue } from '../../lib/firebase';

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

const StudentPollPopup = () => {
    const { user } = useAuthStore();
    const [activePoll, setActivePoll] = useState<PollData | null>(null);
    const [hasResponded, setHasResponded] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<'yes' | 'no' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);

    useEffect(() => {
        if (!user) {
            console.log("StudentPollPopup: No user found");
            return;
        }
        console.log("StudentPollPopup: User:", user.role, user.first_name);

        // Listen for active poll
        const pollRef = ref(db, 'polls/active');
        const unsubscribe = onValue(pollRef, (snapshot) => {
            const data = snapshot.val();
            console.log("StudentPollPopup: Poll Data:", data);
            if (data) {
                setActivePoll(data);

                // Check if already responded by reading responses
                // Note: In a secure app, this would be enforced by rules, 
                // but checking client-side is fine for this demo scope.
                const responsesRef = ref(db, 'polls/active/responses');
                onValue(responsesRef, (respSnapshot) => {
                    const respData = respSnapshot.val();
                    if (respData) {
                        const responses = Object.values(respData) as PollResponse[];
                        const studentName = `${user.first_name} ${user.last_name}`;
                        const alreadyResponded = responses.some(r => r.studentName === studentName);
                        setHasResponded(alreadyResponded);
                        console.log("StudentPollPopup: Responded?", alreadyResponded);
                    } else {
                        setHasResponded(false);
                    }
                });

            } else {
                console.log("StudentPollPopup: No active poll");
                setActivePoll(null);
                setHasResponded(false);
                setShowThankYou(false);
                setSelectedAnswer(null);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const handleSubmitResponse = async (answer: 'yes' | 'no') => {
        if (!user || !activePoll) return;
        setIsSubmitting(true);
        setSelectedAnswer(answer);

        try {
            const studentName = `${user.first_name} ${user.last_name}`;
            const newResponse: PollResponse = {
                studentName,
                answer,
                timestamp: new Date().toISOString()
            };

            await push(ref(db, 'polls/active/responses'), newResponse);

            setHasResponded(true);
            setShowThankYou(true);
            setTimeout(() => setShowThankYou(false), 3000);
        } catch (error) {
            console.error("Error submitting poll response:", error);
            alert("Failed to submit response.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Results View (Poll Ended)
    if (activePoll && !activePoll.is_active) {
        // We need to fetch responses to show results
        // Since we don't have them in state, let's fetch them one-off or listen
        // Actually, we are not listening to responses in the main effect?
        // Let's assume for student we want a simple view, or we need to add response listening.
        // For simplicity, let's show a "Poll Ended" message and fetch the result once.
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 border-2 border-slate-500/30">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <BarChart3 className="w-8 h-8 text-slate-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Poll Ended</h2>
                        <p className="text-slate-500 dark:text-slate-400">The teacher has closed the poll.</p>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <p className="font-medium text-slate-900 dark:text-white mb-2">"{activePoll.question}"</p>
                            <p className="text-xs text-slate-500">Check the main screen for class results!</p>
                        </div>

                        <Button onClick={() => setActivePoll(null)} variant="outline" className="w-full">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!activePoll || (hasResponded && !showThankYou)) return null;

    if (showThankYou) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-bounce-in">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${selectedAnswer === 'yes' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {selectedAnswer === 'yes' ? <CheckCircle2 className="w-10 h-10 text-white" /> : <XCircle className="w-10 h-10 text-white" />}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Response Recorded!</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        You answered: <span className={`font-bold ${selectedAnswer === 'yes' ? 'text-emerald-500' : 'text-rose-500'}`}>{selectedAnswer === 'yes' ? 'Yes' : 'No'}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-4">Waiting for teacher to show results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 border-2 border-primary-500/30 animate-bounce-in">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary-500/10 rounded-xl">
                        <MessageCircle className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Live Poll</span>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                        <p className="text-sm text-slate-500">Your teacher is asking:</p>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-relaxed">{activePoll.question}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => handleSubmitResponse('yes')} disabled={isSubmitting}
                        className="py-6 text-lg bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all hover:scale-105">
                        <CheckCircle2 className="w-6 h-6 mr-2" /> Yes
                    </Button>
                    <Button onClick={() => handleSubmitResponse('no')} disabled={isSubmitting}
                        className="py-6 text-lg bg-rose-500 hover:bg-rose-600 border-none shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 transition-all hover:scale-105">
                        <XCircle className="w-6 h-6 mr-2" /> No
                    </Button>
                </div>
                <p className="text-center text-sm text-slate-400 mt-6">Your response is anonymous to classmates</p>
            </div>
        </div>
    );
};

export default StudentPollPopup;
