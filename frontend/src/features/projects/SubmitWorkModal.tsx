import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { X, Upload, Link as LinkIcon, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface SubmitWorkModalProps {
    projectId: string;
    onClose: () => void;
}

const SubmitWorkModal = ({ projectId, onClose }: SubmitWorkModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [files, setFiles] = useState<FileList | null>(null);
    const queryClient = useQueryClient();

    const submitMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await api.post(`/projects/${projectId}/submit`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            alert('Submission successful!');
            onClose();
        },
        onError: (error: any) => {
            alert(`Submission failed: ${error.response?.data?.detail || error.message}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            alert('Please fill in title and description');
            return;
        }

        const formData = new FormData();
        formData.append('project_id', projectId);
        formData.append('title', title);
        formData.append('description', description);
        if (link) formData.append('link', link);

        if (files) {
            Array.from(files).forEach((file) => {
                formData.append('files', file);
            });
        }

        submitMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Submit Work Evidence</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Submission Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="e.g., Final Project Submission"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            placeholder="Describe your work, approach, and key findings..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <LinkIcon className="w-4 h-4 inline mr-2" />
                            Project Link (Optional)
                        </label>
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="https://github.com/yourproject or https://drive.google.com/..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Upload className="w-4 h-4 inline mr-2" />
                            Upload Files (Optional)
                        </label>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-primary-500 transition-colors">
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setFiles(e.target.files)}
                                className="hidden"
                                id="file-upload"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.mp4,.mov"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <FileText className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    PDF, DOC, PPT, ZIP, Images, Videos (Max 50MB each)
                                </p>
                            </label>
                            {files && files.length > 0 && (
                                <div className="mt-4 text-left">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Selected files:
                                    </p>
                                    <ul className="space-y-1">
                                        {Array.from(files).map((file, i) => (
                                            <li key={i} className="text-sm text-slate-600 dark:text-slate-400">
                                                • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={submitMutation.isPending}
                        >
                            {submitMutation.isPending ? 'Submitting...' : 'Submit Work'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitWorkModal;
