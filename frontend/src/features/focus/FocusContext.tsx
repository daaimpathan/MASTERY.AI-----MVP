import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { FocusAudioEngine } from './FocusAudio';
import api from '../../services/api';

interface FocusContextType {
    // ... existing interface ...
    // (rest of the file with fixes)
    isDeepDive: boolean;
    startDeepDive: (topic: string) => void;
    endDeepDive: () => void;
    sessionDuration: number; // in seconds
    darkEnergyMined: number;
    distractions: number;
    isDistracted: boolean;
    focusTopic: string;
    questions: string[];
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const useFocus = () => {
    const context = useContext(FocusContext);
    if (!context) {
        throw new Error('useFocus must be used within a FocusProvider');
    }
    return context;
};

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDeepDive, setIsDeepDive] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [distractions, setDistractions] = useState(0);
    const [isDistracted, setIsDistracted] = useState(false);
    const [focusTopic, setFocusTopic] = useState('');
    const [questions, setQuestions] = useState<string[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Audio Engine Ref
    const audioRef = useRef<FocusAudioEngine | null>(null);

    useEffect(() => {
        audioRef.current = new FocusAudioEngine();
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isDeepDive && startTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const duration = Math.floor((now - startTime) / 1000);
                setSessionDuration(duration);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isDeepDive, startTime]);

    // Distraction Listener
    useEffect(() => {
        if (!isDeepDive) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log("DISTRACTION: LEFT TAB");
                setIsDistracted(true);
                setDistractions(prev => prev + 1);

                // STRICT MODE: Restart Timer
                setStartTime(Date.now());
                setSessionDuration(0);

                audioRef.current?.playAlert();

            } else {
                console.log("RETURNED TO FOCUS");
                // Force Fullscreen check
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => { });
                }
                setTimeout(() => setIsDistracted(false), 2000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isDeepDive]);

    const startDeepDive = useCallback(async (topic: string) => {
        try {
            // Call API to start session
            const response = await api.post('/focus/start', {});
            const data = response.data;
            setSessionId(data.session_id);

            setFocusTopic(topic);
            setIsDeepDive(true);
            setStartTime(Date.now());
            setSessionDuration(0);
            setDistractions(0);
            setIsDistracted(false);
            setQuestions([]);

            // AI Questions
            api.post('/focus/questions', { topic })
                .then(res => {
                    if (res.data.questions) setQuestions(res.data.questions);
                })
                .catch(e => console.error("Question fetch failed", e));

            // Audio
            audioRef.current?.playWarp();
            audioRef.current?.playVoidLoop();

            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => console.log(err));
            }
        } catch (error) {
            console.error("Error starting focus session:", error);
            // Fallback
            setFocusTopic(topic);
            setIsDeepDive(true);
            setStartTime(Date.now());
            setSessionDuration(0);
            setDistractions(0);
            setIsDistracted(false);
        }
    }, []);

    const endDeepDive = useCallback(async () => {
        try {
            if (sessionId) {
                await api.post('/focus/end', {
                    session_id: sessionId,
                    distractions: distractions
                });
            }
        } catch (error) {
            console.error("Error ending focus session:", error);
        } finally {
            audioRef.current?.stopVoidLoop();
            setIsDeepDive(false);
            setStartTime(null);
            setSessionId(null);

            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log(err));
            }
        }
    }, [sessionId, distractions]);

    // 1 Minute = 1 Dark Energy (Simple formula)
    const darkEnergyMined = Math.max(0, Math.floor(sessionDuration / 60) - distractions);

    return (
        <FocusContext.Provider value={{
            isDeepDive,
            startDeepDive,
            endDeepDive,
            sessionDuration,
            darkEnergyMined,
            distractions,
            isDistracted,
            focusTopic,
            questions
        }}>
            {children}
        </FocusContext.Provider>
    );
};
