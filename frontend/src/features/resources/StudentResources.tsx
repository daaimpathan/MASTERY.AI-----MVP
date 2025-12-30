import { useState, useEffect } from 'react';
import {
    Plus,
    FileText,
    Video,
    ExternalLink,
    Download,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    MessageSquare,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    createResourceRequest,
} from '../../services/resourceService';
import type { Resource, ResourceRequest } from '../../types/resource';
import { ResourceType, RequestStatus } from '../../types/resource';
import api from '../../services/api';

const StudentResources = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [requests, setRequests] = useState<ResourceRequest[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRequestForm, setShowRequestForm] = useState(false);

    // Request form state
    const [requestTitle, setRequestTitle] = useState('');
    const [requestDescription, setRequestDescription] = useState('');
    const [requestType, setRequestType] = useState<ResourceType>(ResourceType.PDF);
    const [requestClassId, setRequestClassId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);

            const resourcesData = await api.get('/resources').then(r => r.data).catch(() => []);
            const requestsData = await api.get('/resources/requests').then(r => r.data).catch(() => []);
            // Safely try to fetch classes, default to empty array on fail
            const classesData = await api.get('/classes').then(r => r.data).catch(() => []);

            setResources(resourcesData);
            setRequests(requestsData);

            // Always fallback to dummy classes if no classes returned (student view or error)
            setClasses(classesData || []);
            if (classesData && classesData.length > 0) {
                setRequestClassId(classesData[0].id);
            } else {
                setRequestClassId('');
            }
        } catch (error) {
            console.error('Error loading resources:', error);
            // Even if everything strictly fails, show dummy classes
            setClasses([]);
            setRequestClassId('');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!requestTitle || !requestClassId) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);

            // Real backend call for real classes
            await createResourceRequest({
                title: requestTitle,
                description: requestDescription || undefined,
                type: requestType,
                class_id: requestClassId,
            });
            alert('Resource request submitted successfully!');
            loadData(); // Reload real data

            setRequestTitle('');
            setRequestDescription('');
            setRequestType(ResourceType.PDF);
            setShowRequestForm(false);

        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getResourceIcon = (type: ResourceType) => {
        switch (type) {
            case ResourceType.PDF:
                return <FileText className="w-5 h-5 text-blue-500" />;
            case ResourceType.VIDEO:
                return <Video className="w-5 h-5 text-purple-500" />;
            case ResourceType.LINK:
                return <ExternalLink className="w-5 h-5 text-emerald-500" />;
            case ResourceType.NOTES:
                return <FileText className="w-5 h-5 text-amber-500" />;
        }
    };

    const getStatusBadge = (status: RequestStatus) => {
        switch (status) {
            case RequestStatus.PENDING:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                );
            case RequestStatus.APPROVED:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                    </span>
                );
            case RequestStatus.REJECTED:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="w-3 h-3" />
                        Rejected
                    </span>
                );
        }
    };

    const handleViewResource = (resource: Resource) => {
        if (resource.type === ResourceType.NOTES && resource.content) {
            alert(resource.content);
        } else if (resource.url) {
            window.open(resource.url, '_blank');
        } else if (resource.file_path) {
            window.open(resource.file_path, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Loading resources...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Resource Library
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Access educational resources from your teachers
                    </p>
                </div>
                <Button
                    onClick={() => setShowRequestForm(!showRequestForm)}
                    className="bg-primary-500 hover:bg-primary-600 text-white gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Request Resource
                </Button>
            </div>

            {/* Request Form */}
            {showRequestForm && (
                <Card className="border-primary-200 dark:border-primary-800">
                    <CardHeader className="border-b border-slate-100 dark:border-white/5">
                        <CardTitle>Request a Resource</CardTitle>
                        <CardDescription>
                            Ask your teacher to add a specific resource to the library
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={requestTitle}
                                onChange={(e) => setRequestTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="What resource do you need?"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                Description
                            </label>
                            <textarea
                                value={requestDescription}
                                onChange={(e) => setRequestDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                placeholder="Provide more details about what you need..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                Class *
                            </label>
                            <select
                                value={requestClassId}
                                onChange={(e) => setRequestClassId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            >
                                {classes.length === 0 ? (
                                    <option value="" disabled>No classes available</option>
                                ) : (
                                    <>
                                        {classes.map((cls) => (
                                            <option key={cls.id} value={cls.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                                {cls.name}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                Type *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { type: ResourceType.PDF, label: 'PDF' },
                                    { type: ResourceType.VIDEO, label: 'Video' },
                                    { type: ResourceType.LINK, label: 'Link' },
                                    { type: ResourceType.NOTES, label: 'Notes' },
                                ].map(({ type, label }) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setRequestType(type)}
                                        className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${requestType === type
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowRequestForm(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Available Resources */}
            <Card>
                <CardHeader className="border-b border-slate-100 dark:border-white/5">
                    <CardTitle>Available Resources ({resources.length})</CardTitle>
                    <CardDescription>Resources shared by your teachers</CardDescription>
                </CardHeader>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {resources.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No resources available yet. Check back later or request a resource.
                        </div>
                    ) : (
                        resources.map((resource) => (
                            <div
                                key={resource.id}
                                className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        {getResourceIcon(resource.type)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {resource.title}
                                        </h4>
                                        {resource.description && (
                                            <p className="text-xs text-slate-500 mt-0.5">{resource.description}</p>
                                        )}
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                                            {resource.type} • By {resource.teacher?.first_name}{' '}
                                            {resource.teacher?.last_name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-xl w-9 h-9 p-0"
                                        onClick={() => handleViewResource(resource)}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    {resource.file_path && (
                                        <a
                                            href={resource.file_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                        >
                                            <Button size="sm" variant="ghost" className="rounded-xl w-9 h-9 p-0">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* My Requests */}
            {requests.length > 0 && (
                <Card>
                    <CardHeader className="border-b border-slate-100 dark:border-white/5">
                        <CardTitle>My Requests ({requests.length})</CardTitle>
                        <CardDescription>Your resource requests and their status</CardDescription>
                    </CardHeader>

                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {requests.map((request) => (
                            <div key={request.id} className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            {getResourceIcon(request.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {request.title}
                                                </h4>
                                                {getStatusBadge(request.status)}
                                            </div>
                                            {request.description && (
                                                <p className="text-xs text-slate-500 mt-1">{request.description}</p>
                                            )}
                                            {request.teacher_response && (
                                                <div className="mt-2 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                                    <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <span className="font-bold">Teacher Response:</span>{' '}
                                                        {request.teacher_response}
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-2">
                                                {request.type} • Requested on{' '}
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default StudentResources;
