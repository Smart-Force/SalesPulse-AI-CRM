import type { Template, Prospect, ResearchResult, Deal } from '../types';

const simulateDelay = () => new Promise(res => setTimeout(res, 750));

export const generateWorkflowEmail = async (prospect: Prospect, tone: string, purpose: string, keyPoints?: string): Promise<{ body: string; sources: any[] }> => {
    console.log('--- Using Mock AI Service for generateWorkflowEmail ---');
    await simulateDelay();
    const body = `
        <p>Hi ${prospect.name.split(' ')[0]},</p>
        <p>This is a <strong>mock AI-generated email</strong> with a ${tone.toLowerCase()} tone.</p>
        <p>Its purpose is to: <em>${purpose}</em>.</p>
        ${keyPoints ? `<p>It also incorporates these key points: ${keyPoints}</p>`: ''}
        <p>This was generated for you at ${prospect.company}.</p>
    `;
    return { body, sources: [{ web: { uri: '#mock', title: 'Mock Web Source' } }] };
};

export const generatePersonalizedEmail = async (template: Template, prospect: Prospect, tone: string): Promise<{ body: string; sources: any[] }> => {
    console.log('--- Using Mock AI Service for generatePersonalizedEmail ---');
    await simulateDelay();
    const body = `
      <p>Hi ${prospect.name.split(' ')[0]},</p>
      <p>This is a mock personalized email with a <strong>${tone}</strong> tone. I see you work at ${prospect.company}.</p>
      <p>We noticed your mock achievement of launching a new website and thought our services could help with the mock pain point of scaling customer support.</p>
      <p>Let's connect!</p>
    `;
    return { body, sources: [{ web: { uri: '#mock', title: 'Mock Web Source' } }] };
};

export const generateProspectIntelligence = async (prospect: Prospect): Promise<{ intelligence: any; sources: any[] }> => {
    console.log('--- Using Mock AI Service for generateProspectIntelligence ---');
    await simulateDelay();
    const intelligence = {
        communicationStyle: "Direct & Data-focused (Mock)",
        motivations: ["Mock Motivation 1: Improving team ROI", "Mock Motivation 2: Career advancement"],
        painPoints: ["Mock Pain Point 1: Inefficient workflows", "Mock Pain Point 2: Lack of clear data"],
        recentNews: [`Mock News: ${prospect.company} announced a fictional new product line.`],
        companyDescription: `A mock description for ${prospect.company}.`,
        contactHistory: [
            { date: 'A week ago', type: 'Email', outcome: 'Mock: Sent intro email, no reply.', aiInsight: 'Mock Insight: Follow up with a value-add.' },
            { date: '2 weeks ago', type: 'Call', outcome: 'Mock: Left voicemail.', aiInsight: 'Mock Insight: High chance of no response.' },
        ]
    };
    return { intelligence, sources: [{ web: { uri: '#mock', title: 'Mock Web Source' } }] };
};

export const generateNextSteps = async (prospect: Prospect): Promise<{ title: string; rationale: string }[]> => {
    console.log('--- Using Mock AI Service for generateNextSteps ---');
    await simulateDelay();
    return [
        { title: 'Mock Step 1: Send Follow-up Email', rationale: 'Because it has been a week since the last contact.' },
        { title: 'Mock Step 2: Connect on LinkedIn', rationale: 'To build a professional connection.' },
    ];
};

export const findCompaniesAndExecutives = async (city: string, companySize: string, industry: string, count: number, executiveLevel: string): Promise<{ results: Omit<ResearchResult, 'id'>[], sources: any[] }> => {
    console.log('--- Using Mock AI Service for findCompaniesAndExecutives ---');
    await simulateDelay();
    const results = Array.from({ length: count }, (_, i) => ({
        companyName: `MockCo ${i + 1} [${industry}]`,
        industry: industry,
        hqAddress: `123 Mock St, ${city}`,
        employeeCount: `${Math.floor(Math.random() * 200) + 10}`,
        companySize: companySize,
        annualRevenue: `$${Math.floor(Math.random() * 50) + 5}M`,
        website: `https://mockco${i+1}.com`,
        mainPhone: '555-010' + i,
        yearFounded: 2010 + i,
        executiveName: `Mock Person ${i + 1}`,
        executivePosition: executiveLevel,
        executiveEmail: `mock.person${i+1}@mockco.com`,
        directPhone: '555-020' + i,
        linkedInProfile: 'https://linkedin.com/in/mock-profile',
        dataConfidenceScore: 8,
    }));
    return { results, sources: [{ web: { uri: '#mock', title: 'Mock Web Source' } }] };
};

export const generateOutreachPlan = async (prospect: ResearchResult): Promise<{ plan: any; sources: any[] }> => {
    console.log('--- Using Mock AI Service for generateOutreachPlan ---');
    await simulateDelay();
    const plan = {
        recommendedProducts: ["Mock Product A", "Mock Product B"],
        talkingPoints: ["Mock Talking Point: Mention their recent funding.", "Mock Talking Point: Address their hiring surge."],
        personalizedEmail: `Hi ${prospect.executiveName}, This is a mock email for ${prospect.companyName}. Let's talk!`,
        linkedinMessage1: "Mock LinkedIn connection message.",
        linkedinMessage2: "Mock LinkedIn follow-up 1.",
        linkedinMessage3: "Mock LinkedIn follow-up 2.",
    };
    return { plan, sources: [{ web: { uri: '#mock', title: 'Mock Web Source' } }] };
};

export const summarizeCallTranscript = async (transcript: string): Promise<{ summary: string; actionItems: string[] }> => {
    console.log('--- Using Mock AI Service for summarizeCallTranscript ---');
    await simulateDelay();
    return {
        summary: "This is a mock summary of the call. The prospect showed interest in pricing and scalability.",
        actionItems: [
            "Mock Action: Send follow-up email with pricing details.",
            "Mock Action: Schedule a technical deep-dive call.",
        ],
    };
};

export const generateDashboardBriefing = async (prospects: Prospect[], deals: Deal[]): Promise<{ insights: string[], sources: any[] }> => {
    console.log('--- Using Mock AI Service for generateDashboardBriefing ---');
    await simulateDelay();
    const insights = [
        "You have 2 new prospects that need to be contacted.",
        "The deal with InnovateCorp seems to be stalled. Consider a follow-up.",
        "A meeting with Emma Davis is scheduled for next week. Time to prepare!"
    ];
    return { insights, sources: [] };
};

export const generateAdHocContent = async (contentType: string, prompt: string): Promise<string> => {
    console.log('--- Using Mock AI Service for generateAdHocContent ---');
    await simulateDelay();
    return `This is a MOCK generated ${contentType} based on your prompt:\n\n"${prompt}"\n\nIt demonstrates how the AI Generator feature works without using real API calls.`;
};