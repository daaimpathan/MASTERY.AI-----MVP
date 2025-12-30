import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Camera, User, Save, Loader2 } from 'lucide-react';
import api from '../../services/api';

const ProfileSettings = () => {
    const { user, updateUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(user?.profile_image ? `http://localhost:8000${user.profile_image}` : null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const data = new FormData();
            data.append('first_name', formData.first_name);
            data.append('last_name', formData.last_name);

            if (fileInputRef.current?.files?.[0]) {
                data.append('profile_image', fileInputRef.current.files[0]);
            }

            const response = await api.put('/auth/me', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            updateUser(response.data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Update preview if it came from server
            if (response.data.profile_image) {
                setPreviewImage(`http://localhost:8000${response.data.profile_image}`);
            }

        } catch (error: any) {
            console.error('Update failed:', error);
            const errorMsg = error.response?.data?.detail || 'Failed to update profile. Please try again.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h2>
                <p className="text-slate-500 dark:text-slate-400">Update your personal information and profile picture</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            {previewImage ? (
                                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-slate-400" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>
                    <p className="text-sm text-slate-500">Click the camera icon to upload a new photo</p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">First Name</label>
                        <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Last Name</label>
                        <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email Address</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500">Email address cannot be changed</p>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`p-4 rounded-xl text-sm ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;
