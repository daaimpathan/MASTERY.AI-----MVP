import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Info,
    ArrowUpRight,
    User
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface EngagementIndexData {
    student_id: string;
    class_id: string;
    index_score: number;
    risk_level: 'High' | 'Medium' | 'Low';
    contributing_factors: Record<string, number>;
}

const mockEngagementDataClassA: EngagementIndexData[] = [
    { student_id: 'S-7732', class_id: 'C10A', index_score: 88, risk_level: 'Low', contributing_factors: { 'Participation': 90, 'Submission': 85 } },
    { student_id: 'S-9921', class_id: 'C10A', index_score: 65, risk_level: 'Medium', contributing_factors: { 'Attendance': 60, 'Timeliness': 70 } },
    { student_id: 'S-1243', class_id: 'C10A', index_score: 95, risk_level: 'Low', contributing_factors: { 'Submission': 98, 'Interaction': 92 } },
    { student_id: 'S-5532', class_id: 'C10A', index_score: 42, risk_level: 'High', contributing_factors: { 'Interaction': 20, 'Resource Use': 30 } },
    { student_id: 'S-8832', class_id: 'C10A', index_score: 76, risk_level: 'Low', contributing_factors: { 'Timeliness': 80, 'Participation': 75 } },
    { student_id: 'S-3321', class_id: 'C10A', index_score: 35, risk_level: 'High', contributing_factors: { 'Resource Use': 10, 'Attendance': 40 } },
    { student_id: 'S-4421', class_id: 'C10A', index_score: 82, risk_level: 'Low', contributing_factors: { 'Participation': 85, 'Submission': 80 } },
    { student_id: 'S-6654', class_id: 'C10A', index_score: 58, risk_level: 'Medium', contributing_factors: { 'Attendance': 60, 'Interaction': 55 } },
    { student_id: 'S-1123', class_id: 'C10A', index_score: 91, risk_level: 'Low', contributing_factors: { 'Submission': 95, 'Timeliness': 90 } },
    { student_id: 'S-8876', class_id: 'C10A', index_score: 48, risk_level: 'Medium', contributing_factors: { 'Timeliness': 40, 'Interaction': 50 } },
];

const mockEngagementDataClassB: EngagementIndexData[] = [
    { student_id: 'S-2201', class_id: 'C10B', index_score: 92, risk_level: 'Low', contributing_factors: { 'Participation': 95, 'Resource Use': 90 } },
    { student_id: 'S-2204', class_id: 'C10B', index_score: 25, risk_level: 'High', contributing_factors: { 'Attendance': 10, 'Submission': 20 } },
    { student_id: 'S-2209', class_id: 'C10B', index_score: 78, risk_level: 'Low', contributing_factors: { 'Interaction': 85, 'Timeliness': 75 } },
    // More struggling students in this class
    { student_id: 'S-2215', class_id: 'C10B', index_score: 45, risk_level: 'High', contributing_factors: { 'Submission': 30, 'Participation': 40 } },
    { student_id: 'S-2233', class_id: 'C10B', index_score: 55, risk_level: 'Medium', contributing_factors: { 'Resource Use': 50, 'Interaction': 45 } },
    { student_id: 'S-2241', class_id: 'C10B', index_score: 88, risk_level: 'Low', contributing_factors: { 'Attendance': 95, 'Submission': 90 } },
    { student_id: 'S-2255', class_id: 'C10B', index_score: 32, risk_level: 'High', contributing_factors: { 'Attendance': 20, 'Timeliness': 15 } },
    { student_id: 'S-2288', class_id: 'C10B', index_score: 62, risk_level: 'Medium', contributing_factors: { 'Interaction': 55, 'Resource Use': 60 } },
];

