import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import type { SyllabusTopic } from '../../services/syllabusService';
import {
    fetchClassTopics,
    createTopic,
    updateTopic,
    deleteTopic
} from '../../services/syllabusService';
import { useAuthStore } from '../../store/authStore';

const TeacherSyllabus = () => {
    // const { user } = useAuthStore();
    const [topics, setTopics] = useState<SyllabusTopic[]>([]);
    const [newTopic, setNewTopic] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [classId, setClassId] = useState<string | null>(null);
    const [className, setClassName] = useState<string>('');

    // Import extendedApi here to avoid circular dependency issues if any, or just use the imported one
    // We need to import extendedApi at the top level, but for now let's assume it's available or use the hook pattern if available.
    // Actually, I'll use the imported services.

    // Fetch classes and set the initial class
    useEffect(() => {
        const init = async () => {
            try {
                // We need to fetch classes first
                const classes = await import('../../services/api').then(m => m.default.getClasses());

                if (classes && classes.length > 0) {
                    const firstClass = classes[0];
                    setClassId(firstClass.id);
                    setClassName(firstClass.name);

                    // Fetch topics for this class
                    const classTopics = await fetchClassTopics(firstClass.id);
                    setTopics(classTopics);
                }
            } catch (error) {
                console.error('Error initializing syllabus:', error);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    const handleAddTopic = async () => {
        if (!newTopic.trim() || !classId) return;

        try {
            const added = await createTopic(classId, { title: newTopic, status: 'PENDING' });
            setTopics([...topics, added]);
            setNewTopic('');
        } catch (error) {
            console.error('Error adding topic:', error);
            alert('Failed to add topic');
        }
    };

    const toggleStatus = async (topic: SyllabusTopic) => {
        const newStatus: SyllabusTopic['status'] = topic.status === 'PENDING' ? 'COMPLETED' : 'PENDING';

        // Optimistic update
        const updatedTopics = topics.map(t =>
            t.id === topic.id ? { ...t, status: newStatus } : t
        );
        setTopics(updatedTopics);

        try {
            await updateTopic(topic.id, { status: newStatus });
        } catch (error) {
            console.error('Error updating topic:', error);
            // Revert on error
            setTopics(topics);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this topic?')) return;

        // Optimistic update
        const previousTopics = [...topics];
        setTopics(topics.filter(t => t.id !== id));

        try {
            await deleteTopic(id);
        } catch (error) {
            console.error('Error deleting topic:', error);
            // Revert
            setTopics(previousTopics);
            alert('Failed to delete topic');
        }
    };

    const completedCount = topics.filter(t => t.status === 'COMPLETED').length;
    const progress = topics.length > 0 ? (completedCount / topics.length) * 100 : 0;

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading syllabus...</div>;
    }

    if (!classId) {
        return (
            <Card>
                <div className="p-8 text-center text-slate-500">
                    No classes found. Please create a class first to manage its syllabus.
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Syllabus Manager</CardTitle>
                    <CardDescription>Target: {className}</CardDescription>
                </CardHeader>

                <div className="p-6 pt-0">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-slate-700 dark:text-slate-300">Total Progress</span>
                            <span className="font-bold text-primary-500">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Add Topic */}
                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="Enter new syllabus topic..."
                            className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                        />
                        <Button onClick={handleAddTopic}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                        </Button>
                    </div>

                    {/* Topics List */}
                    <div className="space-y-2">
                        {topics.map((topic) => (
                            <div
                                key={topic.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 group"
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleStatus(topic)}
                                        className={`transition-colors ${topic.status === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'}`}
                                    >
                                        {topic.status === 'COMPLETED' ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <Circle className="w-5 h-5" />
                                        )}
                                    </button>
                                    <span className={`font-medium ${topic.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {topic.title}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDelete(topic.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {topics.length === 0 && (
                            <div className="text-center text-slate-400 py-8 italic text-sm">
                                No topics added yet. Start adding your syllabus items above.
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TeacherSyllabus;
