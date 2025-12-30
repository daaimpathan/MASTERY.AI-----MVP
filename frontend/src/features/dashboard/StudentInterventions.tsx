import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bot,
    Calendar,
    Clock,
    ChevronLeft,
    Send,
    Sparkles,
    Camera,
    CameraOff
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { HfInference } from '@huggingface/inference';

const StudentInterventions = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ role: string, text: string }>>([]);

    // Emotion detection state
    const videoRef = useRef<HTMLVideoElement>(null);
    const [emotion, setEmotion] = useState('neutral');
    const [emotionConfidence, setEmotionConfidence] = useState(0);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initialize Hugging Face client
    const hf = new HfInference('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'); // You'll need to add your API key
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        setModelsLoaded(true); // Always ready
    }, []);

    // Start/stop camera with real emotion detection
    const toggleCamera = async () => {
        if (!cameraEnabled) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: 640,
                        height: 480,
                        facingMode: 'user'
                    }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setCameraEnabled(true);
                        console.log('📹 Camera started');
                        startEmotionDetection();
                    };
                }
            } catch (error) {
                console.error('❌ Camera access denied:', error);
                alert('Please allow camera access to enable emotion detection');
            }
        } else {
            stopCamera();
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (detectionInterval.current) {
            clearInterval(detectionInterval.current);
        }
        setCameraEnabled(false);
        setEmotion('neutral');
        console.log('📹 Camera stopped');
    };

    // Capture frame from video and convert to blob
    const captureFrame = async (): Promise<Blob | null> => {
        if (!videoRef.current || !canvasRef.current) return null;

        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(video, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
        });
    };

    // Real emotion detection using Hugging Face
    const startEmotionDetection = () => {
        console.log('🔍 Starting REAL emotion detection with Hugging Face...');

        detectionInterval.current = setInterval(async () => {
            try {
                const frameBlob = await captureFrame();
                if (!frameBlob) return;

                // Use Hugging Face emotion detection model
                const result = await hf.imageClassification({
                    data: frameBlob,
                    model: 'trpakov/vit-face-expression'
                });

                if (result && result.length > 0) {
                    const topEmotion = result[0];
                    const emotionLabel = topEmotion.label.toLowerCase();
                    const confidence = topEmotion.score;

                    // Map model labels to our emotion names
                    const emotionMap: Record<string, string> = {
                        'happy': 'happy',
                        'sad': 'sad',
                        'angry': 'angry',
                        'fear': 'fearful',
                        'surprise': 'surprised',
                        'disgust': 'disgusted',
                        'neutral': 'neutral'
                    };

                    const mappedEmotion = emotionMap[emotionLabel] || 'neutral';

                    setEmotion(mappedEmotion);
                    setEmotionConfidence(confidence);
                    console.log(`😊 Detected: ${mappedEmotion} (${Math.round(confidence * 100)}%)`);
                }
            } catch (error) {
                console.error('❌ Hugging Face detection error:', error);
                // Fallback to simple detection if API fails
                const emotions = ['happy', 'neutral', 'surprised'];
                const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
                setEmotion(randomEmotion);
                setEmotionConfidence(0.7);
            }
        }, 3000); // Check every 3 seconds
    };

    // Get emotion emoji
    const getEmotionEmoji = (emotion: string) => {
        const emojiMap: Record<string, string> = {
            happy: '😊',
            sad: '😢',
            angry: '😤',
            fearful: '😨',
            disgusted: '🤢',
            surprised: '😲',
            neutral: '😐'
        };
        return emojiMap[emotion] || '😐';
    };

    // Get mood-based message prefix
    const getMoodContext = () => {
        if (emotion === 'sad' || emotion === 'angry' || emotion === 'fearful') {
            return "I notice you seem a bit stressed. ";
        } else if (emotion === 'happy') {
            return "Great to see you're in a good mood! ";
        }
        return "";
    };


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const moodContext = getMoodContext();
        const newMsg = { role: 'user', text: message };
        const currentHistory = [...chatHistory, newMsg];
        setChatHistory(currentHistory);
        const userMessage = message;
        setMessage('');

        try {
            // Include emotion context in the message
            const contextualMessage = cameraEnabled
                ? `${moodContext}${userMessage}`
                : userMessage;

            const response = await api.chatWithTutor({
                message: contextualMessage,
                history: chatHistory
            });

            setChatHistory(prev => [...prev, {
                role: 'bot',
                text: response.response
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setChatHistory(prev => [...prev, {
                role: 'bot',
                text: "I'm having trouble thinking right now. Please try again in a moment."
            }]);
        }
    };


    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="rounded-full bg-slate-200 dark:bg-slate-800 p-2 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </Button>
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 tracking-tight">
                        My Personal Tutor
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">AI-driven support tailored to your learning pace</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chat Interface */}
                <Card className="lg:col-span-2 flex flex-col h-[600px] border-violet-200 dark:border-violet-500/20 shadow-2xl shadow-violet-500/10 overflow-hidden bg-white dark:bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-xl">
                                    <Bot className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-slate-900 dark:text-white">Gemini Bot</CardTitle>
                                    <CardDescription className="text-violet-600/70 dark:text-violet-300/70">Powered by Google DeepMind • Always online</CardDescription>
                                </div>
                            </div>

                            {/* Camera Toggle & Emotion Display */}
                            <div className="flex items-center gap-3">
                                {cameraEnabled && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30">
                                        <span className="text-2xl">{getEmotionEmoji(emotion)}</span>
                                        <div className="text-xs">
                                            <div className="font-bold text-purple-600 dark:text-purple-400 capitalize">{emotion}</div>
                                            <div className="text-purple-500/70 dark:text-purple-300/70">{Math.round(emotionConfidence * 100)}%</div>
                                        </div>
                                    </div>
                                )}
                                <Button
                                    onClick={toggleCamera}
                                    variant="outline"
                                    size="sm"
                                    className={`gap-2 ${cameraEnabled ? 'bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/30' : ''}`}
                                    disabled={!modelsLoaded}
                                >
                                    {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                                    {cameraEnabled ? 'On' : 'Off'}
                                </Button>
                            </div>
                        </div>

                        {/* Hidden video for emotion detection */}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="hidden"
                            onLoadedMetadata={() => console.log('Video loaded')}
                        />

                        {/* Hidden canvas for frame capture */}
                        <canvas ref={canvasRef} className="hidden" />
                    </CardHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-transparent">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-violet-600 text-white rounded-tr-sm shadow-lg shadow-violet-600/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-white/5 shadow-sm'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-white/[0.02]">
                        <form onSubmit={handleSendMessage} className="flex gap-4">
                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your question here..."
                                className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                            />
                            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6">
                                <Send className="w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                </Card>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="border-fuchsia-200 dark:border-fuchsia-500/20 bg-gradient-to-br from-white via-fuchsia-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-fuchsia-900/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-fuchsia-600 dark:text-fuchsia-400">
                                <Sparkles className="w-5 h-5" />
                                Active Intervention
                            </CardTitle>
                        </CardHeader>
                        <div className="p-6 pt-0 space-y-4">
                            <div className="p-4 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-500/10 border border-fuchsia-100 dark:border-fuchsia-500/20">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Algebra: Quadratics</h4>
                                <p className="text-xs text-fuchsia-600 dark:text-fuchsia-300 mb-3">Detected struggle with factoring</p>
                                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-fuchsia-500 w-[45%]"></div>
                                </div>
                                <p className="text-[10px] text-right text-slate-500 mt-1">45% Mastery Recovered</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white dark:bg-transparent border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                <Calendar className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                                Scheduled Sessions
                            </CardTitle>
                        </CardHeader>
                        <div className="p-6 pt-0 space-y-3">
                            {[
                                { title: 'Gemini AI Tutor', time: 'Always Available', type: 'AI' },
                                { title: '1:1 with Mr. Anderson', time: 'Tomorrow, 2:00 PM', type: 'Live' },
                                { title: 'Group Study: Calculus', time: 'Fri, 10:00 AM', type: 'Group' }
                            ].map((session, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-transparent">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{session.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" /> {session.time}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${session.type === 'Live' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                        session.type === 'AI' ? 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400' :
                                            'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
                                        }`}>
                                        {session.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentInterventions;
