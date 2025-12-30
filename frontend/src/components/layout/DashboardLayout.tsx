import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

import { useState, useRef, useEffect } from 'react';
import {
    Activity,
    BookOpen,
    Calendar,
    CheckSquare,
    Gamepad2,
    LayoutDashboard,
    LogOut,
    MessageCircle,

    Target,
    Users
} from 'lucide-react';
import { cn } from '../../utils/cn';
import NotificationBell from './NotificationBell';
import StudentPollPopup from '../../features/poll/StudentPollPopup';
import DailyGameLauncher from '../../features/gamification/DailyGameLauncher';

const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    // const { theme, toggleTheme } = useTheme(); // Disabled Light Mode
    const navigate = useNavigate();
    const location = useLocation();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'teacher', 'student'] },
        { name: 'Projects', icon: BookOpen, path: '/dashboard/projects', roles: ['teacher'] },
        { name: 'Homework', icon: CheckSquare, path: '/dashboard/assignments/review', roles: ['teacher'] },
        { name: 'Attendance', icon: Calendar, path: '/dashboard/attendance', roles: ['teacher'] },
        { name: 'Polls', icon: MessageCircle, path: '/dashboard/polls', roles: ['teacher'] },
        { name: 'Live Quiz', icon: Gamepad2, path: '/dashboard/quiz/join', roles: ['student'] },
        { name: 'My Attendance', icon: Calendar, path: '/dashboard/my-attendance', roles: ['student'] },
        { name: 'Mastery', icon: Target, path: '/dashboard/mastery', roles: ['teacher'] },
        { name: 'Engagement', icon: Activity, path: '/dashboard/engagement', roles: ['teacher'] },
        { name: 'Interventions', icon: Activity, path: '/dashboard/interventions', roles: ['teacher'] },
        { name: 'Syllabus', icon: BookOpen, path: '/dashboard/syllabus', roles: ['teacher', 'student'] },
        { name: 'Users', icon: Users, path: '/dashboard/users', roles: ['admin'] },
    ];

    const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

    // Helper to get profile image URL
    const getProfileImageUrl = () => {
        if (user?.profile_image) {
            return `http://localhost:8000${user.profile_image}`;
        }
        return null;
    };

    const profileImageUrl = getProfileImageUrl();

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-transparent text-slate-900 dark:text-slate-200 overflow-hidden transition-colors duration-300">
            {/* Student Poll Popup - shows when teacher creates a poll */}
            {user?.role === 'student' && (
                <>
                    <StudentPollPopup />
                    <DailyGameLauncher />
                </>
            )}

            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-300">
                <div className="p-6">
                    <h1 className="text-2xl font-bold gradient-text pb-2">MASTERY.AI</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Adaptive Mastery</p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {filteredNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                                location.pathname === item.path
                                    ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 mr-3 transition-colors",
                                location.pathname === item.path ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                            )} />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 transition-colors duration-300 z-40 relative">
                    <div className="flex items-center gap-2">
                        {/* Left side content if any, or breadcrumbs */}
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            {navItems.find(item => location.pathname === item.path)?.name || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        <NotificationBell />

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 focus:outline-none group"
                            >
                                <div className="flex flex-col items-end mr-2 hidden sm:block">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {user?.first_name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                                        {user?.role}
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-primary-500/20 overflow-hidden border-2 border-white dark:border-slate-700 group-hover:scale-105 transition-transform duration-200 ring-2 ring-transparent group-hover:ring-primary-500/20">
                                    {profileImageUrl ? (
                                        <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
                                    )}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 transform transition-all duration-200 origin-top-right animate-in fade-in zoom-in-95">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 mb-1 bg-slate-50/50 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-lg">
                                                {profileImageUrl ? (
                                                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <span>{user?.first_name?.[0]}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.first_name} {user?.last_name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        to="/dashboard/profile"
                                        className="flex items-center px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Users className="w-4 h-4 mr-3" />
                                        Profile Settings
                                    </Link>



                                    <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50 dark:bg-transparent transition-colors duration-300">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
