import React, { useRef, useEffect } from 'react';
import type { ScheduledSession } from '../types';
import { SessionType } from '../types';
import type { AITask } from '../services/geminiService';

interface ScheduleDisplayProps {
  schedule: ScheduledSession[];
  currentSessionIndex: number;
  aiTasks: AITask[];
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getSessionStyling = (type: SessionType) => {
    switch (type) {
        case SessionType.Work: 
            return { 
                icon: "fas fa-briefcase", 
                colorClass: "text-work", 
                borderClass: "border-work",
                ringClass: "ring-work",
                currentBgClass: "bg-work-transparent",
                badgeBgClass: "bg-work-transparent"
            };
        case SessionType.ShortBreak: 
            return { 
                icon: "fas fa-coffee", 
                colorClass: "text-short-break",
                borderClass: "border-short-break",
                ringClass: "ring-short-break",
                currentBgClass: "bg-short-break-transparent",
                badgeBgClass: "bg-short-break-transparent"
            };
        case SessionType.LongBreak: 
            return { 
                icon: "fas fa-couch", 
                colorClass: "text-long-break",
                borderClass: "border-long-break",
                ringClass: "ring-long-break",
                currentBgClass: "bg-long-break-transparent",
                badgeBgClass: "bg-long-break-transparent"
            };
    }
}

export const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ schedule, currentSessionIndex, aiTasks }) => {
  const totalDuration = schedule.length > 0
    ? (schedule[schedule.length - 1].endTime.getTime() - schedule[0].startTime.getTime()) / (1000 * 60)
    : 0;
  
  const hours = Math.floor(totalDuration / 60);
  const minutes = Math.round(totalDuration % 60);

  const listRef = useRef<HTMLDivElement>(null);
  const currentItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentItemRef.current && listRef.current) {
        const list = listRef.current;
        const item = currentItemRef.current;
        // Center the item in the list
        const topPos = item.offsetTop - (list.clientHeight / 2) + (item.clientHeight / 2);
        list.scrollTo({ top: topPos, behavior: 'smooth' });
    }
  }, [currentSessionIndex]);

  return (
    <div className="p-6 bg-surface/50 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-black text-primary">Your Schedule</h2>
        <div className="text-sm font-semibold text-text-base bg-surface-light px-3 py-1 rounded-full">
            <i className="fas fa-clock mr-2"></i>
            Total: {hours > 0 && `${hours}h `}{minutes}min
        </div>
      </div>
      <div ref={listRef} className="space-y-3 max-h-[75vh] overflow-y-auto pr-2 -mr-2">
        {schedule.map((session, index) => {
          const { icon, colorClass, borderClass, ringClass, currentBgClass, badgeBgClass } = getSessionStyling(session.type);
          const isCurrent = index === currentSessionIndex;
          const workSessionTask = session.type === SessionType.Work && aiTasks[session.sessionNumber - 1];

          return (
            <div 
                key={index}
                ref={isCurrent ? currentItemRef : null}
                className={`p-4 rounded-lg transition-all duration-300 flex items-start gap-4 border-l-8 ${borderClass} ${isCurrent ? `${currentBgClass} ring-4 ${ringClass} shadow-lg shadow-black/30` : 'bg-surface/30 backdrop-blur-xl border-transparent'} animate-fadeIn`}
                style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`mt-1 text-2xl w-8 text-center ${colorClass}`}><i className={icon}></i></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className={`font-black text-xl ${colorClass}`}>
                    {session.type === SessionType.Work ? `Session ${session.sessionNumber}` : session.type.replace('Break', ' Break')}
                  </span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded text-text-base ${badgeBgClass}`}>
                    {session.duration} min
                  </span>
                </div>
                <div className="text-sm text-text-muted font-mono">
                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                </div>
                {workSessionTask && (
                    <div className={`mt-2 p-3 bg-black/20 rounded-md border-l-2 ${borderClass}`}>
                        <p className="font-semibold text-accent">{workSessionTask.task}</p>
                        <p className="text-xs text-text-muted">{workSessionTask.description}</p>
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};