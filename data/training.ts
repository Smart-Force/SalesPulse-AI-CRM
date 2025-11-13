import type { TrainingModule, QuizContent } from '../types';

export const initialTrainingModules: TrainingModule[] = [
    // Categories are now top-level modules
    {
        id: 'cat_sales_skills',
        title: 'Sales Skills',
        description: 'Modules focused on core sales methodologies and techniques.',
        resources: [],
        version: 1,
        lastUpdatedAt: new Date().toISOString(),
    },
    {
        id: 'cat_product_knowledge',
        title: 'Product Knowledge',
        description: 'Deep dives into our product suite and value proposition.',
        resources: [],
        version: 1,
        lastUpdatedAt: new Date().toISOString(),
    },
    {
        id: 'cat_onboarding',
        title: 'Onboarding',
        description: 'Essential training for new team members to get up to speed.',
        resources: [],
        version: 1,
        lastUpdatedAt: new Date().toISOString(),
    },

    // Nested Modules
    {
        id: 'mod1',
        title: 'Advanced Selling Techniques',
        parentId: 'cat_sales_skills',
        description: 'Master advanced sales strategies and techniques to close more deals effectively.',
        difficulty: 'Advanced',
        prerequisites: ['mod2'],
        tags: ['closing', 'negotiation', 'enterprise'],
        version: 2,
        lastUpdatedAt: new Date().toISOString(),
        resources: [
            { id: 'res1', type: 'article', title: 'Introduction to Advanced Selling', duration: '5 min read', content: 'res-content-1', relatedPlaybookIds: ['pb2'] },
            { id: 'res2', type: 'video', title: 'Sales Psychology Video', duration: '10 min video', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'res3', type: 'pdf', title: 'Sales Playbook PDF', duration: '15 pages', content: 'res-content-3', pages: 15, fileSize: '2.3 MB', relatedPlaybookIds: ['pb1', 'pb3'] },
            { id: 'res4', type: 'presentation', title: 'Sales Strategy Presentation', duration: '25 slides', content: 'res-content-4', slides: 25, fileSize: '5.1 MB' },
            { id: 'res5', type: 'word', title: 'Sales Script Template', duration: '8 pages', content: 'res-content-5', pages: 8, fileSize: '156 KB' },
            {
                id: 'res6', type: 'quiz', title: 'Final Assessment Quiz', duration: '5 min quiz',
                content: {
                    questions: [
                        { question: "What is most effective closing technique for high-value clients?", options: ["Assumptive close", "Summary close", "Urgency close", "Question close"], correctAnswer: 1 },
                        { question: "How should you handle price objections?", options: ["Immediately offer a discount", "Reinforce value proposition", "Compare with competitors", "Ask about their budget"], correctAnswer: 1 },
                        { question: "What does the 'A' in the AIDA framework stand for?", options: ["Action", "Attention", "Acknowledgement", "Analysis"], correctAnswer: 1 },
                         { question: "When reframing a conversation from price to value, what should you focus on?", options: ["Product features", "Your company's history", "Quantifiable ROI", "Competitor weaknesses"], correctAnswer: 2 },
                         { question: "What is the primary goal of the 'Isolate the Objection' step?", options: ["To prove the prospect wrong", "To end the conversation quickly", "To confirm if price is the only barrier", "To offer a discount immediately"], correctAnswer: 2 }
                    ]
                } as QuizContent
            },
            { id: 'res7', type: 'article', title: 'Mastering Consultative Selling', duration: '7 min read', content: 'res-content-7' }
        ]
    },
    {
        id: 'mod2',
        title: 'Negotiation Mastery',
        parentId: 'cat_sales_skills',
        description: 'Learn effective negotiation strategies to create win-win scenarios.',
        difficulty: 'Intermediate',
        tags: ['negotiation', 'pricing'],
        version: 1,
        lastUpdatedAt: new Date().toISOString(),
        resources: []
    },
    {
        id: 'mod3',
        title: 'Product Suite Overview',
        parentId: 'cat_product_knowledge',
        description: 'Comprehensive product knowledge training for the entire SalesPulse AI platform.',
        difficulty: 'Beginner',
        tags: ['product', 'features'],
        version: 1,
        lastUpdatedAt: new Date().toISOString(),
        resources: []
    },
    {
        id: 'mod4',
        title: 'New Hire Orientation',
        parentId: 'cat_onboarding',
        description: 'Essential training for new team members to get acquainted with our tools and culture.',
        difficulty: 'Beginner',
        version: 1,
        lastUpdatedAt: new Date().toISOString(),
        availability: { from: new Date().toISOString() },
        resources: []
    }
];

