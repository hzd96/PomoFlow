import React from 'react';
import type { PomodoroSettings } from '../types';

interface PomodoroFormProps {
  settings: PomodoroSettings;
  onSettingsChange: (newSettings: PomodoroSettings) => void;
  onGenerate: () => void;
}

const InputField: React.FC<{ label: string; id: keyof PomodoroSettings; type: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; step?: number; }> = ({ label, id, type, value, onChange, min, max, step }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-text-muted mb-1">{label}</label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      required
      className="w-full bg-surface/80 border border-white/10 rounded-md py-2 px-3 text-text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
    />
  </div>
);

export const PomodoroForm: React.FC<PomodoroFormProps> = ({ settings, onSettingsChange, onGenerate }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    onSettingsChange({
      ...settings,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <div className="p-6 bg-surface/50 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/10">
      <h2 className="text-3xl font-black mb-6 text-primary">Plan Your Flow</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Start Time" id="startTime" type="time" value={settings.startTime} onChange={handleChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Work Duration (min)" id="workDuration" type="number" value={settings.workDuration} onChange={handleChange} min={15} max={60} />
          <InputField label="Total Sessions" id="totalSessions" type="number" value={settings.totalSessions} onChange={handleChange} min={1} max={16} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Short Break (min)" id="shortBreakDuration" type="number" value={settings.shortBreakDuration} onChange={handleChange} min={5} max={20} />
          <InputField label="Long Break (min)" id="longBreakDuration" type="number" value={settings.longBreakDuration} onChange={handleChange} min={15} max={45} />
        </div>
        <InputField label="Sessions Before Long Break" id="sessionsBeforeLongBreak" type="number"value={settings.sessionsBeforeLongBreak} onChange={handleChange} min={2} max={8}/>
        
        <button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-text-inverted font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover-glow">
          Generate Schedule
        </button>
      </form>
    </div>
  );
};