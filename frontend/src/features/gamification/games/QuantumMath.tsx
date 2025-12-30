import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface QuantumMathProps {
    onComplete: (score: number) => void;
    onFailure: () => void;
}

const QuantumMath = ({ onComplete }: QuantumMathProps) => {
    const [timeLeft, setTimeLeft] = useState(30);
    const [question, setQuestion] = useState({ text: '', answer: 0 });
    const [options, setOptions] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);

    const generateQuestion = () => {
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let a = Math.floor(Math.random() * 20) + 1;
        let b = Math.floor(Math.random() * 20) + 1;

        let ans = 0;
        if (op === '+') ans = a + b;
        else if (op === '-') {
            if (a < b) [a, b] = [b, a]; // Ensure positive result
            ans = a - b;
        } else if (op === '*') {
            a = Math.floor(Math.random() * 12) + 1; // Smaller numbers for multiplication
            b = Math.floor(Math.random() * 12) + 1;
            ans = a * b;
        }

        const wrongOptions = new Set<number>();
        while (wrongOptions.size < 3) {
            const wrong = ans + Math.floor(Math.random() * 10) - 5;
            if (wrong !== ans && wrong >= 0) wrongOptions.add(wrong);
        }

        const allOptions = [...Array.from(wrongOptions), ans].sort(() => Math.random() - 0.5);

        setQuestion({ text: `${a} ${op} ${b}`, answer: ans });
        setOptions(allOptions);
    };

    useEffect(() => {
        generateQuestion();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onComplete(score); // Time's up, submit current score
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [score, onComplete]);

    const handleAnswer = (selected: number) => {
        if (selected === question.answer) {
            setScore(prev => prev + 150); // 150 points per correct answer
            setQuestionCount(prev => prev + 1);
            if (questionCount >= 9) { // End after 10 questions
                onComplete(score + 150 + (timeLeft * 10)); // Bonus for time left
            } else {
                generateQuestion();
            }
        } else {
            // Penalize for wrong answer? Or just fail? Let's reduce time as penalty.
            setTimeLeft(prev => Math.max(0, prev - 5));
        }
    };

    return (
        <div className="space-y-6 text-center">
            <div className="flex justify-between items-center text-cyan-300 text-sm font-medium">
                <span>STABILIZE CORE: {questionCount + 1}/10</span>
                <div className={`flex items-center gap-2 ${timeLeft < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                    <Clock className="w-4 h-4" />
                    {timeLeft}s
                </div>
            </div>

            <div className="py-8">
                <div className="text-6xl font-black text-white mb-2 tracking-widest font-mono">
                    {question.text}
                </div>
                <div className="text-slate-400 text-sm">Calculate Result</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {options.map((opt, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAnswer(opt)}
                        className="bg-slate-800 hover:bg-cyan-900/50 border border-slate-700 hover:border-cyan-500/50 text-white text-2xl font-bold py-6 rounded-xl transition-colors"
                    >
                        {opt}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default QuantumMath;
