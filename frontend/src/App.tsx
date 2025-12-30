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

                        <Route path="projects" element={<ProtectedRoute roles={['teacher']}><ProjectList /></ProtectedRoute>} />
                        <Route path="projects/:id" element={<ProtectedRoute roles={['teacher']}><ProjectDetails /></ProtectedRoute>} />
                        <Route path="projects/:id/submissions" element={<ProtectedRoute roles={['teacher']}><ProjectSubmissions /></ProtectedRoute>} />
                        <Route path="projects/evaluate/:submissionId" element={<ProtectedRoute roles={['teacher']}><ProjectEvaluation /></ProtectedRoute>} />
                        <Route path="projects/create" element={<ProtectedRoute roles={['teacher']}><CreateProject /></ProtectedRoute>} />
                        <Route path="engagement" element={<ProtectedRoute roles={['teacher']}><ClassEngagement /></ProtectedRoute>} />
                        <Route path="mastery" element={<ProtectedRoute roles={['teacher']}><AdaptivePractice /></ProtectedRoute>} />
                        <Route path="interventions" element={<ProtectedRoute roles={['teacher']}><Interventions /></ProtectedRoute>} />
                        <Route path="resources" element={<ProtectedRoute roles={['teacher', 'student']}><Resources /></ProtectedRoute>} />
                        <Route path="quiz/join" element={<ProtectedRoute roles={['student']}><StudentJoin /></ProtectedRoute>} />
                        <Route path="quiz/host" element={<ProtectedRoute roles={['teacher']}><QuizLobby /></ProtectedRoute>} />
                        <Route path="quiz/session/:id" element={<ProtectedRoute roles={['teacher', 'student']}><ActiveQuizSession /></ProtectedRoute>} />
                        <Route path="assignments/create" element={<ProtectedRoute roles={['teacher']}><CreateAssignment /></ProtectedRoute>} />
                        <Route path="assignments/review" element={<ProtectedRoute roles={['teacher']}><HomeworkReview /></ProtectedRoute>} />
                        <Route path="assignments/grade/:submissionId" element={<ProtectedRoute roles={['teacher']}><GradingView /></ProtectedRoute>} />
                        <Route path="attendance" element={<ProtectedRoute roles={['teacher', 'admin']}><TeacherAttendance /></ProtectedRoute>} />
                        <Route path="my-attendance" element={<ProtectedRoute roles={['student']}><StudentAttendance /></ProtectedRoute>} />
                        <Route path="polls" element={<ProtectedRoute roles={['teacher']}><TeacherPoll /></ProtectedRoute>} />
                        <Route path="syllabus" element={<SyllabusTracker />} />
                        <Route path="profile" element={<ProfileSettings />} />
                        <Route path="student/assignments" element={<ProtectedRoute roles={['student']}><StudentAssignments /></ProtectedRoute>} />
                        <Route path="student/assignments/:id/solve" element={<ProtectedRoute roles={['student']}><SolveAssignment /></ProtectedRoute>} />
                        <Route path="student/interventions" element={<ProtectedRoute roles={['student']}><StudentInterventions /></ProtectedRoute>} />
                        <Route path="users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
                        <Route path="galaxy" element={<NeuralGalaxy />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