export const initialResourceContents: Record<string, string> = {
    'res-content-1': `<div class="prose prose-blue dark:prose-invert max-w-none">
        <h3 class="text-xl font-semibold mb-4">Introduction to Advanced Selling</h3>
        <p class="mb-4">Welcome to Advanced Selling Techniques module. This comprehensive training program will equip you with cutting-edge strategies and methodologies used by top-performing sales professionals worldwide.</p>
        <h4 class="text-lg font-semibold mb-3">Key Learning Objectives:</h4>
        <ul class="list-disc pl-6 mb-4">
            <li>Master consultative selling approaches</li>
            <li>Understand buyer psychology and decision-making processes</li>
            <li>Develop effective objection handling techniques</li>
            <li>Learn advanced closing strategies</li>
            <li>Build long-term client relationships</li>
        </ul>
        <h4 class="text-lg font-semibold mb-3">Getting Started:</h4>
        <p class="mb-4">This module consists of multiple learning resources including articles, videos, documents, and interactive assessments. Each resource is designed to build upon your existing knowledge and introduce new concepts that will enhance your sales performance.</p>
        <p>Let's begin your journey toward sales excellence!</p>
        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 class="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">📚 Ready for more?</h4>
            <p class="text-blue-700 dark:text-blue-300">Continue to next resource to expand your knowledge. Use navigation buttons above or click on resources in sidebar.</p>
        </div>
    </div>`,
    'res-content-3': `<div class="file-preview rounded-lg p-8 text-center"><i class="fas fa-file-pdf text-8xl text-red-600 mb-4"></i><h3 class="text-xl font-semibold mb-2">Sales Playbook PDF</h3><p class="text-gray-600 dark:text-gray-400">15 pages • 2.3 MB</p><button class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"><i class="fas fa-download mr-2"></i>Download PDF</button><button class="ml-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"><i class="fas fa-eye mr-2"></i>Preview</button></div><div class="mt-4"><h3 class="text-lg font-semibold mb-2">Document Information</h3><p class="text-gray-600 dark:text-gray-400">This comprehensive sales playbook covers essential techniques, scripts, and best practices for modern sales professionals.</p></div>`,
    'res-content-4': `<div class="file-preview rounded-lg p-8 text-center"><i class="fas fa-file-powerpoint text-8xl text-orange-500 mb-4"></i><h3 class="text-xl font-semibold mb-2">Sales Strategy Presentation</h3><p class="text-gray-600 dark:text-gray-400">25 slides • 5.1 MB</p><button class="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"><i class="fas fa-download mr-2"></i>Download PPTX</button><button class="ml-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"><i class="fas fa-eye mr-2"></i>Preview Slides</button></div><div class="mt-4"><h3 class="text-lg font-semibold mb-2">Presentation Overview</h3><p class="text-gray-600 dark:text-gray-400">Strategic sales presentation covering market analysis and execution frameworks.</p></div>`,
    'res-content-5': `<div class="file-preview rounded-lg p-8 text-center"><i class="fas fa-file-word text-8xl text-blue-600 mb-4"></i><h3 class="text-xl font-semibold mb-2">Sales Script Template</h3><p class="text-gray-600 dark:text-gray-400">8 pages • 156 KB</p><button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"><i class="fas fa-download mr-2"></i>Download DOCX</button><button class="ml-3 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"><i class="fas fa-edit mr-2"></i>Edit Online</button></div><div class="mt-4"><h3 class="text-lg font-semibold mb-2">Template Description</h3><p class="text-gray-600 dark:text-gray-400">Professional sales script template with customizable sections for different scenarios.</p></div>`,
    'res-content-7': `<div class="prose prose-blue dark:prose-invert max-w-none">
        <h3 class="text-xl font-semibold mb-4">Mastering Consultative Selling: The SPIN Framework</h3>
        <p class="mb-4">SPIN selling is a powerful consultative sales technique that moves the focus from the product to the customer's problems. It's about asking the right questions in the right order to uncover needs and build value. SPIN stands for Situation, Problem, Implication, and Need-Payoff.</p>
        
        <h4 class="text-lg font-semibold mt-6 mb-3">S - Situation Questions</h4>
        <p class="mb-4">These are broad, fact-finding questions to understand the prospect's current context. The goal is to gather background information. Don't ask too many, as the prospect may get bored.</p>
        <ul class="list-disc pl-6 mb-4">
            <li>"What's your current process for managing new leads?"</li>
            <li>"Which tools are your team currently using?"</li>
            <li>"How many people are on your sales team?"</li>
        </ul>

        <h4 class="text-lg font-semibold mt-6 mb-3">P - Problem Questions</h4>
        <p class="mb-4">Once you understand the situation, you can explore potential difficulties or dissatisfactions. These questions help the prospect identify and admit they have a problem you can solve.</p>
        <ul class="list-disc pl-6 mb-4">
            <li>"How satisfied are you with your current lead management system?"</li>
            <li>"What are the biggest challenges you face with your current tools?"</li>
            <li>"Is it difficult to keep track of follow-ups with your current process?"</li>
        </ul>

        <h4 class="text-lg font-semibold mt-6 mb-3">I - Implication Questions</h4>
        <p class="mb-4">These are the most critical questions. They explore the consequences and effects of the problems you've just uncovered, making the prospect feel the pain and urgency more acutely.</p>
        <ul class="list-disc pl-6 mb-4">
            <li>"What's the impact on your team's productivity when a lead is missed?"</li>
            <li>"If you can't track follow-ups effectively, how does that affect your sales forecast accuracy?"</li>
            <li>"How has the time spent on manual data entry affected your team's ability to actually sell?"</li>
        </ul>

        <h4 class="text-lg font-semibold mt-6 mb-3">N - Need-Payoff Questions</h4>
        <p class="mb-4">Finally, these questions get the prospect to state the benefits of your solution themselves. They focus on the value and positive outcomes of solving the problem.</p>
        <ul class="list-disc pl-6 mb-4">
            <li>"If you could automate lead tracking, how would that help you achieve your Q4 targets?"</li>
            <li>"What would it mean for your team if they could save 5 hours a week on manual tasks?"</li>
            <li>"How would having a more accurate sales forecast help your overall business planning?"</li>
        </ul>
        
        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 class="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Key Takeaway</h4>
            <p class="text-blue-700 dark:text-blue-300">By guiding the prospect through this sequence, you help them discover the severity of their own problems and articulate the value of a solution, making your product the obvious choice.</p>
        </div>
    </div>`
};