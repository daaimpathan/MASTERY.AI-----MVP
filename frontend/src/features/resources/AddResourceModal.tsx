import { useState, useEffect, useRef } from 'react';
import { X, Upload, Link as LinkIcon, FileText, Video } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { createResource } from '../../services/resourceService';
import { ResourceType } from '../../types/resource';
import api from '../../services/api';

interface AddResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddResourceModal = ({ isOpen, onClose, onSuccess }: AddResourceModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ResourceType>(ResourceType.PDF);
    const [url, setUrl] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [classId, setClassId] = useState('');
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadClasses();
        }
    }, [isOpen]);

    const loadClasses = async () => {
        try {
            console.log('Loading classes...');
            const response = await api.get('/classes');
            console.log('Classes response:', response.data);
            setClasses(response.data);
            if (response.data.length > 0) {
                setClassId(response.data[0].id);
                console.log('Default class set:', response.data[0].name);
            } else {
                console.warn('No classes found');
            }
        } catch (error) {
            console.error('Error loading classes:', error);
            alert(`DEBUG ERROR: Failed to load classes. ${error}`);
            setClasses([]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !classId) {
            alert('Please fill in all required fields');
            return;
        }

        if (type === ResourceType.PDF && !file) {
            alert('Please upload a PDF file');
            return;
        }

        if ((type === ResourceType.VIDEO || type === ResourceType.LINK) && !url) {
            alert('Please provide a URL');
            return;
        }

        if (type === ResourceType.NOTES && !content) {
            alert('Please provide content for the notes');
            return;
        }

        try {
            setLoading(true);
            await createResource({
                title,
                description,
                type,
                class_id: classId,
                url: url || undefined,
                content: content || undefined,
                file: file || undefined,
            });

            alert('Resource created successfully!');
            resetForm();
            onSuccess();
        } catch (error) {
            console.error('Error creating resource:', error);
            alert('Failed to create resource. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setType(ResourceType.PDF);
        setUrl('');
        setContent('');
        setFile(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Add Resource</h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter resource title"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            placeholder="Enter resource description"
                            rows={3}
                        />
                    </div>

                    {/* Class */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                            Class *
                        </label>
                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                            style={{ colorScheme: 'light' }}
                        >
                            {classes.length === 0 ? (
                                <option value="" disabled>No classes available</option>
                            ) : (
                                <>
                                    <option value="">Select a class</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id} className="text-slate-900">
                                            {cls.name}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                        {classes.length === 0 && (
                            <p className="text-xs text-red-500 mt-1 font-bold">
                                * No classes found. Please create a class first.
                            </p>
                        )}
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                            Resource Type *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { type: ResourceType.PDF, icon: FileText, label: 'PDF', color: 'blue' },
                                { type: ResourceType.VIDEO, icon: Video, label: 'Video', color: 'purple' },
                                { type: ResourceType.LINK, icon: LinkIcon, label: 'Link', color: 'emerald' },
                                { type: ResourceType.NOTES, icon: FileText, label: 'Notes', color: 'amber' },
                            ].map(({ type: resourceType, icon: Icon, label, color }) => (
                                <button
                                    key={resourceType}
                                    type="button"
                                    onClick={() => setType(resourceType)}
                                    className={`p-4 rounded-xl border-2 transition-all ${type === resourceType
                                        ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20`
                                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300'
                                        }`}
                                >
                                    <Icon className={`w-6 h-6 mx-auto mb-2 text-${color}-500`} />
                                    <span className="text-sm font-bold">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conditional Fields */}
                    {type === ResourceType.PDF && (
                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                Upload PDF *
                            </label>
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-slate-200 dark:border-white/10'
                                    }`}
                            >
                                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                {file ? (
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                                            Drag and drop your PDF here
                                        </p>
                                        <p className="text-xs text-slate-500">or</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                    ref={fileInputRef}
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Browse Files
                                </Button>
                            </div>
                        </div>
                    )}

                    {(type === ResourceType.VIDEO || type === ResourceType.LINK) && (
                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                URL *
                            </label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder={
                                    type === ResourceType.VIDEO
                                        ? 'https://youtube.com/watch?v=...'
                                        : 'https://example.com'
                                }
                                required
                            />
                        </div>
                    )}

                    {type === ResourceType.NOTES && (
                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                Content *
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                placeholder="Enter your notes content here..."
                                rows={8}
                                required
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                        >
                            {loading ? 'Creating...' : 'Create Resource'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddResourceModal;
