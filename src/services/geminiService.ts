import { GoogleGenAI, Type } from "@google/genai";
import type { Template, Prospect, ResearchResult, Deal } from '../types';
import { initialProducts } from "../data/products";

const getApiKey = (): string => {
    try {
        const storedKeys = localStorage.getItem('apiKeys');
        if (storedKeys) {
            const keys = JSON.parse(storedKeys);
            // Use Gemini key, fallback to empty string
            return keys['gemini'] || '';
        }
    } catch (e) {
        console.error("Failed to parse API keys from localStorage", e);
    }
    // Fallback if localStorage is empty or fails
    return '';
};

const getGenAIClient = () => {
    // FIX: Correctly check for API key from localStorage first, then fallback to environment variable.
    const apiKey = getApiKey() || process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is not configured. Please add it in Settings > AI Provider.");
    }
    return new GoogleGenAI({ apiKey });
}

export const generateWorkflowEmail = async (prospect: Prospect, tone: string, purpose: string, keyPoints?: string): Promise<{ body: string; sources: any[] }> => {
    const prompt = `
        You are an expert sales copywriter AI. Your task is to write a personalized sales email from scratch for a specific prospect.
        **Prospect Information:**
        - Name: ${prospect.name}
        - Company: ${prospect.company}
        - Title: ${prospect.title || 'Decision Maker'}
        - AI-Inferred Pain Points: ${prospect.aiAnalysis?.painPoints?.join(', ') || 'N/A'}
        **Email Goal:**
        - Primary Purpose: "${purpose}"
        - Tone: ${tone}
        ${keyPoints ? `- Key Points to Include: "${keyPoints}"` : ''}
        **Instructions:**
        1. Write a complete, compelling sales email body.
        2. Address the prospect by their first name.
        3. Weave in information about their company, role, or potential pain points.
        4. End with a clear call to action.
        5. Use your search tool for recent, relevant info about the prospect's company.
        6. Return **only** the generated email body as a single block of HTML.
    `;
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{googleSearch: {}}] }
        });
        const text = response.text;
        if (!text) throw new Error("No content generated.");
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        return { body: text, sources };
    } catch (error) {
        console.error("Error generating workflow email with Gemini API:", error);
        return { body: "Sorry, there was an error generating the content.", sources: [] };
    }
};

export const generatePersonalizedEmail = async (template: Template, prospect: Prospect, tone: string): Promise<{ body: string; sources: any[] }> => {
    const prompt = `
      You are an expert sales copywriter AI. Personalize an email template using real-time web data.
      **Prospect:** ${prospect.name} at ${prospect.company}
      **Template:** ${template.body}
      **Instructions:**
      1. Adopt a **${tone}** tone.
      2. Use your search tool to find real info about the prospect's company.
      3. Dynamically replace tokens like \`{{recent_achievement}}\` and \`{{specific_pain_point}}\` with personalized content.
      4. Ensure the final output is a natural, compelling HTML email body.
    `;
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{googleSearch: {}}] }
        });
        const text = response.text;
        if (!text) throw new Error("No content generated.");
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        return { body: text, sources };
    } catch (error) {
        console.error("Error generating personalized content with Gemini API:", error);
        return { body: "Sorry, there was an error personalizing the content.", sources: [] };
    }
};

export const generateProspectIntelligence = async (prospect: Prospect): Promise<{ intelligence: any; sources: any[] }> => {
    const prompt = `
        Act as a B2B sales intelligence analyst. Use your search tool to find real info and generate a structured JSON profile for:
        - Name: ${prospect.name}
        - Title: ${prospect.title || 'Decision Maker'}
        - Company: ${prospect.company}
        Generate insights, and a plausible contact history of 2 interactions.
        Your final output must be a single, valid JSON object with keys: "communicationStyle", "motivations", "painPoints", "recentNews", "companyDescription", "contactHistory".
    `;
    let responseTextForParsing = '';
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{googleSearch: {}}] },
        });
        
        responseTextForParsing = response.text;
        let jsonText = responseTextForParsing.trim().match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1] || responseTextForParsing;
        const startIndex = jsonText.lastIndexOf('{');
        if (startIndex > -1) jsonText = jsonText.substring(startIndex);
        
        const intelligence = JSON.parse(jsonText);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        return { intelligence, sources };
    } catch (error) {
        console.error("Error parsing JSON in generateProspectIntelligence:", responseTextForParsing, error);
        throw new Error("Failed to generate AI-powered insights.");
    }
};

const nextStepsSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, rationale: { type: Type.STRING } }, required: ["title", "rationale"] }};
export const generateNextSteps = async (prospect: Prospect): Promise<{ title: string; rationale: string }[]> => {
    const prompt = `Act as a sales coach. Based on this prospect profile and history, generate 2-3 actionable next steps. Prospect: ${prospect.name}, ${prospect.title}. History: ${prospect.contactHistory?.map(h => h.outcome).join('; ') || 'None'}.`;
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: nextStepsSchema },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating next steps:", error);
        throw new Error("Failed to generate AI-powered next steps.");
    }
};

export const findCompaniesAndExecutives = async (...args: [string, string, string, number, string]): Promise<{ results: Omit<ResearchResult, 'id'>[], sources: any[] }> => {
    const [city, companySize, industry, count, executiveLevel] = args;
    const prompt = `Act as an AI market researcher. Find ${count} real companies matching: City: ${city}, Size: ${companySize}, Industry: ${industry}. For each, find a key ${executiveLevel} decision-maker. Return as a single, valid JSON array.`;
    let responseTextForParsing = '';
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{googleSearch: {}}] },
        });
        responseTextForParsing = response.text;
        let jsonText = responseTextForParsing.trim().match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1] || responseTextForParsing;
        const startIndex = jsonText.lastIndexOf('[');
        if (startIndex > -1) jsonText = jsonText.substring(startIndex);
        
        const results = JSON.parse(jsonText);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        return { results, sources };
    } catch (error) {
        console.error("Error parsing JSON in findCompaniesAndExecutives:", responseTextForParsing, error);
        throw new Error("Failed to generate company data.");
    }
};

export const generateOutreachPlan = async (prospect: ResearchResult): Promise<{ plan: any; sources: any[] }> => {
    const prompt = `Act as a Sales Enablement AI. Create a complete, personalized outreach plan for ${prospect.executiveName} at ${prospect.companyName}. Analyze their website (${prospect.website}) and recent news to infer pain points, then craft talking points, a personalized email, and a 3-message LinkedIn sequence. Return as a single, valid JSON object.`;
    let responseTextForParsing = '';
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{googleSearch: {}}] },
        });
        responseTextForParsing = response.text;
        let jsonText = responseTextForParsing.trim().match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1] || responseTextForParsing;
        const startIndex = jsonText.lastIndexOf('{');
        if (startIndex > -1) jsonText = jsonText.substring(startIndex);
        
        const plan = JSON.parse(jsonText);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        return { plan, sources };
    } catch (error) {
        console.error("Error parsing JSON in generateOutreachPlan:", responseTextForParsing, error);
        throw new Error("Failed to generate outreach plan.");
    }
};

const summarySchema = { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, actionItems: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["summary", "actionItems"] };
export const summarizeCallTranscript = async (transcript: string): Promise<{ summary: string; actionItems: string[] }> => {
    const prompt = `Analyze the following sales call transcript and produce a structured summary with action items.\n\nTranscript:\n${transcript}`;
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: summarySchema },
        });
        const result = JSON.parse(response.text.trim());
        return { summary: result.summary, actionItems: Array.isArray(result.actionItems) ? result.actionItems : [] };
    } catch (error) {
        console.error("Error summarizing transcript:", error);
        return { summary: "Error generating summary.", actionItems: [] };
    }
};

const briefingSchema = { type: Type.OBJECT, properties: { insights: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["insights"] };
export const generateDashboardBriefing = async (prospects: Prospect[], deals: Deal[]): Promise<{ insights: string[], sources: any[] }> => {
    const prompt = `Act as a sales assistant AI. Analyze recent prospects and active deals to generate a short, actionable daily briefing with 2-3 top-priority items. Start each with an action word.`;
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: briefingSchema },
        });
        const result = JSON.parse(response.text.trim());
        return { insights: result.insights || [], sources: [] };
    } catch (error) {
        console.error("Error generating dashboard briefing:", error);
        return { insights: ["Could not generate AI briefing."], sources: [] };
    }
};

export const generateAdHocContent = async (contentType: string, prompt: string): Promise<string> => {
    const fullPrompt = `You are an expert ${contentType} writer for a B2B sales team. Generate content for this prompt: "${prompt}". Your output should be ready to copy-paste.`;
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        const text = response.text;
        if (!text) throw new Error("No content generated.");
        return text;
    } catch (error) {
        console.error("Error generating ad-hoc content:", error);
        return "Sorry, there was an error generating the content.";
    }
};