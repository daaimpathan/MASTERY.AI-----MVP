import { useState, useEffect } from 'react';
import {
    Plus,
    FileText,
    Video,
    ExternalLink,
    Trash2,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    MessageSquare,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import AddResourceModal from './AddResourceModal';
import {
    fetchResources,
    deleteResource,
    fetchResourceRequests,
    approveRequest,
    rejectRequest,
} from '../../services/resourceService';
import type { Resource, ResourceRequest } from '../../types/resource';
import { ResourceType, RequestStatus } from '../../types/resource';

const TeacherResources = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    // Mock data for resource requests
    const [requests, setRequests] = useState<ResourceRequest[]>([]); // Added requests state variable
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            // Only set loading true if we don't have data yet to prevent flashing
            if (resources.length === 0) setLoading(true);
            setError(null);

            const [resourcesData, requestsData] = await Promise.all([
                fetchResources(),
                fetchResourceRequests(),
            ]);
            setResources(resourcesData);
            setRequests(requestsData);
        } catch (error: unknown) {
            const err = error as any;
            console.error('Error loading resources:', err);
            let errorMessage = 'Failed to load resources. Please try again.';

            if (err.response?.status === 401) {
                errorMessage = 'Session expired. Please log in again.';
            } else if (err.message === 'Network Error') {
                errorMessage = 'Unable to connect to server. Please check if the backend is running.';
            } else if (typeof err.response?.data?.detail === 'string') {
                errorMessage = err.response.data.detail;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDeleteResource = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;

        try {
            await deleteResource(id);
            setResources(prev => prev.filter((r) => r.id !== id));
            alert('Resource deleted successfully!');
        } catch (error: unknown) {
            const err = error as any;
            console.error('Error deleting resource:', err);
            if (err.response) {
                console.error('Server error data:', err.response.data);
            }

            // Extract detailed error message
            let errorMessage = 'Failed to delete resource. Please try again.';

            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.message) {
                errorMessage = err.message;
            }

            alert(errorMessage);
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        try {
            setActionLoading(requestId);
            const updatedRequest = await approveRequest(requestId, {});
            setRequests(requests.map((r) => (r.id === requestId ? updatedRequest : r)));
            // Reload resources to show the newly created resource
            const resourcesData = await fetchResources();
            setResources(resourcesData);
            alert('Request approved and resource created!');
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to approve request. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        const feedback = prompt('Optional: Provide feedback for rejection');

        try {
            setActionLoading(requestId);
            const updatedRequest = await rejectRequest(requestId, {
                teacher_response: feedback || undefined,
            });
            setRequests(requests.map((r) => (r.id === requestId ? updatedRequest : r)));
            alert('Request rejected.');
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request. Please try again.');
        } finally {
            setActionLoading(null);
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

    const pendingRequests = requests.filter((r) => r.status === RequestStatus.PENDING);
    const processedRequests = requests.filter((r) => r.status !== RequestStatus.PENDING);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-slate-500">Loading resources...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Connection Error</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">{error}</p>
                    <Button onClick={loadData}>
                        Try Again
                    </Button>
                </div>
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
                        Manage educational resources for your classes
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Resource
                </Button>
            </div>

            {/* Resources Grid */}
            <Card>
                <CardHeader className="border-b border-slate-100 dark:border-white/5">
                    <CardTitle>My Resources ({resources.length})</CardTitle>
                    <CardDescription>Resources you've added for your students</CardDescription>
                </CardHeader>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {resources.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No resources yet. Click "Add Resource" to get started.
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
                                            {resource.type}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {resource.file_path && (
                                        <a
                                            href={resource.file_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button size="sm" variant="ghost" className="rounded-xl w-9 h-9 p-0">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </a>
                                    )}
                                    {resource.url && (
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" variant="ghost" className="rounded-xl w-9 h-9 p-0">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </a>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-xl w-9 h-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                        onClick={() => handleDeleteResource(resource.id)}
                                        title="Delete Resource"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <Card>
                    <CardHeader className="border-b border-slate-100 dark:border-white/5">
                        <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
                        <CardDescription>Student resource requests awaiting your review</CardDescription>
                    </CardHeader>

                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {pendingRequests.map((request) => (
                            <div key={request.id} className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            {getResourceIcon(request.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {request.title}
                                            </h4>
                                            {request.description && (
                                                <p className="text-xs text-slate-500 mt-1">{request.description}</p>
                                            )}
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-2">
                                                Requested by: {request.student?.first_name} {request.student?.last_name} • {request.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                                            onClick={() => handleApproveRequest(request.id)}
                                            disabled={actionLoading === request.id}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => handleRejectRequest(request.id)}
                                            disabled={actionLoading === request.id}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Processed Requests */}
            {processedRequests.length > 0 && (
                <Card>
                    <CardHeader className="border-b border-slate-100 dark:border-white/5">
                        <CardTitle>Request History ({processedRequests.length})</CardTitle>
                        <CardDescription>Previously processed requests</CardDescription>
                    </CardHeader>

                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {processedRequests.map((request) => (
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
                                                <div className="mt-2 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                    <MessageSquare className="w-3 h-3 mt-0.5" />
                                                    <span>{request.teacher_response}</span>
                                                </div>
                                            )}
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-2">
                                                {request.student?.first_name} {request.student?.last_name} • {request.type}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Add Resource Modal */}
            <AddResourceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    loadData();
                }}
            />
        </div>
    );
};

export default TeacherResources;
