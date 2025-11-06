import React, { useEffect, useMemo } from 'react';
import type { ScheduledSession } from '../types';
import { SessionType } from '../types';

interface TimerDisplayProps {
  currentSession: ScheduledSession | null;
  timeLeft: number;
  isTimerActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onNext: () => void;
  onReset: () => void;
}

const getSessionInfo = (type: SessionType | undefined) => {
    switch (type) {
        case SessionType.Work:
            return { title: "Focus Time", color: "text-work", stroke: "stroke-work", bg: "bg-work-transparent" };
        case SessionType.ShortBreak:
            return { title: "Short Break", color: "text-short-break", stroke: "stroke-short-break", bg: "bg-short-break-transparent" };
        case SessionType.LongBreak:
            return { title: "Long Break", color: "text-long-break", stroke: "stroke-long-break", bg: "bg-long-break-transparent" };
        default:
            return { title: "Ready?", color: "text-text-muted", stroke: "stroke-text-muted", bg: "bg-surface" };
    }
}

const getSessionGraphics = (type: SessionType | undefined) => {
    // Using a neutral color from the theme for SVG patterns to ensure they look good on all themes.
    const patternColor = '94a3b8'; // Corresponds to --color-text-muted hex

    switch (type) {
        case SessionType.Work:
            return {
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${patternColor}' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            };
        case SessionType.ShortBreak:
        case SessionType.LongBreak:
            return {
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${patternColor}' fill-opacity='0.1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-5.523 0-10-4.477-10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-5.523 0-10-4.477-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            };
        default:
            return {
                backgroundImage: 'none',
            };
    }
}


export const TimerDisplay: React.FC<TimerDisplayProps> = ({ currentSession, timeLeft, isTimerActive, onStart, onPause, onNext, onReset }) => {
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    const sessionInfo = getSessionInfo(currentSession?.type);
    const sessionGraphics = getSessionGraphics(currentSession?.type);
    
    const progress = useMemo(() => {
        if (!currentSession) return 0;
        const totalSeconds = currentSession.duration * 60;
        return ((totalSeconds - timeLeft) / totalSeconds) * 100;
    }, [currentSession, timeLeft]);

    useEffect(() => {
        document.title = currentSession 
            ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - ${sessionInfo.title}` 
            : 'AI Pomodoro Flow Planner';
    }, [minutes, seconds, currentSession, sessionInfo.title]);

    return (
        <div 
            className={`p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center transition-all duration-500 bg-surface/50 backdrop-blur-2xl border border-white/10`}
            style={{ ...sessionGraphics }}
        >
            <h3 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${sessionInfo.color}`}>
                {currentSession ? `Session ${currentSession.sessionNumber}: ${sessionInfo.title}` : 'Ready to Begin?'}
            </h3>
            
            <div className="relative w-64 h-64 flex items-center justify-center">
                 <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" strokeWidth="12" className="stroke-current text-white/10" />
                    <circle
                        cx="60" cy="60" r="54" fill="none" strokeWidth="12"
                        className={`transition-all duration-500 ${sessionInfo.color} ${isTimerActive ? 'animate-pulseGlow' : ''}`}
                        strokeDasharray="339.292"
                        strokeDashoffset={339.292 - (progress / 100) * 339.292}
                        strokeLinecap="round"
                    />
                </svg>
                <div className={`font-mono text-7xl font-black text-text-base tabular-nums transition-transform duration-300 ${isTimerActive ? 'scale-105' : ''}`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
            </div>

            <div className="flex space-x-4 mt-8">
                {isTimerActive ? (
                    <button onClick={onPause} className="w-24 bg-gradient-to-r from-warning to-danger hover:from-warning/80 hover:to-danger/80 text-text-inverted font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center justify-center">
                        <i className="fas fa-pause mr-2"></i> Pause
                    </button>
                ) : (
                    <button onClick={onStart} className="w-24 bg-gradient-to-r from-success to-primary hover:from-success/80 hover:to-primary/80 text-text-inverted font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center justify-center">
                        <i className="fas fa-play mr-2"></i> Start
                    </button>
                )}
                <button onClick={onNext} className="w-24 bg-surface-light hover:bg-surface-light/80 text-text-base font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center justify-center">
                    <i className="fas fa-forward mr-2"></i> Next
                </button>
            </div>
             <button onClick={onReset} className="mt-4 text-text-muted hover:text-danger text-sm transition">
                Reset Schedule
            </button>
        </div>
    );
};