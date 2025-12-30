import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface LexicalVoidsProps {
    onComplete: (score: number) => void;
    onFailure: () => void;
}

const WORDS = [
    { word: 'NEBULA', hint: 'Cloud of dust and gas in space' },
    { word: 'GALAXY', hint: 'System of millions or billions of stars' },
    { word: 'ORBIT', hint: 'Curved path of a celestial object' },
    { word: 'QUASAR', hint: 'Massive and extremely remote celestial object' },
    { word: 'ZENITH', hint: 'Point in the sky directly above the observer' },
    { word: 'COSMOS', hint: 'The universe seen as a well-ordered whole' },
    { word: 'PULSAR', hint: 'Celestial object emitting beams of radio waves' },
    { word: 'VOID', hint: 'Completely empty space' },
    { word: 'GRAVITY', hint: 'Force that attracts a body toward the center of the earth' },
    { word: 'ECLIPSE', hint: 'Obscuring of the light from one celestial body by another' }
];

const LexicalVoids = ({ onComplete }: LexicalVoidsProps) => {
    const [timeLeft, setTimeLeft] = useState(45);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [shuffledWord, setShuffledWord] = useState('');
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [wordsSolved, setWordsSolved] = useState(0);
    const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');

    const initializeRound = () => {
        // Shuffle words randomly for the session
        // For simplicity in this demo, just picking sequentially or random from list
        // Real implementation would shuffle the WORDS array
        prepareWord(currentWordIndex);
    };

    const prepareWord = (index: number) => {
        const target = WORDS[index % WORDS.length].word;
        const shuffled = target.split('').sort(() => Math.random() - 0.5).join('');
        // Ensure it's not same as original (simple check)
        if (shuffled === target) {
            prepareWord(index); // Retry
            return;
        }
        setShuffledWord(shuffled);
        setUserInput('');
        setFeedback('neutral');
    };

    useEffect(() => {
        initializeRound();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onComplete(score);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [score, onComplete]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const target = WORDS[currentWordIndex % WORDS.length].word;

        if (userInput.toUpperCase() === target) {
            const wordScore = 200 + (userInput.length * 10);
            const newScore = score + wordScore;
            setScore(newScore);
            setWordsSolved(prev => prev + 1);
            setFeedback('correct');

            // Next word delay
            setTimeout(() => {
                const nextIndex = currentWordIndex + 1;
                setCurrentWordIndex(nextIndex);
                prepareWord(nextIndex);
            }, 500);

            // Win condition (e.g., solve 5 words)
            if (wordsSolved >= 4) {
                onComplete(newScore + (timeLeft * 20)); // Bonus
            }

        } else {
            setFeedback('wrong');
            setUserInput('');
            // Shake effect logic would go here
        }
    };

    return (
        <div className="space-y-6 text-center">
            <div className="flex justify-between items-center text-emerald-300 text-sm font-medium">
                <span>DATA SHARDS RESTORED: {wordsSolved}/5</span>
                <div className={`flex items-center gap-2 ${timeLeft < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                    <Clock className="w-4 h-4" />
                    {timeLeft}s
                </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">Decrypt the Signal</p>
                <div className="text-5xl font-black text-white tracking-[0.5em] mb-2 font-mono">
                    {shuffledWord}
                </div>
                <div className="text-indigo-300 text-sm flex items-center justify-center gap-2 mt-4">
                    <AlertCircle className="w-4 h-4" />
                    Hint: {WORDS[currentWordIndex % WORDS.length].hint}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                    className={`w-full bg-slate-900 border-2 rounded-xl p-4 text-center text-2xl font-bold text-white tracking-widest outline-none transition-all ${feedback === 'wrong' ? 'border-red-500' : 'border-slate-700 focus:border-emerald-500'
                        }`}
                    placeholder="ENTER DECRYPTION KEY"
                    autoFocus
                />
                <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 font-bold tracking-wider"
                >
                    VALIDATE
                </Button>
            </form>
        </div>
    );
};

export default LexicalVoids;
