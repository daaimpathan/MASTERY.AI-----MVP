import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

import { LogIn, Hash, Lock, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import NeuralBackground from '../landing/NeuralBackground';

const Login = () => {
    const [urn, setUrn] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    // const { theme, toggleTheme } = useThemeStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', {
                urn,
                password
            });

            const { user, access_token, refresh_token } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            setUser(user);

            navigate('/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    // Handle validation errors array
                    setError(detail.map((d: any) => d.msg).join(', '));
                } else {
                    setError(detail);
                }
            } else {
                setError('Authentication failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');

        try {
            // SIMULATION: Sending a demo token. 
            // In a real app, you would use 'useGoogleLogin' from '@react-oauth/google' to get this token first.
            const response = await api.post('/auth/google', {
                token: 'demo-token-123'
            });

            const { user, access_token, refresh_token } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            setUser(user);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Google Login error:', err);
            setError('Google Sign-In failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] overflow-hidden relative transition-colors duration-300">
            {/* Neural Background */}
            <NeuralBackground />

            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/10 dark:bg-accent-500/20 rounded-full blur-[100px] animate-pulse delay-700"></div>



            <div className="w-full max-w-md px-6 relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl transition-colors">
                        <Sparkles className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">MASTERY.AI</h1>
                    <p className="text-slate-500 dark:text-slate-400">Adaptive Mastery & Engagement Platform</p>
                </div>

                <div className="glass p-8 shadow-2xl bg-white/70 dark:bg-slate-900/50">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                        <LogIn className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                        Sign In
                    </h2>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5 ml-1">URN (University Registration Number)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Hash className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    value={urn}
                                    onChange={(e) => setUrn(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
                                    placeholder="e.g., 2021URN12345"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? (
                                        <Eye className="h-5 w-5" />
                                    ) : (
                                        <EyeOff className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign-In Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        type="button"
                        className="w-full py-3 px-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Sign in with Google</span>
                    </button>


                </div>
            </div>
        </div>
    );
};

export default Login;
