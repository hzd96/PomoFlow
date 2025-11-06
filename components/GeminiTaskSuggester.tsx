import React, { useState } from 'react';
import { generateFocusTasks } from '../services/geminiService';
import type { AITask } from '../services/geminiService';

interface GeminiTaskSuggesterProps {
    sessionCount: number;
    workDuration: number;
    onTasksSuggested: (tasks: AITask[]) => void;
}

export const GeminiTaskSuggester: React.FC<GeminiTaskSuggesterProps> = ({ sessionCount, workDuration, onTasksSuggested }) => {
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateTasks = async () => {
        if (!goal.trim()) {
            setError("Please enter a goal.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const tasks = await generateFocusTasks(goal, sessionCount, workDuration);
            onTasksSuggested(tasks);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-surface rounded-xl shadow-lg mt-8">
            <h3 className="text-xl font-bold mb-3 text-accent flex items-center">
                <i className="fas fa-brain mr-2"></i> AI Task Planner
            </h3>
            <p className="text-text-muted mb-4 text-sm">Let AI break down your main goal into manageable focus sessions.</p>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Draft the quarterly report"
                    className="flex-grow bg-surface-light border border-surface rounded-md py-2 px-3 text-text-base focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerateTasks}
                    disabled={isLoading}
                    className="bg-accent hover:bg-accent/90 text-text-inverted font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:bg-surface-light disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin mr-2"></i> Generating...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-magic-sparkles mr-2"></i> Suggest Tasks
                        </>
                    )}
                </button>
            </div>
            {error && <p className="text-danger mt-3 text-sm">{error}</p>}
        </div>
    );
};