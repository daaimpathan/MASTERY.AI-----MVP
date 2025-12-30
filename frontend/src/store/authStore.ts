import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    institution_id?: string;
    profile_image?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    setAuthenticated: (status: boolean) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: user !== null }),
            setAuthenticated: (status) => set({ isAuthenticated: status }),
            logout: () => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                set({ user: null, isAuthenticated: false });
            },
            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),
        }),
        {
            name: 'auth-storage',
        }
    )
);
