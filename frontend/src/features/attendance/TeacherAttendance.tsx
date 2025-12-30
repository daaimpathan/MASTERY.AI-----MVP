import { useState, useEffect, useCallback } from 'react';
import { Users, Check, X, Clock, RefreshCw, Calendar, Save, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

interface Student {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AttendanceRecord {
    studentId: string;
    status: 'present' | 'absent' | 'late' | null;
    markedAt?: string;
}

// Mock students for the class
const mockStudents: Student[] = [
    { id: 'student-1', name: 'Emma Johnson', email: 'emma.j@school.edu' },
    { id: 'student-2', name: 'Liam Williams', email: 'liam.w@school.edu' },
    { id: 'student-3', name: 'Sophia Martinez', email: 'sophia.m@school.edu' },
    { id: 'student-4', name: 'Noah Brown', email: 'noah.b@school.edu' },
    { id: 'student-5', name: 'Olivia Davis', email: 'olivia.d@school.edu' },
    { id: 'student-6', name: 'James Wilson', email: 'james.w@school.edu' },
    { id: 'student-7', name: 'Ava Taylor', email: 'ava.t@school.edu' },
    { id: 'student-8', name: 'Benjamin Moore', email: 'ben.m@school.edu' },
    { id: 'student-9', name: 'Isabella Anderson', email: 'isabella.a@school.edu' },
    { id: 'student-10', name: 'Lucas Thomas', email: 'lucas.t@school.edu' },
];

// Simulated "database" using localStorage for real-time sync
const ATTENDANCE_STORAGE_KEY = 'mastery_attendance_data';

const TeacherAttendance = () => {
    const [students] = useState<Student[]>(mockStudents);
    const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Google Sheets Integration State
    const [sheetId, setSheetId] = useState(localStorage.getItem('mastery_sheet_id') || '');
    const [showSheetInput, setShowSheetInput] = useState(false);

    // Load attendance from "database" (localStorage)
    const loadAttendance = useCallback(() => {
        try {
            const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
            if (stored) {
                const allData = JSON.parse(stored);
                const todayData = allData[selectedDate] || {};
                setAttendance(todayData);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Failed to load attendance:', error);
        }
    }, [selectedDate]);

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

    // Mark attendance for a student
    const markAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
        const newAttendance = {
            ...attendance,
            [studentId]: {
                studentId,
                status,
                markedAt: new Date().toISOString()
            }
        };
        setAttendance(newAttendance);

        // Save immediately to localStorage for real-time sync
        saveToStorage(newAttendance);
    };

    // Save to localStorage
    const saveToStorage = (data: Record<string, AttendanceRecord>) => {
        try {
            const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
            const allData = stored ? JSON.parse(stored) : {};
            allData[selectedDate] = data;
            localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(allData));
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to save attendance:', error);
        }
    };

    // Mark all students at once
    const markAllAs = (status: 'present' | 'absent' | 'late') => {
        const newAttendance: Record<string, AttendanceRecord> = {};
        students.forEach(student => {
            newAttendance[student.id] = {
                studentId: student.id,
                status,
                markedAt: new Date().toISOString()
            };
        });
        setAttendance(newAttendance);
        saveToStorage(newAttendance);
    };

    // Final save with confirmation & Sync to Google Sheets
    const handleSaveAll = async () => {
        if (!sheetId) {
            setShowSheetInput(true);
            return;
        }

        setIsSaving(true);
        try {
            // Local Save
            saveToStorage(attendance);

            // Cloud Sync
            const records = Object.values(attendance).map(r => ({
                studentId: r.studentId,
                studentName: students.find(s => s.id === r.studentId)?.name || 'Unknown',
                status: r.status,
                markedAt: r.markedAt
            }));

            await api.syncAttendance({
                date: selectedDate,
                sheet_id: sheetId,
                records: records
            });

            setSaveSuccess(true);
            localStorage.setItem('mastery_sheet_id', sheetId); // Remember ID
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error: any) {
            console.error('Failed to save:', error);
            alert(error.response?.data?.detail || "Failed to sync to Google Sheets");
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate stats
    const stats = {
        total: students.length,
        present: Object.values(attendance).filter(a => a.status === 'present').length,
        absent: Object.values(attendance).filter(a => a.status === 'absent').length,
        late: Object.values(attendance).filter(a => a.status === 'late').length,
        unmarked: students.length - Object.values(attendance).filter(a => a.status).length
    };

    const getStatusColor = (status: string | null | undefined) => {
        switch (status) {
            case 'present': return 'bg-emerald-500';
            case 'absent': return 'bg-rose-500';
            case 'late': return 'bg-amber-500';
            default: return 'bg-slate-300 dark:bg-slate-600';
        }
    };

    const getStatusBg = (status: string | null | undefined) => {
        switch (status) {
            case 'present': return 'bg-emerald-500/10 border-emerald-500/30';
            case 'absent': return 'bg-rose-500/10 border-rose-500/30';
            case 'late': return 'bg-amber-500/10 border-amber-500/30';
            default: return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';
        }
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary-500" />
                        Attendance Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Mark student attendance for your class in real-time.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <RefreshCw className="w-4 h-4 animate-spin-slow" />
                        <span>Live sync</span>
                        {lastUpdated && (
                            <span className="text-xs text-slate-400">
                                ({lastUpdated.toLocaleTimeString()})
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                    <p className="text-sm text-slate-500">Total Students</p>
                </Card>
                <Card className="p-4 text-center bg-emerald-500/10 border-emerald-500/30">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.present}</p>
                    <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">Present</p>
                </Card>
                <Card className="p-4 text-center bg-rose-500/10 border-rose-500/30">
                    <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.absent}</p>
                    <p className="text-sm text-rose-600/70 dark:text-rose-400/70">Absent</p>
                </Card>
                <Card className="p-4 text-center bg-amber-500/10 border-amber-500/30">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.late}</p>
                    <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Late</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-slate-500">{stats.unmarked}</p>
                    <p className="text-sm text-slate-500">Unmarked</p>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Quick Actions:</span>
                        <Button size="sm" variant="outline" onClick={() => markAllAs('present')} className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10">
                            <Check className="w-4 h-4 mr-1" /> Mark All Present
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => markAllAs('absent')} className="border-rose-500/50 text-rose-600 hover:bg-rose-500/10">
                            <X className="w-4 h-4 mr-1" /> Mark All Absent
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {showSheetInput ? (
                            <div className="flex items-center gap-2 animate-fade-in">
                                <input
                                    value={sheetId}
                                    onChange={(e) => setSheetId(e.target.value)}
                                    placeholder="Enter Google Sheet ID"
                                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm w-48"
                                    autoFocus
                                />
                                <Button size="sm" variant="ghost" onClick={() => setShowSheetInput(false)}>Cancel</Button>
                            </div>
                        ) : (
                            <Button size="sm" variant="ghost" className="text-xs text-slate-400" onClick={() => setShowSheetInput(true)}>
                                {sheetId ? 'Sheet Connected' : 'Connect Sheet'}
                            </Button>
                        )}

                        <Button onClick={handleSaveAll} isLoading={isSaving} disabled={isSaving || saveSuccess}>
                            {saveSuccess ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Synced!
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> Save & Sync
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Success Message */}
            {saveSuccess && (
                <div className="fixed top-8 right-8 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in z-50">
                    <CheckCircle2 className="w-6 h-6" />
                    <div>
                        <p className="font-bold">Attendance Saved!</p>
                        <p className="text-sm opacity-90">All records have been updated.</p>
                    </div>
                </div>
            )}

            {/* Student List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => {
                    const record = attendance[student.id];
                    const status = record?.status;

                    return (
                        <Card
                            key={student.id}
                            className={`p-4 transition-all border-2 ${getStatusBg(status)}`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getStatusColor(status)}`}>
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{student.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{student.email}</p>
                                </div>
                            </div>

                            {/* Status Buttons */}
                            <div className="flex items-center gap-2 mt-4">
                                <button
                                    onClick={() => markAttendance(student.id, 'present')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${status === 'present'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                        : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                        }`}
                                >
                                    <Check className="w-4 h-4" /> Present
                                </button>
                                <button
                                    onClick={() => markAttendance(student.id, 'late')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${status === 'late'
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                        : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                                        }`}
                                >
                                    <Clock className="w-4 h-4" /> Late
                                </button>
                                <button
                                    onClick={() => markAttendance(student.id, 'absent')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${status === 'absent'
                                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                        : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                                        }`}
                                >
                                    <X className="w-4 h-4" /> Absent
                                </button>
                            </div>

                            {/* Marked Time */}
                            {record?.markedAt && (
                                <p className="text-xs text-slate-400 mt-2 text-center">
                                    Marked at {new Date(record.markedAt).toLocaleTimeString()}
                                </p>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default TeacherAttendance;
