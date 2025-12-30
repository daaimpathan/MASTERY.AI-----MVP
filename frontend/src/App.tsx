import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import LandingPage from './features/landing/LandingPage';
import Login from './features/auth/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import TeacherDashboard from './features/dashboard/TeacherDashboard';
import StudentDashboard from './features/dashboard/StudentDashboard';
import AdminDashboard from './features/dashboard/AdminDashboard';
import ProjectList from './features/projects/ProjectList';
import ProjectDetails from './features/projects/ProjectDetails';
import CreateProject from './features/projects/CreateProject';
import ProjectSubmissions from './features/projects/ProjectSubmissions';
import ProjectEvaluation from './features/projects/ProjectEvaluation';
import ClassEngagement from './features/engagement/ClassEngagement';
import AdaptivePractice from './features/mastery/AdaptivePractice';
import Interventions from './features/dashboard/Interventions';
import Resources from './features/resources/Resources';
import StudentJoin from './features/quiz/StudentJoin';
import QuizLobby from './features/quiz/QuizLobby';
import ActiveQuizSession from './features/quiz/ActiveQuizSession';
import CreateAssignment from './features/assignments/CreateAssignment';
import HomeworkReview from './features/assignments/HomeworkReview';
import GradingView from './features/assignments/GradingView';
import TeacherAttendance from './features/attendance/TeacherAttendance';
import StudentAttendance from './features/attendance/StudentAttendance';
import TeacherPoll from './features/poll/TeacherPoll';
import ProfileSettings from './features/auth/ProfileSettings';
import SyllabusTracker from './features/syllabus/SyllabusTracker';
import StudentAssignments from './features/assignments/StudentAssignments';
import SolveAssignment from './features/assignments/SolveAssignment';
import StudentInterventions from './features/dashboard/StudentInterventions';
import UserManagement from './features/users/UserManagement';
import NeuralGalaxy from './features/galaxy/NeuralGalaxy';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const ProtectedRoute = ({ children, roles }: { children: ReactNode, roles?: string[] }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

    return <>{children}</>;
};

import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';

function App() {
    const { user } = useAuthStore();
    const { theme } = useThemeStore();

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={
                            user?.role === 'teacher' ? <TeacherDashboard /> :
                                user?.role === 'student' ? <StudentDashboard /> :
                                    user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
                        } />

                        <Route path="projects" element={<ProjectList />} />
                        <Route path="projects/:id" element={<ProjectDetails />} />
                        <Route path="projects/:id/submissions" element={<ProjectSubmissions />} />
                        <Route path="projects/evaluate/:submissionId" element={<ProjectEvaluation />} />
                        <Route path="projects/create" element={<CreateProject />} />
                        <Route path="engagement" element={<ClassEngagement />} />
                        <Route path="mastery" element={<AdaptivePractice />} />
                        <Route path="interventions" element={<Interventions />} />
                        <Route path="resources" element={<Resources />} />
                        <Route path="quiz/join" element={<StudentJoin />} />
                        <Route path="quiz/host" element={<QuizLobby />} />
                        <Route path="quiz/session/:id" element={<ActiveQuizSession />} />
                        <Route path="assignments/create" element={<CreateAssignment />} />
                        <Route path="assignments/review" element={<HomeworkReview />} />
                        <Route path="assignments/grade/:submissionId" element={<GradingView />} />
                        <Route path="attendance" element={<TeacherAttendance />} />
                        <Route path="my-attendance" element={<StudentAttendance />} />
                        <Route path="my-attendance" element={<StudentAttendance />} />
                        <Route path="polls" element={<TeacherPoll />} />
                        <Route path="syllabus" element={<SyllabusTracker />} />
                        <Route path="profile" element={<ProfileSettings />} />
                        <Route path="student/assignments" element={<StudentAssignments />} />
                        <Route path="student/assignments/:id/solve" element={<SolveAssignment />} />
                        <Route path="student/interventions" element={<StudentInterventions />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="galaxy" element={<NeuralGalaxy />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
