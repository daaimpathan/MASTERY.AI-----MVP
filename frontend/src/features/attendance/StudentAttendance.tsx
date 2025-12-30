import { useState, useEffect, useCallback } from 'react';
import { Calendar, Check, X, Clock, TrendingUp, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';

interface DayAttendance {
    date: string;
    status: 'present' | 'absent' | 'late' | null;
    markedAt?: string;
}

// Simulated "database" using localStorage for real-time sync
const ATTENDANCE_STORAGE_KEY = 'mastery_attendance_data';

const StudentAttendance = () => {
    const { user } = useAuthStore();
    const [attendanceHistory, setAttendanceHistory] = useState<DayAttendance[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [todayStatus, setTodayStatus] = useState<'present' | 'absent' | 'late' | null>(null);

    // Get current student ID (use email as mock ID mapping)
    const getStudentId = () => {
        // Map logged-in user to mock student IDs
        const emailToId: Record<string, string> = {
            'student@mastery.ai': 'student-1',
            'emma.j@school.edu': 'student-1',
            'liam.w@school.edu': 'student-2',
            'sophia.m@school.edu': 'student-3',
        };
        return emailToId[user?.email || ''] || 'student-1';
    };

    // Load attendance from localStorage
    const loadAttendance = useCallback(() => {
        try {
            const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
            if (stored) {
                const allData = JSON.parse(stored);
                const studentId = getStudentId();

                // Build attendance history
                const history: DayAttendance[] = [];
                const today = new Date().toISOString().split('T')[0];

                Object.keys(allData).forEach(date => {
                    const dayData = allData[date];
                    if (dayData[studentId]) {
                        history.push({
                            date,
                            status: dayData[studentId].status,
                            markedAt: dayData[studentId].markedAt
                        });

                        // Check today's status
                        if (date === today) {
                            setTodayStatus(dayData[studentId].status);
                        }
                    }
                });

                // Sort by date descending
                history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setAttendanceHistory(history);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Failed to load attendance:', error);
        }
    }, [user]);

    // Initial load
    useEffect(() => {
        loadAttendance();
    }, [loadAttendance]);

    // Real-time sync - poll every 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            loadAttendance();
        }, 2000);
        return () => clearInterval(interval);
    }, [loadAttendance]);

    // Calculate stats
    const stats = {
        total: attendanceHistory.length,
        present: attendanceHistory.filter(a => a.status === 'present').length,
        absent: attendanceHistory.filter(a => a.status === 'absent').length,
        late: attendanceHistory.filter(a => a.status === 'late').length,
    };

    const attendanceRate = stats.total > 0
        ? Math.round(((stats.present + stats.late) / stats.total) * 100)
        : 0;

    // Generate calendar days for current month
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: { date: Date; status: 'present' | 'absent' | 'late' | null }[] = [];

        // Add empty days for padding
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push({ date: new Date(0), status: null });
        }

        // Add actual days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const record = attendanceHistory.find(a => a.date === dateStr);
            days.push({
                date,
                status: record?.status || null
            });
        }

        return days;
    };

    const calendarDays = generateCalendarDays();

    const getStatusColor = (status: string | null | undefined) => {
        switch (status) {
            case 'present': return 'bg-emerald-500 text-white';
            case 'absent': return 'bg-rose-500 text-white';
            case 'late': return 'bg-amber-500 text-white';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
        }
    };

    const getStatusIcon = (status: string | null | undefined) => {
        switch (status) {
            case 'present': return <Check className="w-5 h-5" />;
            case 'absent': return <X className="w-5 h-5" />;
            case 'late': return <Clock className="w-5 h-5" />;
            default: return null;
        }
    };

    const getStatusText = (status: string | null | undefined) => {
        switch (status) {
            case 'present': return 'Present';
            case 'absent': return 'Absent';
            case 'late': return 'Late';
            default: return 'Not Marked';
        }
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-primary-500" />
                        My Attendance
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track your attendance record in real-time.</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                    <span>Live updates</span>
                    {lastUpdated && (
                        <span className="text-xs text-slate-400">
                            (Last updated: {lastUpdated.toLocaleTimeString()})
                        </span>
                    )}
                </div>
            </div>

            {/* Today's Status - Prominent Display */}
            <Card className={`p-8 text-center border-2 ${todayStatus === 'present' ? 'bg-emerald-500/10 border-emerald-500/30' :
                todayStatus === 'absent' ? 'bg-rose-500/10 border-rose-500/30' :
                    todayStatus === 'late' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Today's Status</p>
                <div className="flex items-center justify-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${todayStatus === 'present' ? 'bg-emerald-500' :
                        todayStatus === 'absent' ? 'bg-rose-500' :
                            todayStatus === 'late' ? 'bg-amber-500' :
                                'bg-slate-300 dark:bg-slate-600'
                        }`}>
                        {todayStatus ? (
                            getStatusIcon(todayStatus)
                        ) : (
                            <Clock className="w-8 h-8 text-white" />
                        )}
                    </div>
                </div>
                <p className={`text-2xl font-bold mt-4 ${todayStatus === 'present' ? 'text-emerald-600 dark:text-emerald-400' :
                    todayStatus === 'absent' ? 'text-rose-600 dark:text-rose-400' :
                        todayStatus === 'late' ? 'text-amber-600 dark:text-amber-400' :
                            'text-slate-500'
                    }`}>
                    {getStatusText(todayStatus)}
                </p>
                <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="p-4 text-center bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/30">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary-500" />
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{attendanceRate}%</p>
                    <p className="text-sm text-primary-600/70 dark:text-primary-400/70">Attendance Rate</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                    <p className="text-sm text-slate-500">Days Recorded</p>
                </Card>
                <Card className="p-4 text-center bg-emerald-500/10 border-emerald-500/30">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.present}</p>
                    <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">Present</p>
                </Card>
                <Card className="p-4 text-center bg-amber-500/10 border-amber-500/30">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.late}</p>
                    <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Late</p>
                </Card>
                <Card className="p-4 text-center bg-rose-500/10 border-rose-500/30">
                    <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.absent}</p>
                    <p className="text-sm text-rose-600/70 dark:text-rose-400/70">Absent</p>
                </Card>
            </div>

            {/* Calendar View */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Attendance Calendar</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-medium text-slate-900 dark:text-white min-w-[150px] text-center">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                            {day}
                        </div>
                    ))}

                    {/* Calendar Days */}
                    {calendarDays.map((day, index) => (
                        <div
                            key={index}
                            className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all ${day.date.getTime() === 0
                                ? ''
                                : getStatusColor(day.status)
                                } ${day.date.toDateString() === new Date().toDateString()
                                    ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900'
                                    : ''
                                }`}
                        >
                            {day.date.getTime() !== 0 && (
                                <>
                                    <span className="text-sm font-medium">{day.date.getDate()}</span>
                                    {day.status && (
                                        <span className="text-[10px] mt-0.5 opacity-80">
                                            {day.status === 'present' ? 'P' : day.status === 'late' ? 'L' : 'A'}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-emerald-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-amber-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-rose-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Not Marked</span>
                    </div>
                </div>
            </Card>

            {/* Recent History */}
            <Card className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent History</h3>
                {attendanceHistory.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No attendance records yet.</p>
                        <p className="text-sm mt-1">Your attendance will appear here once marked by your teacher.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {attendanceHistory.slice(0, 10).map((record, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${record.status === 'present' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                    record.status === 'absent' ? 'bg-rose-500/5 border-rose-500/20' :
                                        record.status === 'late' ? 'bg-amber-500/5 border-amber-500/20' :
                                            'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.status === 'present' ? 'bg-emerald-500' :
                                        record.status === 'absent' ? 'bg-rose-500' :
                                            'bg-amber-500'
                                        }`}>
                                        {getStatusIcon(record.status)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {record.markedAt && `Marked at ${new Date(record.markedAt).toLocaleTimeString()}`}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                    record.status === 'absent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                    }`}>
                                    {getStatusText(record.status)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StudentAttendance;
