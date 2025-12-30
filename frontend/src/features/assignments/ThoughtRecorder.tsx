import { useEffect, useRef, useState, useCallback } from 'react';
import { Activity } from 'lucide-react';
import api from '../../services/api';

interface KeystrokeEvent {
    timestamp: string;
    type: 'insert' | 'delete' | 'paste' | 'cursor_move';
    content?: string;
    position?: number;
    length?: number;
    line?: number;
    column?: number;
}

interface ThoughtRecorderProps {
    studentAssignmentId: string;
    onRecordingStart?: (proofId: string) => void;
    onRecordingStop?: () => void;
    children: React.ReactNode;
}

const ThoughtRecorder = ({ studentAssignmentId, onRecordingStart, onRecordingStop, children }: ThoughtRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [thoughtProofId, setThoughtProofId] = useState<string | null>(null);
    const [eventBuffer, setEventBuffer] = useState<KeystrokeEvent[]>([]);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const lastContentRef = useRef<string>('');
    const batchIntervalRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const response = await api.post(`/thought-proof/start/${studentAssignmentId}`);
            const proofId = response.data.id;

            setThoughtProofId(proofId);
            setIsRecording(true);
            onRecordingStart?.(proofId);

            // Start batch upload interval (every 10 seconds)
            batchIntervalRef.current = setInterval(() => {
                uploadBatch();
            }, 10000);
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (batchIntervalRef.current) {
            clearInterval(batchIntervalRef.current);
        }
        uploadBatch(); // Upload remaining events
        onRecordingStop?.();
    };

    const uploadBatch = useCallback(async () => {
        if (eventBuffer.length === 0 || !thoughtProofId) return;

        try {
            await api.post(`/thought-proof/record/${thoughtProofId}`, {
                events: eventBuffer
            });
            setEventBuffer([]);
        } catch (error) {
            console.error('Failed to upload events:', error);
        }
    }, [eventBuffer, thoughtProofId]);

    const recordEvent = useCallback((event: KeystrokeEvent) => {
        setEventBuffer(prev => [...prev, event]);
    }, []);

    const handleInput = useCallback((e: Event) => {
        if (!isRecording) return;

        const target = e.target as HTMLTextAreaElement;
        const currentContent = target.value;
        const previousContent = lastContentRef.current;

        // Detect change type
        if (currentContent.length > previousContent.length) {
            // Insertion
            const insertedText = currentContent.slice(previousContent.length);
            recordEvent({
                timestamp: new Date().toISOString(),
                type: 'insert',
                content: insertedText,
                position: previousContent.length,
                length: insertedText.length
            });
        } else if (currentContent.length < previousContent.length) {
            // Deletion
            const deletedLength = previousContent.length - currentContent.length;
            recordEvent({
                timestamp: new Date().toISOString(),
                type: 'delete',
                position: currentContent.length,
                length: deletedLength
            });
        }

        lastContentRef.current = currentContent;
    }, [isRecording, recordEvent]);

    const handlePaste = useCallback((e: ClipboardEvent) => {
        if (!isRecording) return;

        const pastedText = e.clipboardData?.getData('text') || '';
        recordEvent({
            timestamp: new Date().toISOString(),
            type: 'paste',
            content: pastedText,
            length: pastedText.length
        });
    }, [isRecording, recordEvent]);

    useEffect(() => {
        // Find textarea in children
        const textarea = document.querySelector('textarea');
        if (textarea) {
            textAreaRef.current = textarea;
            lastContentRef.current = textarea.value;

            textarea.addEventListener('input', handleInput);
            textarea.addEventListener('paste', handlePaste);

            return () => {
                textarea.removeEventListener('input', handleInput);
                textarea.removeEventListener('paste', handlePaste);
            };
        }
    }, [handleInput, handlePaste]);

    useEffect(() => {
        return () => {
            if (batchIntervalRef.current) {
                clearInterval(batchIntervalRef.current);
            }
        };
    }, []);

    return (
        <div className="relative">
            {/* Recording Indicator */}
            {isRecording && (
                <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full backdrop-blur-sm animate-pulse">
                    <Activity className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-500">Recording Proof of Thought</span>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                </div>
            )}

            {/* Control Buttons */}
            <div className="mb-4 flex gap-2">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                    >
                        <Activity className="w-4 h-4" />
                        Start Proof of Thought
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/25"
                    >
                        Stop Recording
                    </button>
                )}
            </div>

            {/* Children (assignment content) */}
            {children}
        </div>
    );
};

export default ThoughtRecorder;
