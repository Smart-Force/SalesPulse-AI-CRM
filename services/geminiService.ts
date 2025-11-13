import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import Deal type for generateDashboardBriefing function.
import type { Template, Prospect, ResearchResult, Deal } from '../types';
import { initialProducts } from "../data/products";

const getApiKey = (): string => {
    try {
        const storedKeys = localStorage.getItem('apiKeys');
        if (storedKeys) {
            const keys = JSON.parse(storedKeys);
            // Use Gemini key, fallback to env var, then empty string
            return keys['gemini'] || process.env.API_KEY || '';
        }
    } catch (e) {
        console.error("Failed to parse API keys from localStorage", e);
    }
    // Fallback if localStorage is empty or fails
    return process.env.API_KEY || '';
};

const getGenAIClient = () => {
    const apiKey = getApiKey();
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
        2. Address the prospect by their first name, e.g., "Hi ${prospect.name.split(' ')[0]}".
        3. Subtly weave in information about their company, role, or potential pain points.
        4. Incorporate the specified key points naturally.
        5. End with a clear call to action that aligns with the email's purpose.
        6. Use your search tool if you need to find recent, relevant information about the prospect's company to make the email more impactful.
        7. Return **only** the generated email body as a single block of HTML, ready to be displayed. Do not include a subject line or any other text.
    `;
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}]
            }
        });
        const text = response.text;
        if (!text) {
            throw new Error("No content generated.");
        }
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        return { body: text, sources };
    } catch (error) {
        console.error("Error generating workflow email with Gemini API:", error);
        const body = "Sorry, there was an error generating the content. Please check the console for details.";
        return { body, sources: [] };
    }
};

export const generatePersonalizedEmail = async (template: Template, prospect: Prospect, tone: string): Promise<{ body: string; sources: any[] }> => {
    const prompt = `
      You are an expert sales copywriter AI. Your task is to personalize an email template for a specific prospect using real-time web data.

      **Prospect Information:**
      - Name: ${prospect.name}
      - Company: ${prospect.company}
      - Title: ${prospect.title || 'Decision Maker'}

      **Email Template:**
      - Subject: ${template.subject}
      - Body: ${template.body}

      **Instructions:**
      1.  Adopt a **${tone}** tone throughout the email.
      2.  Use your search tool to find real, up-to-date information about the prospect's company and role to generate relevant details.
      3.  Dynamically replace the following advanced tokens in the template body with highly personalized content based on your research:
          - \`{{first_name}}\`: Replace with the prospect's first name.
          - \`{{company}}\`: Replace with the prospect's company name.
          - \`{{recent_achievement}}\`: Find a real, recent, positive, and specific event for the company (e.g., "launching your new predictive analytics suite," "securing Series B funding," "being featured in TechCrunch for your innovative approach to data security").
          - \`{{specific_pain_point}}\`: Based on your research, infer a likely business challenge for someone in the prospect's role at their company (e.g., "scaling your outreach without losing personalization," "integrating disparate data sources for a single view of the customer," "improving sales forecast accuracy").
          - \`{{personal_insight}}\`: Add a brief, insightful comment that connects your service to their role or the company achievement (e.g., "As you continue to scale, maintaining that level of personalization becomes critical," "That's an impressive milestone, and it often brings new challenges in managing customer data.").
          - \`{{primary_service}}\`: Suggest 'our AI-powered SalesPulse platform'.
          - \`{{service_rationale}}\`: Briefly explain why this service is relevant to their inferred pain point.
      4.  Ensure the final output flows naturally and is compelling.
      5.  Return **only** the generated email body as a single block of HTML, ready to be displayed. Do not include the subject line or any other text.
    `;

    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}]
            }
        });
        const text = response.text;
        if (!text) {
            throw new Error("No content generated.");
        }
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        // The prompt asks for HTML, so we should trust the output without modification.
        const body = text;

        return { body, sources };
    } catch (error) {
        console.error("Error generating personalized content with Gemini API:", error);
        const body = "Sorry, there was an error personalizing the content. Please check the console for details.";
        return { body, sources: [] };
    }
};

