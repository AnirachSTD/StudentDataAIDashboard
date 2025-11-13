import { GoogleGenAI } from '@google/genai';
import { Student } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// A simple precaution to avoid sending excessively large datasets.
const MAX_STUDENTS_FOR_CONTEXT = 500;

export async function ask(question: string, context: Student[]): Promise<string> {
  try {
    const model = 'gemini-2.5-flash';
    
    const contextSubset = context.slice(0, MAX_STUDENTS_FOR_CONTEXT);
    const contextWarning = context.length > MAX_STUDENTS_FOR_CONTEXT 
        ? `\n\nNote: The provided data is a subset of a larger dataset (${context.length} total records) and only the first ${MAX_STUDENTS_FOR_CONTEXT} records are being analyzed.`
        : '';
    
    const prompt = `You are a helpful data analyst assistant. Your task is to answer questions based strictly on the provided student data.
The data is in JSON format. Do not use any information outside of this data. If the answer cannot be found, say so.
Provide concise and accurate answers.

When you need to present data in a table, YOU MUST use Markdown table format.
For example:
| Student ID | Full Name | GPAX |
|------------|-----------|------|
| 65010001   | John Doe  | 3.50 |
| 65010002   | Jane Smith| 3.75 |

When asked to list students, provide their full name, student ID, and any other relevant information requested in a Markdown table.

Here is the student data:
${JSON.stringify(contextSubset, null, 2)}
${contextWarning}

User's question: "${question}"
`;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });
    
    return response.text;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    return "Sorry, I couldn't process that request. There might be an issue with the connection to the AI service.";
  }
}