import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PomodoroForm } from './components/PomodoroForm';
import { ScheduleDisplay } from './components/ScheduleDisplay';
import { TimerDisplay } from './components/TimerDisplay';
import { GeminiTaskSuggester } from './components/GeminiTaskSuggester';
import { SessionType } from './types';
import type { PomodoroSettings, ScheduledSession } from './types';
import type { AITask } from './services/geminiService';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeSwitcher } from './components/ThemeSwitcher';

const ALARM_SOUND_URL = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

const AppContent: React.FC = () => {
    const [settings, setSettings] = useState<PomodoroSettings>({
        startTime: '09:00',
        totalSessions: 8,
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
    });
    const [schedule, setSchedule] = useState<ScheduledSession[]>([]);
    const [aiTasks, setAiTasks] = useState<AITask[]>([]);

    const [currentSessionIndex, setCurrentSessionIndex] = useState(-1);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    
    const timerRef = useRef<number | null>(null);
    const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
    
    useEffect(() => {
        alarmAudioRef.current = new Audio(ALARM_SOUND_URL);
    }, []);

    const generateSchedule = useCallback(() => {
        const [startHour, startMinute] = settings.startTime.split(':').map(Number);
        let currentTime = new Date();
        currentTime.setHours(startHour, startMinute, 0, 0);

        const newSchedule: ScheduledSession[] = [];
        let workSessionCounter = 0;

        for (let i = 0; i < settings.totalSessions; i++) {
            workSessionCounter++;

            // Work Session
            const workStartTime = new Date(currentTime);
            const workEndTime = new Date(workStartTime.getTime() + settings.workDuration * 60000);
            newSchedule.push({
                type: SessionType.Work,
                duration: settings.workDuration,
                sessionNumber: i + 1,
                startTime: workStartTime,
                endTime: workEndTime,
            });
            currentTime = workEndTime;

            // Break Session
            if (i < settings.totalSessions - 1) {
                const isLongBreak = workSessionCounter % settings.sessionsBeforeLongBreak === 0;
                const breakDuration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration;
                const breakType = isLongBreak ? SessionType.LongBreak : SessionType.ShortBreak;

                const breakStartTime = new Date(currentTime);
                const breakEndTime = new Date(breakStartTime.getTime() + breakDuration * 60000);
                newSchedule.push({
                    type: breakType,
                    duration: breakDuration,
                    sessionNumber: i + 1,
                    startTime: breakStartTime,
                    endTime: breakEndTime,
                });
                currentTime = breakEndTime;
            }
        }
        setSchedule(newSchedule);
        setCurrentSessionIndex(0);
        setTimeLeft(newSchedule[0].duration * 60);
        setIsTimerActive(false);
        setAiTasks([]); // Clear AI tasks on new schedule
    }, [settings]);
    
    const startTimer = useCallback(() => {
        if (currentSessionIndex >= schedule.length || isTimerActive) return;
        
        setIsTimerActive(true);
        timerRef.current = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (alarmAudioRef.current) {
                        alarmAudioRef.current.play().catch(e => console.error("Audio play failed", e));
                    }
                    nextSession();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [currentSessionIndex, schedule.length, isTimerActive]);

    const pauseTimer = useCallback(() => {
        setIsTimerActive(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const nextSession = useCallback(() => {
        pauseTimer();
        const nextIndex = currentSessionIndex + 1;
        if (nextIndex < schedule.length) {
            setCurrentSessionIndex(nextIndex);
            setTimeLeft(schedule[nextIndex].duration * 60);
        } else {
            // End of schedule
            setCurrentSessionIndex(-1);
            setTimeLeft(0);
            setIsTimerActive(false);
        }
    }, [currentSessionIndex, schedule, pauseTimer]);
    
    const resetSchedule = () => {
        pauseTimer();
        setSchedule([]);
        setCurrentSessionIndex(-1);
        setTimeLeft(0);
    };

    // Cleanup interval on component unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const currentSession = schedule[currentSessionIndex] || null;

    return (
        <div className="min-h-screen w-full overflow-y-auto p-4 sm:p-8 relative">
            <ThemeSwitcher />
            <main className="max-w-7xl mx-auto">
                <header className="text-center mb-10 animate-fadeIn" style={{ animationDelay: '100ms' }}>
                    <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent leading-tight">
                        AI Pomodoro Flow Planner
                    </h1>
                    <p className="text-text-muted mt-2 max-w-2xl mx-auto">Maximize your productivity with structured focus and AI-powered planning.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {schedule.length === 0 ? (
                        <div className="lg:col-span-2 animate-fadeIn max-w-xl mx-auto w-full" style={{ animationDelay: '300ms' }}>
                             <PomodoroForm settings={settings} onSettingsChange={setSettings} onGenerate={generateSchedule} />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-8 animate-fadeIn" style={{ animationDelay: '300ms' }}>
                                <TimerDisplay 
                                    currentSession={currentSession}
                                    timeLeft={timeLeft}
                                    isTimerActive={isTimerActive}
                                    onStart={startTimer}
                                    onPause={pauseTimer}
                                    onNext={nextSession}
                                    onReset={resetSchedule}
                                />
                                {aiTasks.length === 0 && (
                                     <GeminiTaskSuggester 
                                        sessionCount={settings.totalSessions} 
                                        workDuration={settings.workDuration}
                                        onTasksSuggested={setAiTasks}
                                    />
                                )}
                            </div>
                            <div className="animate-fadeIn" style={{ animationDelay: '500ms' }}>
                                <ScheduleDisplay schedule={schedule} currentSessionIndex={currentSessionIndex} aiTasks={aiTasks} />
                            </div>
                        </>
                    )}
                </div>
                 <footer className="text-center mt-12 text-text-muted/50 text-sm animate-fadeIn" style={{ animationDelay: '700ms' }}>
                    <p>Designed for focused work. Built with React, TypeScript, and Gemini.</p>
                </footer>
            </main>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};


export default App;