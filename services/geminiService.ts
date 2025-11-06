
import { GoogleGenAI, Type } from "@google/genai";

export interface AITask {
    task: string;
    description: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateFocusTasks = async (goal: string, sessionCount: number, workDuration: number): Promise<AITask[]> => {
    const prompt = `
        Based on the Pomodoro technique, break down the following user goal into ${sessionCount} distinct, actionable tasks. 
        Each task should be achievable within a single ${workDuration}-minute focus session.
        User Goal: "${goal}"
        
        Provide a short, clear title for each task and a one-sentence description.
        Your response must be a valid JSON array of objects.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            task: {
                                type: Type.STRING,
                                description: "A short, actionable title for the focus task."
                            },
                            description: {
                                type: Type.STRING,
                                description: "A brief one-sentence description of the task."
                            }
                        },
                        required: ["task", "description"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const tasks = JSON.parse(jsonText);
        return tasks;
    } catch (error) {
        console.error("Error generating focus tasks:", error);
        throw new Error("Failed to generate tasks from AI. Please check your API key and try again.");
    }
};
