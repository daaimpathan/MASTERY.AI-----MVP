import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, Clock, Play } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

interface Assignment {
    id: string;
    title: string;
    description: string;
    due_date: string;
    status: 'assigned' | 'in_progress' | 'submitted' | 'graded';
    points_earned?: number;
    max_points?: number;
}

const StudentAssignments = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch('http://localhost:8000/api/v1/mastery/assignments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAssignments(data);
                }
            } catch (error) {
                console.error("Failed to load assignments", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchAssignments();
    }, [user]);

    const activeAssignments = assignments.filter(a => a.status === 'assigned' || a.status === 'in_progress');
    const completedAssignments = assignments.filter(a => a.status === 'submitted' || a.status === 'graded');

    if (isLoading) return (
        <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    return (
        <div className="p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Assignments</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track your progress and complete your tasks</p>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500" /> Active Tasks
                </h2>

                {activeAssignments.length === 0 ? (
                    <Card className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 border-dashed">
                        <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">No active assignments. Great job!</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeAssignments.map((assignment) => (
                            <Card key={assignment.id} className="p-6 hover:shadow-lg transition-all group border-l-4 border-l-primary-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                            {assignment.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300 rounded-full text-xs font-bold uppercase">
                                        {assignment.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 line-clamp-2">
                                    {assignment.description || "No description provided."}
                                </p>
                                <Button
                                    className="w-full"
                                    onClick={() => navigate(`/dashboard/student/assignments/${assignment.id}/solve`)}
                                >
                                    <Play className="w-4 h-4 mr-2" /> Start Assignment
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Completed
                </h2>

                {completedAssignments.length === 0 ? (
                    <p className="text-slate-500">No completed assignments yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {completedAssignments.map((assignment) => (
                            <Card key={assignment.id} className="p-6 opacity-75 hover:opacity-100 transition-opacity">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {assignment.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">Submitted: {new Date(assignment.due_date).toLocaleDateString()}</p>
                                    </div>
                                    {assignment.status === 'graded' ? (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-full text-xs font-bold">
                                            GRADED
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-full text-xs font-bold">
                                            SUBMITTED
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAssignments;
