import type { Template, Prospect, ResearchResult, Deal } from '../types';

const simulateDelay = () => new Promise(res => setTimeout(res, 600));

export const generateWorkflowEmail = async (prospect: Prospect, tone: string, purpose: string, keyPoints?: string): Promise<{ body: string; sources: any[] }> => {
    console.log('--- Using GLM Mock AI Service for generateWorkflowEmail ---');
    await simulateDelay();
    const body = `
        <p>Greetings ${prospect.name.split(' ')[0]},</p>
        <p>This is a <strong>GLM mock AI-generated email</strong> with a ${tone.toLowerCase()} tone.</p>
        <p>The primary objective is: <em>${purpose}</em>.</p>
        ${keyPoints ? `<p>Key discussion points: ${keyPoints}</p>`: ''}
        <p>We are aware of your role at ${prospect.company}.</p>
    `;
    return { body, sources: [{ web: { uri: '#glm-mock', title: 'GLM Mock Web Source' } }] };
};

export const generatePersonalizedEmail = async (template: Template, prospect: Prospect, tone: string): Promise<{ body: string; sources: any[] }> => {
    console.log('--- Using GLM (Zhipu AI) Mock Service for generatePersonalizedEmail ---');
    await simulateDelay();
    const body = `
      <p>Dear ${prospect.name.split(' ')[0]},</p>
      <p>This is a mock personalized email from GLM with a <strong>${tone}</strong> tone. We are aware you are the ${prospect.title} at ${prospect.company}.</p>
      <p>Our mock research indicates your company recently achieved a major milestone. We believe our solutions can address the mock challenge of integrating new systems.</p>
      <p>We would be delighted to discuss this further.</p>
    `;
    return { body, sources: [{ web: { uri: '#glm-mock', title: 'GLM Mock Web Source' } }] };
};

export const generateProspectIntelligence = async (prospect: Prospect): Promise<{ intelligence: any; sources: any[] }> => {
    console.log('--- Using GLM (Zhipu AI) Mock Service for generateProspectIntelligence ---');
    await simulateDelay();
    const intelligence = {
        communicationStyle: "Formal & Detailed (GLM Mock)",
        motivations: ["GLM Mock Motivation: Market expansion", "GLM Mock Motivation: Technological innovation"],
        painPoints: ["GLM Mock Pain Point: Data siloing", "GLM Mock Pain Point: International scaling"],
        recentNews: [`GLM Mock News: ${prospect.company} is expanding into a new market.`],
        companyDescription: `A GLM mock description for ${prospect.company}.`,
        contactHistory: [
            { date: 'Last month', type: 'Meeting', outcome: 'GLM Mock: Product demo was well-received.', aiInsight: 'GLM Mock Insight: Focus on the enterprise features they liked.' },
        ]
    };
    return { intelligence, sources: [{ web: { uri: '#glm-mock', title: 'GLM Mock Web Source' } }] };
};

export const generateNextSteps = async (prospect: Prospect): Promise<{ title: string; rationale: string }[]> => {
    console.log('--- Using GLM (Zhipu AI) Mock Service for generateNextSteps ---');
    await simulateDelay();
    return [
        { title: 'GLM Mock Step: Send a formal proposal', rationale: 'To follow up on the positive demo feedback.' },
        { title: 'GLM Mock Step: Schedule a technical deep-dive', rationale: 'To address their engineering team\'s questions.' },
    ];
};

export const findCompaniesAndExecutives = async (city: string, companySize: string, industry: string, count: number, executiveLevel: string): Promise<{ results: Omit<ResearchResult, 'id'>[], sources: any[] }> => {
    console.log('--- Using GLM (Zhipu AI) Mock Service for findCompaniesAndExecutives ---');
    await simulateDelay();
    const results = Array.from({ length: count }, (_, i) => ({
        companyName: `GLM MockCorp ${i + 1} [${industry}]`,
        industry: industry,
        hqAddress: `456 GLM Ave, ${city}`,
        employeeCount: `${Math.floor(Math.random() * 500) + 50}`,
        companySize: companySize,
        annualRevenue: `$${Math.floor(Math.random() * 100) + 20}M`,
        website: `https://glmockcorp${i+1}.com`,
        mainPhone: '555-030' + i,
        yearFounded: 2005 + i,
        executiveName: `GLM Executive ${i + 1}`,
        executivePosition: executiveLevel,
        executiveEmail: `glm.exec${i+1}@glmockcorp.com`,
        directPhone: '555-040' + i,
        linkedInProfile: 'https://linkedin.com/in/glm-mock-profile',
        dataConfidenceScore: 9,
    }));
    return { results, sources: [{ web: { uri: '#glm-mock', title: 'GLM Mock Web Source' } }] };
};

export const generateOutreachPlan = async (prospect: ResearchResult): Promise<{ plan: any; sources: any[] }> => {
    console.log('--- Using GLM (Zhipu AI) Mock Service for generateOutreachPlan ---');
    await simulateDelay();
    const plan = {
        recommendedProducts: ["GLM Enterprise Suite", "GLM Analytics"],
        talkingPoints: ["GLM Mock Talking Point: Emphasize scalability.", "GLM Mock Talking Point: Highlight security compliance."],
        personalizedEmail: `Greetings ${prospect.executiveName}, This is a GLM mock email for ${prospect.companyName}. I have a proposal for you.`,
        linkedinMessage1: "GLM LinkedIn connection request.",
        linkedinMessage2: "GLM LinkedIn value proposition message.",
        linkedinMessage3: "GLM LinkedIn final follow-up.",
    };
    return { plan, sources: [{ web: { uri: '#glm-mock', title: 'GLM Mock Web Source' } }] };
};

export const summarizeCallTranscript = async (transcript: string): Promise<{ summary: string; actionItems: string[] }> => {
    console.log('--- Using GLM (Zhipu AI) Mock Service for summarizeCallTranscript ---');
    await simulateDelay();
    return {
        summary: "GLM Mock Summary: The conversation covered key business objectives. The prospect is evaluating solutions for Q4.",
        actionItems: [
            "GLM Mock Action: Prepare a formal proposal based on discussed requirements.",
            "GLM Mock Action: Follow up in 2 days to confirm receipt of proposal.",
        ],
    };
};

// FIX: Add missing generateDashboardBriefing function to resolve error in aiService.
export const generateDashboardBriefing = async (prospects: Prospect[], deals: Deal[]): Promise<{ insights: string[], sources: any[] }> => {
    console.log('--- Using GLM Mock AI Service for generateDashboardBriefing ---');
    await simulateDelay();
    const insights = [
        "GLM Mock: You have several new prospects that have not been contacted.",
        "GLM Mock: A key deal requires your immediate attention for follow-up.",
    ];
    return { insights, sources: [] };
};

// FIX: Add missing generateAdHocContent function to resolve error in aiService.
export const generateAdHocContent = async (contentType: string, prompt: string): Promise<string> => {
    console.log('--- Using GLM Mock AI Service for generateAdHocContent ---');
    await simulateDelay();
    return `This is a MOCK response from the GLM service for a ${contentType}:\n\nYour prompt was: "${prompt}"\n\nThis demonstrates the GLM provider functionality without using real API calls.`;
};