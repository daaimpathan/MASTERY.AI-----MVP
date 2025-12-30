import { useAuthStore } from '../../store/authStore';
import TeacherResources from './TeacherResources';
import StudentResources from './StudentResources';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const Resources = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Please log in to access resources.</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="rounded-full w-10 h-10 p-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </div>

            {/* Role-based component rendering */}
            {user.role === 'teacher' ? <TeacherResources /> : <StudentResources />}
        </div>
    );
};

export default Resources;
