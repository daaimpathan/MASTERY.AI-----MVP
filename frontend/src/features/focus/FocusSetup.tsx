import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface FocusSetupProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (topic: string) => void;
}

const FocusSetup = ({ isOpen, onClose, onStart }: FocusSetupProps) => {
    const [topic, setTopic] = useState('');
    const [step, setStep] = useState<'rules' | 'input'>('rules');

    const handleStart = () => {
        if (topic.trim().length > 0) {
            onStart(topic);
            setTopic('');
            setStep('rules'); // Reset for next time
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header Gradient */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                        <div className="p-8">
                            {step === 'rules' ? (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                                            <Shield className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Event Horizon Protocols</h2>
                                        <p className="text-slate-400 text-sm">Review the singularity rules before entering.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-slate-200 text-sm">No Tab Switching</h3>
                                                <p className="text-xs text-slate-400 mt-1">Leaving the window triggers a distraction alert and reduces your Dark Energy mining rate.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                            <Clock className="w-6 h-6 text-yellow-400 shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-slate-200 text-sm">30 Minute Minimum</h3>
                                                <p className="text-xs text-slate-400 mt-1">Cognitive Scores are only awarded for sessions longer than 30 minutes. Commit to the deep dive.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                            <Zap className="w-6 h-6 text-purple-400 shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-slate-200 text-sm">500 Points / Hour</h3>
                                                <p className="text-xs text-slate-400 mt-1">Earn Cognitive Score based on pure focus time. 1 Hour = 500 XP.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full py-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-500"
                                        onClick={() => setStep('input')}
                                    >
                                        I Accept the Protocols
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-white mb-2">Target Lock</h2>
                                        <p className="text-slate-400 text-sm">Define your objective for this session.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Objective</label>
                                        <textarea
                                            autoFocus
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="I am studying..."
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleStart();
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setStep('rules')} className="flex-1">
                                            Back
                                        </Button>
                                        <Button
                                            className="flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/25"
                                            onClick={handleStart}
                                            disabled={topic.trim().length === 0}
                                        >
                                            Enter Singularity
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FocusSetup;
