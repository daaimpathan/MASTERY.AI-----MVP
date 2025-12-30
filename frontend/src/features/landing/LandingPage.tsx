import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Target, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useEffect, useState } from 'react';

import NeuralBackground from './NeuralBackground';

const LandingPage = () => {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: (e.clientY / window.innerHeight) * 2 - 1
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const features = [
        {
            icon: Target,
            title: 'Adaptive Mastery',
            description: 'AI-powered personalized learning paths that adapt to each student\'s pace'
        },
        {
            icon: TrendingUp,
            title: 'Real-Time Analytics',
            description: 'Track engagement, attendance, and progress with live dashboards'
        },
        {
            icon: Zap,
            title: 'Project-Based Learning',
            description: 'Hands-on projects with collaborative tools and peer evaluation'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <NeuralBackground />

                {/* Floating Orbs */}
                <div
                    className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"
                    style={{
                        top: '10%',
                        left: '10%',
                        transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
                    }}
                />
                <div
                    className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed"
                    style={{
                        bottom: '10%',
                        right: '10%',
                        transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`
                    }}
                />

                {/* 3D Grid */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            </div>

            {/* Navigation Header */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6">
                {/* Logo - Top Left */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">
                        MASTERY.AI
                    </span>
                </div>

                {/* Sign In Button - Top Right */}
                <Button
                    onClick={() => navigate('/login')}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-full px-6 py-2 transition-all hover:scale-105"
                >
                    Sign In
                </Button>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Side - Text Content */}
                    <div className="space-y-8">
                        {/* 3D Floating Badge */}
                        <div
                            className="inline-block animate-float"
                            style={{
                                transform: `perspective(1000px) rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`
                            }}
                        >
                            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 text-sm text-blue-300 font-medium">
                                🚀 Next-Generation Education Platform
                            </div>
                        </div>

                        {/* Main Heading with 3D Effect */}
                        <h1
                            className="text-6xl md:text-7xl font-black text-white leading-tight"
                            style={{
                                transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg)`,
                                textShadow: '0 10px 40px rgba(0,0,0,0.5)'
                            }}
                        >
                            <span className="relative inline-block">
                                <span className="opacity-0 select-none">Transform</span>
                                <span className="absolute top-0 left-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent border-r-4 border-purple-400 animate-type-gradient overflow-hidden whitespace-nowrap h-full">
                                    Transform
                                </span>
                            </span>
                            <br />
                            Education with AI
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
                            Adaptive mastery learning meets real-time engagement tracking.
                            Empower every student to reach their full potential.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-4 pt-8">
                            <Button
                                onClick={() => navigate('/login')}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-2xl shadow-2xl shadow-blue-500/50 transform hover:scale-105 transition-all flex items-center gap-2"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="outline"
                                className="border-2 border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white px-8 py-4 text-lg rounded-2xl transform hover:scale-105 transition-all"
                            >
                                Watch Demo
                            </Button>
                        </div>
                    </div>

                    {/* Right Side - 3D Feature Showcase */}
                    <div className="relative flex items-center justify-center h-[500px]">
                        <div
                            className="feature-showcase"
                            style={{
                                transform: `perspective(1200px) rotateX(${mousePosition.y * 8}deg) rotateY(${mousePosition.x * 12}deg)`
                            }}
                        >
                            {/* Central Orb */}
                            <div className="central-orb">
                                <div className="orb-inner">
                                    <Sparkles className="w-16 h-16 text-white" />
                                </div>
                                <div className="orb-ring ring-1"></div>
                                <div className="orb-ring ring-2"></div>
                                <div className="orb-ring ring-3"></div>
                            </div>

                            {/* Floating Feature Cards */}
                            <div className="floating-card card-1">
                                <div className="card-icon">
                                    <Target className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="card-title">Adaptive Learning</div>
                            </div>

                            <div className="floating-card card-2">
                                <div className="card-icon">
                                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div className="card-title">Real-Time Analytics</div>
                            </div>

                            <div className="floating-card card-3">
                                <div className="card-icon">
                                    <Zap className="w-8 h-8 text-purple-400" />
                                </div>
                                <div className="card-title">AI-Powered</div>
                            </div>

                            {/* Orbiting Particles */}
                            <div className="particle particle-1"></div>
                            <div className="particle particle-2"></div>
                            <div className="particle particle-3"></div>
                            <div className="particle particle-4"></div>
                            <div className="particle particle-5"></div>
                            <div className="particle particle-6"></div>
                        </div>
                    </div>
                </div>

                {/* 3D Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative"
                            style={{
                                transform: `perspective(1000px) rotateY(${mousePosition.x * (index - 1) * 5}deg)`,
                                transition: 'transform 0.3s ease-out'
                            }}
                        >
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all hover:scale-105 hover:border-white/20">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 rounded-3xl transition-all" />

                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-12 transition-transform">
                                        <feature.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Stats */}
            <div className="relative z-10 max-w-5xl mx-auto px-8 pb-20">
                <div className="grid grid-cols-3 gap-8 text-center">
                    {[
                        { value: '10K+', label: 'Active Students' },
                        { value: '95%', label: 'Engagement Rate' },
                        { value: '50+', label: 'Partner Schools' }
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className="transform hover:scale-110 transition-transform"
                            style={{
                                transform: `perspective(1000px) translateZ(${mousePosition.y * 20}px)`
                            }}
                        >
                            <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                {stat.value}
                            </div>
                            <div className="text-slate-400 mt-2 font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-30px); }
                }

                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                @keyframes typing {
                    from { width: 0 }
                    to { width: 100% }
                }

                @keyframes blink-caret {
                    from, to { border-color: transparent }
                    50% { border-color: rgba(192, 132, 252, 1) }
                }

                .animate-type-gradient {
                    background-size: 200% 200%;
                    animation: 
                        gradient 3s ease infinite,
                        typing 2s ease-out forwards,
                        blink-caret .75s step-end infinite;
                }

                @keyframes rotate-cube {
                    0% { transform: rotateX(0deg) rotateY(0deg); }
                    100% { transform: rotateX(360deg) rotateY(360deg); }
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                }

                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }

                .bg-grid-pattern {
                    background-image: 
                        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 50px 50px;
                }

                /* 3D Feature Showcase Styles */
                .feature-showcase {
                    width: 500px;
                    height: 500px;
                    position: relative;
                    transform-style: preserve-3d;
                    transition: transform 0.1s ease-out;
                }

                /* Central Orb */
                .central-orb {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) translateZ(0);
                    width: 120px;
                    height: 120px;
                }

                .orb-inner {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.4));
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 
                        0 0 60px rgba(59, 130, 246, 0.6),
                        0 0 100px rgba(147, 51, 234, 0.4),
                        inset 0 0 40px rgba(255, 255, 255, 0.2);
                    animation: pulse-glow 3s ease-in-out infinite;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                }

                @keyframes pulse-glow {
                    0%, 100% { 
                        transform: scale(1);
                        box-shadow: 
                            0 0 60px rgba(59, 130, 246, 0.6),
                            0 0 100px rgba(147, 51, 234, 0.4);
                    }
                    50% { 
                        transform: scale(1.05);
                        box-shadow: 
                            0 0 80px rgba(59, 130, 246, 0.8),
                            0 0 120px rgba(147, 51, 234, 0.6);
                    }
                }

                .orb-ring {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    animation: rotate-ring 20s linear infinite;
                }

                .orb-ring.ring-1 {
                    width: 160px;
                    height: 160px;
                    animation-duration: 15s;
                }

                .orb-ring.ring-2 {
                    width: 200px;
                    height: 200px;
                    animation-duration: 20s;
                    animation-direction: reverse;
                }

                .orb-ring.ring-3 {
                    width: 240px;
                    height: 240px;
                    animation-duration: 25s;
                }

                @keyframes rotate-ring {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }

                /* Floating Cards */
                .floating-card {
                    position: absolute;
                    width: 140px;
                    padding: 20px;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    transform-style: preserve-3d;
                    transition: all 0.3s ease;
                }

                .floating-card:hover {
                    transform: translateZ(30px) scale(1.05);
                    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
                    border-color: rgba(255, 255, 255, 0.4);
                }

                .card-icon {
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .card-title {
                    color: white;
                    font-size: 13px;
                    font-weight: 600;
                    text-align: center;
                    line-height: 1.3;
                }

                .card-1 {
                    top: 10%;
                    left: 50%;
                    transform: translateX(-50%) translateZ(80px);
                    animation: float-card-1 6s ease-in-out infinite;
                }

                .card-2 {
                    bottom: 15%;
                    left: 5%;
                    transform: translateZ(60px);
                    animation: float-card-2 7s ease-in-out infinite;
                }

                .card-3 {
                    bottom: 15%;
                    right: 5%;
                    transform: translateZ(60px);
                    animation: float-card-3 8s ease-in-out infinite;
                }

                @keyframes float-card-1 {
                    0%, 100% { transform: translateX(-50%) translateZ(80px) translateY(0); }
                    50% { transform: translateX(-50%) translateZ(80px) translateY(-20px); }
                }

                @keyframes float-card-2 {
                    0%, 100% { transform: translateZ(60px) translateY(0) translateX(0); }
                    50% { transform: translateZ(60px) translateY(-15px) translateX(-10px); }
                }

                @keyframes float-card-3 {
                    0%, 100% { transform: translateZ(60px) translateY(0) translateX(0); }
                    50% { transform: translateZ(60px) translateY(-15px) translateX(10px); }
                }

                /* Orbiting Particles */
                .particle {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8));
                    border-radius: 50%;
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
                }

                .particle-1 {
                    top: 20%;
                    left: 20%;
                    animation: orbit-1 12s linear infinite;
                }

                .particle-2 {
                    top: 30%;
                    right: 15%;
                    animation: orbit-2 15s linear infinite;
                }

                .particle-3 {
                    bottom: 25%;
                    left: 15%;
                    animation: orbit-3 18s linear infinite;
                }

                .particle-4 {
                    bottom: 20%;
                    right: 20%;
                    animation: orbit-4 14s linear infinite;
                }

                .particle-5 {
                    top: 50%;
                    left: 10%;
                    animation: orbit-5 16s linear infinite;
                }

                .particle-6 {
                    top: 50%;
                    right: 10%;
                    animation: orbit-6 13s linear infinite;
                }

                @keyframes orbit-1 {
                    from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
                    to { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
                }

                @keyframes orbit-2 {
                    from { transform: rotate(60deg) translateX(120px) rotate(-60deg); }
                    to { transform: rotate(420deg) translateX(120px) rotate(-420deg); }
                }

                @keyframes orbit-3 {
                    from { transform: rotate(120deg) translateX(110px) rotate(-120deg); }
                    to { transform: rotate(480deg) translateX(110px) rotate(-480deg); }
                }

                @keyframes orbit-4 {
                    from { transform: rotate(180deg) translateX(100px) rotate(-180deg); }
                    to { transform: rotate(540deg) translateX(100px) rotate(-540deg); }
                }

                @keyframes orbit-5 {
                    from { transform: rotate(240deg) translateX(130px) rotate(-240deg); }
                    to { transform: rotate(600deg) translateX(130px) rotate(-600deg); }
                }

                @keyframes orbit-6 {
                    from { transform: rotate(300deg) translateX(130px) rotate(-300deg); }
                    to { transform: rotate(660deg) translateX(130px) rotate(-660deg); }
                }

                @media (max-width: 1024px) {
                    .feature-showcase {
                        width: 350px;
                        height: 350px;
                        transform: scale(0.8);
                    }
                    
                    .floating-card {
                        width: 110px;
                        padding: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