const ClassEngagement = () => {
    const [selectedClassId, setSelectedClassId] = useState('123e4567-e89b-12d3-a456-426614174000');
    const [interventions, setInterventions] = useState<Record<string, boolean>>({});

    const handleIntervention = (student: EngagementIndexData) => {
        // Optimistic update
        setInterventions(prev => ({ ...prev, [student.student_id]: true }));

        // Add to local storage for the Interventions page
        const newIntervention = {
            name: `Student ${student.student_id.substring(2)}`, // Generate a name-like ID
            issue: `Identified as ${student.risk_level} Risk via Engagement Matrix`,
            risk: student.risk_level,
            lastActive: 'Just now',
            trend: 'Declining'
        };

        const existing = JSON.parse(localStorage.getItem('active_interventions') || '[]');
        localStorage.setItem('active_interventions', JSON.stringify([newIntervention, ...existing]));

        alert(`Intervention protocol initiated for Student ${student.student_id}. Added to Intervention Queue.`);
    };

    const { data: indices } = useQuery<EngagementIndexData[]>({
        queryKey: ['class-engagement', selectedClassId],
        queryFn: () => api.get(`/engagement/class/${selectedClassId}`).then(res => res.data)
    });

    const displayData = (indices && indices.length > 0)
        ? indices
        : (selectedClassId === '123e4567-e89b-12d3-a456-426614174000'
            ? mockEngagementDataClassA
            : mockEngagementDataClassB);

    const activeClassName = selectedClassId === '123e4567-e89b-12d3-a456-426614174000'
        ? 'Class 10-A Mathematics'
        : 'Class 10-B Science';

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [liveData, setLiveData] = useState<any[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
        }
    };

    const captureFrame = async () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context && !video.paused && !video.ended) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const formData = new FormData();
                        formData.append('file', blob);

                        try {
                            const res = await api.post('/engagement/analyze-cctv', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            });

                            setLiveData(prev => [...prev.slice(-19), {
                                time: new Date().toLocaleTimeString(),
                                score: res.data.engagement_score
                            }]);
                        } catch (err) {
                            console.error('Analysis error', err);
                        }
                    }
                }, 'image/jpeg');
            }
        }
    };

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isAnalyzing) {
            interval = setInterval(captureFrame, 2000); // Analyze every 2 seconds
        }
        return () => clearInterval(interval);
    }, [isAnalyzing]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Engagement Matrix</h2>
                    <p className="text-slate-400 mt-1">Inclusive tracking and risk assessment for {activeClassName}</p>
                </div>
                {/* ... existing select ... */}
            </div>

            {/* Video Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        CCTV Analysis
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-slate-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary-500/10 file:text-primary-400
                                hover:file:bg-primary-500/20"
                        />
                        {videoUrl && (
                            <div className="relative rounded-xl overflow-hidden bg-black/50 aspect-video">
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                    onPlay={() => setIsAnalyzing(true)}
                                    onPause={() => setIsAnalyzing(false)}
                                    onEnded={() => setIsAnalyzing(false)}
                                />
                                <canvas ref={canvasRef} className="hidden" />
                                {isAnalyzing && (
                                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500/80 text-white text-xs font-bold animate-pulse flex items-center gap-2">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                        LIVE ANALYSIS
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Real-time Engagement Score</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={liveData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                                />
                                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Existing Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Avg. Class Engagement', value: '74%', icon: Activity, color: 'text-primary-400' },
                    { label: 'Improving Students', value: '12', icon: TrendingUp, color: 'text-emerald-400' },
                    { label: 'Declining Students', value: '4', icon: TrendingDown, color: 'text-rose-400' },
                    { label: 'High Risk Alert', value: '2', icon: AlertTriangle, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <div key={i} className="glass p-6 group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-600" />
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Existing Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ... (rest of the component remains same, just ensuring correct nesting or replacing entire return if easier) */}
                <div className="lg:col-span-2 glass p-8 shadow-xl overflow-hidden">
                    <h3 className="text-lg font-bold text-white mb-6">Student Engagement Distribution</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="student_id" type="category" width={80} tick={{ fill: '#64748b', fontSize: 10 }} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#fff', marginBottom: '0.25rem' }}
                                />
                                <Bar dataKey="index_score" radius={[0, 4, 4, 0]} barSize={12}>
                                    {displayData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.index_score < 40 ? '#f87171' : entry.index_score < 70 ? '#fbbf24' : '#38bdf8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass p-8 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary-400" />
                        Calculation Insights
                    </h3>
                    <div className="space-y-6">
                        {/* ... existing code ... */}
                        <p className="text-xs text-slate-400 leading-relaxed">Engagement is calculated using a multi-factor weighted algorithm that minimizes bias.</p>

                        <div className="space-y-4">
                            {[
                                { factor: 'Attendance', weight: '25%' },
                                { factor: 'Interaction', weight: '20%' },
                                { factor: 'Submission', weight: '15%' },
                                { factor: 'Timeliness', weight: '15%' },
                                { factor: 'Resource Use', weight: '15%' },
                                { factor: 'Participation', weight: '10%' },
                            ].map((f, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[11px] mb-1">
                                        <span className="text-slate-300 font-medium">{f.factor}</span>
                                        <span className="text-slate-500">{f.weight}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-500/40" style={{ width: f.weight }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Existing At-Risk Queue - Keeping it at bottom */}
            <div className="glass p-8 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">At-Risk Intervention Queue</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayData.filter((idx) => (idx.risk_level === 'High' || idx.risk_level === 'Medium') && !interventions[idx.student_id]).map((idx) => (
                        <div key={idx.student_id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                            {/* ... existing card content ... */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                    <User className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Student ID: {idx.student_id.substring(0, 8)}...</p>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${idx.risk_level === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {idx.risk_level} Risk
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-xs text-slate-400 font-medium">Top Contributing Factors:</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(idx.contributing_factors).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 3).map(([factor, score]) => (
                                        <span key={factor} className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                                            {factor}: {Math.round(score)}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleIntervention(idx)}
                                    disabled={interventions[idx.student_id]}
                                    className={`w-full mt-4 py-2 text-xs font-bold rounded-lg transition-all border ${interventions[idx.student_id]
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20 cursor-default'
                                        : 'bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 border-primary-600/20'
                                        }`}
                                >
                                    {interventions[idx.student_id] ? 'Intervention Active' : 'Initiate Intervention'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClassEngagement;
