import * as geminiService from './geminiService';
import * as mockAIService from './mockAIService';
import * as glmMockService from './glmMockService';
import type { Template, Prospect, ResearchResult, AIProvider, Deal } from '../types';

const getProvider = (): AIProvider => {
    // FIX: Add validation for the provider retrieved from localStorage.
    const provider = (localStorage.getItem('aiProvider') as AIProvider | null);
    if (provider) {
        // Ensure the provider from localStorage is a valid one before returning
        const validProviders: AIProvider[] = ['gemini', 'glm', 'openai', 'anthropic', 'mock'];
        if (validProviders.includes(provider)) {
            return provider;
        }
    }
    return 'gemini'; // Default to gemini if nothing valid is stored
};

const getService = () => {
    const provider = getProvider();
    switch (provider) {
        case 'gemini':
            return geminiService;
        case 'glm':
            console.log("Routing to GLM Mock Service");
            return glmMockService;
        case 'openai':
        case 'anthropic':
            console.warn(`Provider "${provider}" is not fully implemented. Using default mock service.`);
            return mockAIService;
        case 'mock':
        default:
            console.log("Routing to Default Mock Service");
            return mockAIService;
    }
};

export const generateWorkflowEmail = async (prospect: Prospect, tone: string, purpose: string, keyPoints?: string): Promise<{ body: string; sources: any[] }> => {
    return getService().generateWorkflowEmail(prospect, tone, purpose, keyPoints);
};

export const generatePersonalizedEmail = async (template: Template, prospect: Prospect, tone: string): Promise<{ body: string; sources: any[] }> => {
    return getService().generatePersonalizedEmail(template, prospect, tone);
};

export const generateProspectIntelligence = async (prospect: Prospect): Promise<{ intelligence: any; sources: any[] }> => {
    return getService().generateProspectIntelligence(prospect);
};

export const generateNextSteps = async (prospect: Prospect): Promise<{ title: string; rationale: string }[]> => {
    return getService().generateNextSteps(prospect);
};

export const findCompaniesAndExecutives = async (city: string, companySize: string, industry: string, count: number, executiveLevel: string): Promise<{ results: Omit<ResearchResult, 'id'>[], sources: any[] }> => {
    return getService().findCompaniesAndExecutives(city, companySize, industry, count, executiveLevel);
};

export const generateOutreachPlan = async (prospect: ResearchResult): Promise<{ plan: any; sources: any[] }> => {
    return getService().generateOutreachPlan(prospect);
};

export const summarizeCallTranscript = async (transcript: string): Promise<{ summary: string; actionItems: string[] }> => {
    return getService().summarizeCallTranscript(transcript);
};

export const generateDashboardBriefing = async (prospects: Prospect[], deals: Deal[]): Promise<{ insights: string[], sources: any[] }> => {
    return getService().generateDashboardBriefing(prospects, deals);
};

export const generateAdHocContent = async (contentType: string, prompt: string): Promise<string> => {
    return getService().generateAdHocContent(contentType, prompt);
};
