import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
    Save,
    ChevronLeft,
    Type,
    Calendar,
    School,
    BookOpen,
    Sparkles,
    Upload,
    Mail
} from 'lucide-react';
import { Card, CardTitle, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Assignment Payload Interface
interface AssignmentPayload {
    title: string;
    description: string;
    class_id: string;
    assignment_type: 'standard' | 'quiz' | 'practice';
    due_date: string;
}

const CreateAssignment = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [classId, setClassId] = useState('');
    const [type, setType] = useState<'standard' | 'quiz' | 'practice'>('standard');
    const [dueDate, setDueDate] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch classes for dropdown
    const { data: classes } = useQuery({
        queryKey: ['classes'],
        queryFn: () => api.getClasses()
    });

    const mutation = useMutation({
        mutationFn: (newAssignment: AssignmentPayload) => api.createAssignment(newAssignment),
        onSuccess: () => {
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!classId && classes && classes.length > 0) {
            // Default to first class if not selected (or force user to select)
            // For now let's assume user must select. Or auto-select first.
        }

        mutation.mutate({
            title,
            description,
            class_id: classId || (classes && classes[0]?.id),
            assignment_type: type,
            due_date: new Date(dueDate).toISOString(),
        });
    };

    // Auto-select first class if available
    useEffect(() => {
        if (classes && classes.length > 0 && !classId) {
            setClassId(classes[0].id);
        }
    }, [classes]);

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="rounded-full bg-slate-800 p-2">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create Assignment</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Design a new learning task for your students</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary-500" />
                            Assignment Details
                        </CardTitle>
                    </CardHeader>

                    <div className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Type className="w-3 h-3" />
                                Title
                            </label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                type="text"
                                placeholder="e.g. Calculus Chapter 1 Review"
                                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                            />
                        </div>

                        {/* Class, Email, and Type Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <School className="w-3 h-3" />
                                    Assign To Class
                                </label>
                                <select
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                >
                                    {classes?.map((cls: any) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                    {!classes?.length && <option disabled>No classes found</option>}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Mail className="w-3 h-3" />
                                    Class Mailing List
                                </label>
                                <input
                                    readOnly
                                    value={classId ? `class.${classId.substring(0, 6)}@mastery.school` : 'select-class@mastery.school'}
                                    className="w-full bg-slate-200 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-sm cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Type className="w-3 h-3" />
                                    Type
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                >
                                    <option value="standard">Standard Assignment</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="practice">Practice</option>
                                </select>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    Due Date & Time
                                </label>
                                <input
                                    required
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    type="datetime-local"
                                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Upload className="w-3 h-3" />
                                Assignment Material (PDF/IMG)
                            </label>
                            <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            alert(`File selected: ${e.target.files[0].name}`);
                                            // In a real app, we'd setFile(e.target.files[0]) here
                                        }
                                    }}
                                />
                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to upload or drag and drop</p>
                                <p className="text-xs text-slate-400 mt-1">PDF, DOCX, PNG (Max 10MB)</p>
                            </div>
                        </div>

                        {/* Description with AI */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-500 uppercase">Instructions</label>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!title) {
                                            alert("Please enter a title first.");
                                            return;
                                        }
                                        setDescription("Generating... please wait...");
                                        try {
                                            const res = await api.post('/assignments/ai-generate', { title });
                                            setDescription(res.data.content);
                                        } catch (err) {
                                            console.error(err);
                                            setDescription("Failed to generate content.");
                                        }
                                    }}
                                    className="text-xs font-bold text-indigo-500 flex items-center gap-1 hover:text-indigo-400 transition-colors"
                                >
                                    <Sparkles className="w-3 h-3" />
                                    Generate with AI
                                </button>
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                placeholder="Detailed instructions for students..."
                                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all font-medium resize-none"
                            ></textarea>
                        </div>
                    </div>
                </Card>

                <Button
                    type="submit"
                    isLoading={mutation.isPending}
                    className="w-full h-14 rounded-xl gap-2 font-bold uppercase tracking-wider shadow-lg shadow-primary-500/20"
                >
                    <Save className="w-5 h-5" />
                    Publish Assignment
                </Button>
            </form>

            {/* Success Popup */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-emerald-500/20 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center transform scale-100 animate-scale-in">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Assignment Published!</h3>
                        <p className="text-slate-500 dark:text-slate-400">Students will be notified immediately.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateAssignment;
