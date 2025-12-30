import { useAuthStore } from '../../store/authStore';
import TeacherSyllabus from './TeacherSyllabus';
import StudentSyllabus from './StudentSyllabus';

const SyllabusTracker = () => {
    const { user } = useAuthStore();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white gradient-text">
                    Syllabus Tracker
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {user?.role === 'teacher'
                        ? 'Manage course curriculum and track comprehensive progress'
                        : 'Track your course progress and upcoming topics'}
                </p>
            </div>

            {user?.role === 'teacher' ? <TeacherSyllabus /> : <StudentSyllabus />}
        </div>
    );
};

export default SyllabusTracker;
