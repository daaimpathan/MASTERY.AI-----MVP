import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    Activity,
    Search,
    ArrowLeft,
    MessageSquare,
    UserPlus,
    MoreHorizontal,
    Trash2,
    X,
    Check,
    Info
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

const Interventions = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'high' | 'medium'>('all');

    // Modal states
    const [tutorModal, setTutorModal] = useState<{ open: boolean; studentName: string | null }>({ open: false, studentName: null });
    const [messageModal, setMessageModal] = useState<{ open: boolean; studentName: string | null }>({ open: false, studentName: null });
    const [messageText, setMessageText] = useState('');

    // Mock Tutors
    const tutors = [
        { id: 1, name: 'Mr. Anderson', subject: 'Calculus' },
        { id: 2, name: 'Ms. Roberts', subject: 'Algebra' },
        { id: 3, name: 'Dr. Emily Chen', subject: 'Physics' },
    ];

    // Initialize state from local storage or default
    const [students, setStudents] = useState(() => [
        ...JSON.parse(localStorage.getItem('active_interventions') || '[]'),
        { name: 'Alex Thompson', issue: 'Low engagement in Calculus', risk: 'High', lastActive: '2 hours ago', trend: 'Declining' },
        { name: 'Sarah Miller', issue: 'Struggling with Algebra concepts', risk: 'Medium', lastActive: '5 mins ago', trend: 'Stagnant' },
        { name: 'Jason Lee', issue: 'Inconsistent PBL participation', risk: 'High', lastActive: '1 day ago', trend: 'Declining' },
        { name: 'Emma Davis', issue: 'Missed last 3 adaptive sessions', risk: 'Medium', lastActive: '3 days ago', trend: 'Improving' },
    ]);

    const filteredStudents = students.filter((s: any) => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.issue.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || s.risk.toLowerCase() === filter;
        return matchesSearch && matchesFilter;
    });

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info'; visible: boolean }>({
        message: '',
        type: 'info',
        visible: false
    });

    const showToast = (message: string, type: 'success' | 'info' = 'info') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    const handleDelete = (studentName: string) => {
        if (window.confirm(`Are you sure you want to remove ${studentName} from the intervention queue?`)) {
            const updated = students.filter((s: any) => s.name !== studentName);
            setStudents(updated);

            // Update local storage if it was a custom added student
            const localInterventions = JSON.parse(localStorage.getItem('active_interventions') || '[]');
            const updatedLocal = localInterventions.filter((s: any) => s.name !== studentName);
            localStorage.setItem('active_interventions', JSON.stringify(updatedLocal));

            showToast(`${studentName} removed from queue`, 'info');
        }
    };

    const confirmTutor = (tutorName: string) => {
        setTutorModal({ open: false, studentName: null });
        showToast(`Matched ${tutorModal.studentName} with ${tutorName}`, 'success');
    };

    const sendMessage = () => {
        if (!messageText.trim()) return;
        setMessageModal({ open: false, studentName: null });
        setMessageText('');
        showToast(`Message sent to ${messageModal.studentName}`, 'success');
    };

    return (
        <div className="space-y-8 animate-fade-in relative min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* ... existing header content ... */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="rounded-full w-10 h-10 p-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Intervention Queue</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage at-risk students and active pedagogical interventions</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all w-64"
                        />
                    </div>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        {(['all', 'high', 'medium'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                    filter === f
                                        ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                        <Card key={student.name} className="group hover:border-primary-500/30 transition-all overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xl text-slate-400 dark:text-slate-500 group-hover:from-primary-500/10 group-hover:to-primary-500/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all">
                                        {student.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">{student.name}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${student.risk === 'High' ? 'text-rose-500 bg-rose-500/10' : 'text-amber-500 bg-amber-500/10'
                                                }`}>
                                                {student.risk} Risk
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{student.issue}</p>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                            <p className="text-xs text-slate-500">Last active {student.lastActive}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:border-l border-slate-100 dark:border-slate-800 md:pl-6">
                                    <div className="text-right mr-4 hidden lg:block">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                                        <p className={cn(
                                            "text-xs font-bold",
                                            student.trend === 'Declining' ? "text-rose-500" :
                                                student.trend === 'Improving' ? "text-emerald-500" : "text-amber-500"
                                        )}>
                                            {student.trend}
                                        </p>
                                    </div>
                                    <Button size="sm" variant="outline" className="gap-2 rounded-xl" onClick={() => setMessageModal({ open: true, studentName: student.name })}>
                                        <MessageSquare className="w-4 h-4" />
                                        Message
                                    </Button>
                                    <Button size="sm" className="gap-2 rounded-xl shadow-md shadow-primary-500/10" onClick={() => setTutorModal({ open: true, studentName: student.name })}>
                                        <UserPlus className="w-4 h-4" />
                                        Assign Tutor
                                    </Button>
                                    <Button size="sm" variant="ghost" className="w-10 h-10 p-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors" onClick={() => handleDelete(student.name)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="py-20 text-center glass rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Queue Empty</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">No students currently match your filters or search criteria.</p>
                        <Button variant="ghost" onClick={() => { setSearchQuery(''); setFilter('all'); }} className="mt-4">Reset all filters</Button>
                    </div>
                )}
            </div>

            {/* Tutor Modal */}
            {tutorModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assign Tutor</h3>
                            <button onClick={() => setTutorModal({ open: false, studentName: null })} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500">Select a qualified tutor for <span className="font-bold text-slate-700 dark:text-slate-300">{tutorModal.studentName}</span>.</p>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {tutors.map(tutor => (
                                <div key={tutor.id} onClick={() => confirmTutor(tutor.name)} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 group-hover:text-primary-500">
                                            {tutor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{tutor.name}</p>
                                            <p className="text-xs text-slate-500">{tutor.subject} Specialist</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">Select</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {messageModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send Message</h3>
                            <button onClick={() => setMessageModal({ open: false, studentName: null })} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500">Sending to: <span className="font-bold text-slate-700 dark:text-slate-300">{messageModal.studentName}</span></p>

                        <textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:outline-none resize-none transition-all"
                            autoFocus
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setMessageModal({ open: false, studentName: null })}>Cancel</Button>
                            <Button onClick={sendMessage} disabled={!messageText.trim()}>
                                <Check className="w-4 h-4 mr-2" /> Send Message
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.visible && (
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-up z-50 ${toast.type === 'success'
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-slate-900 text-white border-slate-700'
                    }`}>
                    <div className="p-1 bg-white/20 rounded-full">
                        {toast.type === 'success' ? <Activity className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>
                    <span className="font-medium text-sm">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default Interventions;
