import { useState } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Shield,
    GraduationCap,
    Briefcase,
    Mail,
    CheckCircle,
    XCircle
} from 'lucide-react';

const mockUsers = [
    { id: 1, name: 'Arthur Admin', email: 'arthur@university.edu', role: 'admin', status: 'active', department: 'IT' },
    { id: 2, name: 'Dr. Sarah Teacher', email: 'sarah@university.edu', role: 'teacher', status: 'active', department: 'Science' },
    { id: 3, name: 'John Student', email: 'john@student.edu', role: 'student', status: 'active', department: 'Grade 10' },
    { id: 4, name: 'Jane Admin', email: 'jane@university.edu', role: 'admin', status: 'inactive', department: 'HR' },
    { id: 5, name: 'Prof. Miller', email: 'miller@university.edu', role: 'teacher', status: 'active', department: 'Math' },
];

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>;
            case 'teacher': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Teacher</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Student</span>;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary-500" />
                        User Management
                    </h2>
                    <p className="text-slate-400 mt-1">Manage system access and permissions</p>
                </div>
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Add User
                </button>
            </div>

            <div className="glass p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/50 outline-none text-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/50 outline-none text-slate-300"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admins</option>
                            <option value="teacher">Teachers</option>
                            <option value="student">Students</option>
                        </select>
                        <button className="p-2 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors">
                            <Filter className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-right py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white text-sm">{user.name}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-slate-400">
                                        {user.department}
                                    </td>
                                    <td className="py-4 px-4">
                                        {user.status === 'active' ? (
                                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                <XCircle className="w-3 h-3" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button className="p-1 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