export const generateProspectIntelligence = async (prospect: Prospect): Promise<{ intelligence: any; sources: any[] }> => {
    const prompt = `
        Act as a B2B sales intelligence analyst. Based on the following prospect information, use your search tool to find real, up-to-date information and generate a structured profile of insights.

        **Prospect Information:**
        - Name: ${prospect.name}
        - Title: ${prospect.title || 'Decision Maker'}
        - Company: ${prospect.company}
        - Industry: ${prospect.companyDetails?.industry || 'Technology'}

        Generate insights based on your web research. Also, generate a plausible contact history of 2 recent interactions. For each interaction, provide a date, type (Email, Call, or Meeting), a factual outcome, and a one-sentence AI insight that analyzes the interaction.

        Your final output must be a single, valid JSON object that conforms to this structure. Do not include any other text, just the JSON.
        {
          "communicationStyle": "A brief, 2-3 word description of their likely communication style (e.g., 'Data-driven & Formal', 'Visionary & Inspiring').",
          "motivations": ["A list of 3-4 likely professional motivations (e.g., 'Increasing team efficiency', 'Driving revenue growth')."],
          "painPoints": ["A list of 3-4 potential business pain points relevant to their role and company (e.g., 'Low CRM adoption rates', 'Inaccurate sales forecasting')."],
          "recentNews": ["A list of 2-3 real, recent news headlines or company achievements you found online."],
          "companyDescription": "A one-sentence summary of the company's business based on your research.",
          "contactHistory": [
            {
              "date": "A plausible recent date for the interaction (e.g., 'July 22, 2024').",
              "type": "'Email', 'Call', or 'Meeting'.",
              "outcome": "A brief, factual outcome of the interaction (e.g., 'Sent initial proposal, opened twice.').",
              "aiInsight": "A one-sentence AI-powered insight analyzing the interaction's significance (e.g., 'The multiple opens suggest strong interest in the pricing section.')."
            }
          ]
        }
    `;
    let responseTextForParsing = '';
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        responseTextForParsing = response.text;
        let jsonText = responseTextForParsing.trim();

        // The model can return conversational text and markdown. Extract the JSON object.
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
            jsonText = match[1];
        } else {
            // Fallback: find the start of the last JSON object in the string, assuming it's the last element.
            const startIndex = jsonText.lastIndexOf('{');
            if (startIndex > -1) {
                jsonText = jsonText.substring(startIndex);
            }
        }
        
        const intelligence = JSON.parse(jsonText);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        return { intelligence, sources };
    } catch (error) {
        console.error("Error generating prospect intelligence:", error);
        console.error("Original text that failed to parse in generateProspectIntelligence:", responseTextForParsing);
        throw new Error("Failed to generate AI-powered insights.");
    }
};

const nextStepsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A short, actionable title for the next step (e.g., 'Send Follow-up Email')." },
            rationale: { type: Type.STRING, description: "A brief, one-sentence explanation of why this is a good next step." },
        },
        required: ["title", "rationale"]
    }
};

export const generateNextSteps = async (prospect: Prospect): Promise<{ title: string; rationale: string }[]> => {
    const contactHistoryText = prospect.contactHistory && prospect.contactHistory.length > 0
        ? prospect.contactHistory.map(item => `- ${item.date}: ${item.type} - Outcome: ${item.outcome}`).join('\n')
        : 'No recent interactions on record.';

    const prompt = `
        Act as an expert B2B sales coach. Based on the following enriched prospect profile and their interaction history, generate 2-3 specific, actionable next steps to advance the sales conversation.

        **Prospect Profile:**
        - Name: ${prospect.name}
        - Title: ${prospect.title || 'N/A'}
        - Company: ${prospect.company}
        - AI-Analyzed Communication Style: ${prospect.aiAnalysis?.communicationStyle || 'N/A'}
        - AI-Inferred Pain Points: ${prospect.aiAnalysis?.painPoints?.join(', ') || 'N/A'}
        - Recent News: ${prospect.recentNews?.join('; ') || 'N/A'}

        **Recent Contact History:**
        ${contactHistoryText}

        Your suggestions should be creative and tailored to the provided data. For example, if a pain point is "inaccurate forecasting" and recent news is a new product launch, suggest a follow-up about managing sales pipelines for the new product.
    `;

    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: nextStepsSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating next steps:", error);
        throw new Error("Failed to generate AI-powered next steps.");
    }
};

