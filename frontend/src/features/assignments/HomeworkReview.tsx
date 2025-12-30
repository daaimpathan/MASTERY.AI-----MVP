import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Filter, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Submission {
    id: string;
    student_name: string;
    assignment_title: string;
    submitted_at: string;
    assignment_id: string;
    student_id: string;
}

// Mock pending homework submissions for display
const mockSubmissions: Submission[] = [
    {
        id: 'sub-1',
        student_name: 'Emma Johnson',
        assignment_title: 'Quadratic Equations Practice',
        submitted_at: '2024-12-20T14:30:00Z',
        assignment_id: 'assign-1',
        student_id: 'student-1'
    },
    {
        id: 'sub-2',
        student_name: 'Liam Williams',
        assignment_title: 'Essay: The Industrial Revolution',
        submitted_at: '2024-12-19T16:45:00Z',
        assignment_id: 'assign-2',
        student_id: 'student-2'
    },
    {
        id: 'sub-3',
        student_name: 'Sophia Martinez',
        assignment_title: 'Chemistry Lab Report: Titration',
        submitted_at: '2024-12-19T11:20:00Z',
        assignment_id: 'assign-3',
        student_id: 'student-3'
    },
    {
        id: 'sub-4',
        student_name: 'Noah Brown',
        assignment_title: 'Trigonometry Problem Set',
        submitted_at: '2024-12-18T09:15:00Z',
        assignment_id: 'assign-4',
        student_id: 'student-4'
    },
    {
        id: 'sub-5',
        student_name: 'Olivia Davis',
        assignment_title: 'Literature Analysis: Shakespeare',
        submitted_at: '2024-12-17T13:00:00Z',
        assignment_id: 'assign-5',
        student_id: 'student-5'
    }
];

const HomeworkReview = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const response = await fetch('http://localhost:8000/api/v1/assignments/pending', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Use mock data if API returns empty
                    const rawData = data.length > 0 ? data : mockSubmissions;
                    const graded = JSON.parse(localStorage.getItem('graded_submissions') || '[]');
                    setSubmissions(rawData.filter((s: Submission) => !graded.includes(s.id)));
                } else {
                    // Use mock data on API error
                    // Use mock data on API error
                    const allSubmissions = mockSubmissions;
                    const graded = JSON.parse(localStorage.getItem('graded_submissions') || '[]');
                    setSubmissions(allSubmissions.filter(s => !graded.includes(s.id)));
                }
            } catch (error) {
                console.error("Failed to fetch submissions", error);
                // Use mock data on fetch error
                const allSubmissions = mockSubmissions;
                const graded = JSON.parse(localStorage.getItem('graded_submissions') || '[]');
                setSubmissions(allSubmissions.filter(s => !graded.includes(s.id)));
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    const filteredSubmissions = submissions.filter(s =>
        s.student_name.toLowerCase().includes(filter.toLowerCase()) ||
        s.assignment_title.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Homework Review</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Review pending assignments and award mastery scores.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search student or assignment..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64"
                        />
                    </div>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <Card key={i} className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800" />
                    ))
                ) : filteredSubmissions.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-500/50" />
                        <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
                        <p>No pending submissions to review.</p>
                    </div>
                ) : (
                    filteredSubmissions.map((sub) => (
                        <Card key={sub.id} className="group hover:border-primary-500/50 transition-all cursor-pointer" onClick={() => navigate(`/dashboard/assignments/grade/${sub.id}`)}>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                        Submitted {new Date(sub.submitted_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{sub.student_name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1">{sub.assignment_title}</p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 text-amber-500">
                                        <Clock className="w-4 h-4" />
                                        Pending Review
                                    </span>
                                    <Button size="sm" variant="ghost" className="group-hover:translate-x-1 transition-transform">
                                        Grade Now
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default HomeworkReview;
