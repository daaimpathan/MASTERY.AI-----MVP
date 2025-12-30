import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

interface Message {
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    message: string;
    timestamp: string;
}

interface ProjectForumProps {
    projectId: string;
    projectTitle: string;
    onClose: () => void;
}

const ProjectForum = ({ projectId, projectTitle, onClose }: ProjectForumProps) => {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const storageKey = `forum_${projectId}`;

    // Load messages from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            setMessages(JSON.parse(stored));
        } else {
            // Add some initial welcome messages
            const welcomeMessages: Message[] = [
                {
                    id: '1',
                    userId: 'system',
                    userName: 'MASTERY.AI',
                    userRole: 'system',
                    message: `Welcome to the ${projectTitle} discussion forum! Use this space to ask questions, share ideas, and collaborate with your team.`,
                    timestamp: new Date().toISOString(),
                }
            ];
            setMessages(welcomeMessages);
            localStorage.setItem(storageKey, JSON.stringify(welcomeMessages));
        }
    }, [projectId, storageKey, projectTitle]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !user) return;

        const message: Message = {
            id: Date.now().toString(),
            userId: user.id,
            userName: user.email,
            userRole: user.role,
            message: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...messages, message];
        setMessages(updatedMessages);
        localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const getMessageStyle = (role: string) => {
        if (role === 'system') return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
        if (role === 'TEACHER' || role === 'teacher') return 'bg-primary-500 text-white';
        return 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white';
    };

    const getRoleBadge = (role: string) => {
        if (role === 'system') return null;
        if (role === 'TEACHER' || role === 'teacher') return (
            <span className="text-xs font-bold uppercase tracking-wider text-primary-400">Teacher</span>
        );
        return (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Student</span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full h-[80vh] flex flex-col">
                {/* Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/10 rounded-xl">
                            <MessageSquare className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Project Forum</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{projectTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] ${msg.userId === user?.id ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {msg.userId === user?.id ? 'You' : msg.userName}
                                    </span>
                                    {getRoleBadge(msg.userRole)}
                                    <span className="text-xs text-slate-400">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                                <div className={`px-4 py-3 rounded-2xl ${getMessageStyle(msg.userRole)}`}>
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex gap-3">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message... (Press Enter to send)"
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            rows={2}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="h-auto px-6"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProjectForum;
