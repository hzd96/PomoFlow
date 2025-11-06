
export enum SessionType {
  Work = 'Work',
  ShortBreak = 'ShortBreak',
  LongBreak = 'LongBreak',
}

export interface Session {
  type: SessionType;
  duration: number; // in minutes
}

export interface PomodoroSettings {
  startTime: string;
  totalSessions: number;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

export interface ScheduledSession extends Session {
  sessionNumber: number;
  startTime: Date;
  endTime: Date;
}