export const findCompaniesAndExecutives = async (city: string, companySize: string, industry: string, count: number, executiveLevel: string): Promise<{ results: Omit<ResearchResult, 'id'>[], sources: any[] }> => {
    const prompt = `
        Act as an advanced AI market researcher for a digital marketing agency named 'Varakit'. 
        Your task is to use your search tool to identify ${count} real companies that match the following criteria. 
        For each company, find detailed, accurate information and identify a key decision-maker.

        **Search Criteria:**
        - City/Region: ${city}
        - Company Size: ${companySize}
        - Industry: ${industry}
        - Executive Level to Target: ${executiveLevel} (e.g., CEO for C-Level, VP of Marketing for VP-Level)

        **Instructions:**
        - Use your search tool to find real, publicly available data for all fields.
        - Ensure the generated data is consistent (e.g., a startup shouldn't have $500M in revenue).
        - For the 'dataConfidenceScore', provide a score between 7 and 10 based on the quality and availability of data you find.
        - The executive details (name and position) should be appropriate for the company's size, industry, and the specified executive level. Try to find a real person if possible.
        - The LinkedIn Profile URL should be a real URL if found, otherwise use the format 'https://linkedin.com/in/firstname-lastname-random'.

        Return your findings as a single, valid JSON array. Do not include any other text, just the JSON.
        The structure for each object in the array should be:
        {
            "companyName": "string",
            "industry": "string",
            "hqAddress": "string",
            "employeeCount": "string",
            "companySize": "string",
            "annualRevenue": "string",
            "website": "string",
            "mainPhone": "string",
            "yearFounded": "number",
            "executiveName": "string",
            "executivePosition": "string",
            "executiveEmail": "string",
            "directPhone": "string",
            "linkedInProfile": "string",
            "dataConfidenceScore": "integer"
        }
    `;
    let responseTextForParsing = '';
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        responseTextForParsing = response.text;
        let jsonText = responseTextForParsing.trim();

        // The model can return conversational text and markdown. Extract the JSON.
        // First, try to find a JSON code block.
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
            jsonText = match[1];
        } else {
            // Fallback: find the start of the last JSON array in the string, assuming it's the last element.
            const startIndex = jsonText.lastIndexOf('[');
            if (startIndex > -1) {
                jsonText = jsonText.substring(startIndex);
            }
        }

        const results = JSON.parse(jsonText);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        
        return { results, sources };
    } catch (error) {
        console.error("Error finding companies:", error);
        console.error("Original text that failed to parse in findCompaniesAndExecutives:", responseTextForParsing);
        throw new Error("Failed to generate company and executive data.");
    }
};

export const generateOutreachPlan = async (prospect: ResearchResult): Promise<{ plan: any; sources: any[] }> => {
    const productList = initialProducts.map(p => `- ${p.name} (${p.tier} - ${p.billingType}): ${p.description.join(' ')}`).join('\n');
    
    const prompt = `
        Act as an expert Sales Enablement AI for 'Varakit', a digital marketing and branding agency.
        Your task is to create a complete, personalized outreach plan for the following prospect by using your search tool to gather real-time intelligence.

        **Varakit's Product Packages:**
        ${productList}

        **Prospect Profile:**
        - Company: ${prospect.companyName} (${prospect.industry})
        - Website: ${prospect.website}
        - Key Contact: ${prospect.executiveName}, ${prospect.executivePosition}

        **Analysis & Personalization Workflow:**
        1.  **Analyze Digital Presence:** Use your search tool to analyze their website (${prospect.website}) and find recent company news. Infer their digital marketing needs (e.g., outdated design, weak social media, poor SEO, recent funding indicating expansion).
        2.  **Identify Pain Points:** Based on the analysis, list 3-4 specific pain points this company likely faces.
        3.  **Product-Company Alignment:** From the provided list, select the 2-3 most relevant Varakit product packages that solve these pain points.
        4.  **Develop Talking Points:** Create a concise list of talking points that connect Varakit's services to the company's specific situation based on your research.
        5.  **Draft Personalized Email:** Write a short, compelling email to the key contact. It must reference a specific finding from your analysis (e.g., a piece of recent news, an observation from their website) and propose a solution using the recommended products.
        6.  **Draft LinkedIn Message Sequence:**
            - **Message 1:** A personalized, concise first connection message (200-300 characters).
            - **Message 2:** A brief follow-up message offering value (e.g., a relevant article, a quick insight).
            - **Message 3:** A final, gentle follow-up with a soft call to action (e.g., a free audit).
        
        Generate the complete plan as a single, valid JSON object. Do not include any other text, just the JSON.
        The structure should be:
        {
          "recommendedProducts": ["string"],
          "talkingPoints": ["string"],
          "personalizedEmail": "string",
          "linkedinMessage1": "string",
          "linkedinMessage2": "string",
          "linkedinMessage3": "string"
        }
    `;
    let responseTextForParsing = '';
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        responseTextForParsing = response.text;
        let jsonText = responseTextForParsing.trim();

        // The model can return conversational text and markdown. Extract the JSON object.
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
            jsonText = match[1];
        } else {
            // Fallback: find the start of the last JSON object in the string, assuming it's the last element.
            const startIndex = jsonText.lastIndexOf('{');
            if (startIndex > -1) {
                jsonText = jsonText.substring(startIndex);
            }
        }
        
        const plan = JSON.parse(jsonText);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        return { plan, sources };
    } catch (error) {
        console.error("Error generating outreach plan:", error);
        console.error("Original text that failed to parse in generateOutreachPlan:", responseTextForParsing);
        throw new Error("Failed to generate AI-powered outreach plan.");
    }
};

const summarySchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise, professional summary of the sales conversation, highlighting key topics, customer sentiment, and outcomes." },
        actionItems: { 
            type: Type.ARRAY,
            description: "A list of clear, actionable next steps identified during the call.",
            items: {
                type: Type.STRING
            }
        },
    },
    required: ["summary", "actionItems"]
};


export const summarizeCallTranscript = async (transcript: string): Promise<{ summary: string; actionItems: string[] }> => {
    const prompt = `
        You are an expert sales analyst AI. Your task is to analyze the following sales call transcript and produce a structured summary.

        **Transcript:**
        ${transcript}

        **Instructions:**
        1.  Generate a concise, professional summary of the conversation. Highlight key topics discussed, the prospect's main pain points or interests, and the overall sentiment.
        2.  Extract a list of specific, actionable items for the sales representative. If no clear action items are present, return an empty array.
        3.  Provide your output in the requested JSON format.
    `;
    
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: summarySchema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        // Ensure actionItems is always an array
        if (!Array.isArray(result.actionItems)) {
            result.actionItems = [];
        }
        return result;
    } catch (error) {
        console.error("Error summarizing transcript:", error);
        return {
            summary: "There was an error generating the call summary. Please review the transcript manually.",
            actionItems: ["Review transcript for action items."],
        };
    }
};

// FIX: Add missing generateDashboardBriefing function to resolve error in aiService.
const briefingSchema = {
    type: Type.OBJECT,
    properties: {
        insights: { 
            type: Type.ARRAY,
            description: "A list of 2-3 concise, actionable insights for the sales representative based on the provided data.",
            items: {
                type: Type.STRING
            }
        },
    },
    required: ["insights"]
};

export const generateDashboardBriefing = async (prospects: Prospect[], deals: Deal[]): Promise<{ insights: string[], sources: any[] }> => {
    const recentProspects = prospects.slice(0, 5).map(p => `- ${p.name} at ${p.company} (Status: ${p.status})`).join('\n');
    const activeDeals = deals.filter(d => d.status !== 'Won' && d.status !== 'Lost').map(d => `- ${d.name} (Status: ${d.status}, Value: ...)`).join('\n');

    const prompt = `
        Act as a sales assistant AI. Your task is to analyze the following data and generate a short, actionable daily briefing for a sales representative. Focus on what's most important for them to do today.

        **Recent Prospects:**
        ${recentProspects || 'None'}

        **Active Deals:**
        ${activeDeals || 'None'}

        **Instructions:**
        1.  Identify 2-3 top-priority items. Examples: a new high-value lead, a deal that's been quiet for too long, an upcoming meeting.
        2.  For each item, create a concise, one-sentence insight.
        3.  Start each insight with an action word (e.g., "Follow up with...", "Prepare for...", "Engage...").
        4.  Return the insights in the specified JSON format.
    `;
    
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: briefingSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        const insights = result.insights || [];

        return { insights, sources: [] };
    } catch (error) {
        console.error("Error generating dashboard briefing:", error);
        return {
            insights: ["Could not generate AI briefing. Please check your data and try again."],
            sources: []
        };
    }
};

// FIX: Add missing generateAdHocContent function to resolve error in aiService.
export const generateAdHocContent = async (contentType: string, prompt: string): Promise<string> => {
    const fullPrompt = `
        You are an expert ${contentType} writer for a B2B sales team.
        Your task is to generate content based on the following user prompt.
        Your output should be ready to be copy-pasted. For emails, do not include a subject line unless asked.

        **User Prompt:**
        "${prompt}"

        Generate the content and return it as a single block of text or basic HTML, depending on what is most appropriate for a ${contentType}.
    `;
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        const text = response.text;
        if (!text) {
            throw new Error("No content generated.");
        }
        return text;
    } catch (error) {
        console.error("Error generating ad-hoc content:", error);
        return "Sorry, there was an error generating the content. Please check the console for details.";
    }
};