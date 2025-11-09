import type { Playbook } from '../types';

export const playbooks: Playbook[] = [
    {
        id: 'pb1',
        title: 'Handling Price Objections',
        category: 'Objection Handling',
        description: 'A step-by-step guide to confidently address and overcome pricing concerns from prospects.',
        content: `
            <h2>Understanding the "It's too expensive" Objection</h2>
            <p>This is rarely about the actual price. It's usually a stand-in for one of these underlying issues:</p>
            <ul>
                <li><strong>Value Mismatch:</strong> They don't see how the value justifies the cost.</li>
                <li><strong>Budget Constraints:</strong> They genuinely don't have the budget allocated right now.</li>
                <li><strong>Sticker Shock:</strong> The price is simply higher than they expected.</li>
                <li><strong>Stalling Tactic:</strong> They aren't convinced and are using price as an easy out.</li>
            </ul>
            <hr class="my-4">
            <h3>Step 1: Acknowledge and Validate</h3>
            <p>Never get defensive. Start by showing you understand their concern.</p>
            <blockquote>"I understand. It's important to make sure the investment makes sense for your budget."</blockquote>
            <h3>Step 2: Isolate the Objection</h3>
            <p>Clarify if price is the *only* issue. This uncovers the real problem.</p>
            <blockquote>"Putting price aside for a moment, does our solution seem like it solves the challenges we discussed?"</blockquote>
            <h3>Step 3: Reframe the Conversation Around Value & ROI</h3>
            <p>Shift the focus from cost to investment and return. Use quantifiable metrics.</p>
            <blockquote>"I hear you. Let's revisit the impact this could have. We talked about saving 10 hours per week for your team of 5. At their average salary, that's an ROI of over $X per month. How does that compare to the monthly cost?"</blockquote>
            <h3>Step 4: Offer Solutions (If Necessary)</h3>
            <p>Only after reinforcing value, consider these options:</p>
            <ul>
                <li><strong>Payment Terms:</strong> "Can we explore different payment schedules, like quarterly billing, to make it more manageable?"</li>
                <li><strong>Phased Rollout:</strong> "What if we started with a smaller package for just the core team to prove the value first?"</li>
                <li><strong>Discounting (Last Resort):</strong> Only offer a discount in exchange for something (e.g., a case study, a referral, longer contract term).</li>
            </ul>
        `
    },
    {
        id: 'pb2',
        title: 'Cold Email Strategy',
        category: 'Outreach',
        description: 'Best practices for writing cold emails that actually get replies.',
        content: `
            <h2>The AIDA Framework for Cold Emails</h2>
            <p>Structure your emails to grab attention and drive action.</p>
            <ol>
                <li><strong>Attention:</strong> A compelling, personalized subject line and opening sentence.</li>
                <li><strong>Interest:</strong> Show you've done your research and connect their problem to your solution.</li>
                <li><strong>Desire:</strong> Highlight the benefits and paint a picture of their success with your product.</li>
                <li><strong>Action:</strong> A clear, low-friction call-to-action (CTA).</li>
            </ol>
            <hr class="my-4">
            <h3>Example Subject Lines</h3>
            <ul>
                <li>Idea for {{company}}</li>
                <li>Question about your [specific department]</li>
                <li>[Referral Name] suggested I reach out</li>
            </ul>
            <h3>The Call-to-Action</h3>
            <p>Avoid "Are you free to chat?". Instead, use an interest-based CTA:</p>
            <blockquote>"Would you be open to learning more about how we helped [Similar Company] achieve [Result]?"</blockquote>
        `
    },
    {
        id: 'pb3',
        title: 'Closing Techniques',
        category: 'Deal Management',
        description: 'Effective and ethical techniques to move a deal from proposal to closed-won.',
        content: `
            <h2>1. The Assumptive Close</h2>
            <p>Act as if the prospect has already decided to buy. This projects confidence.</p>
            <blockquote>"Based on our conversation, it seems our Premium Plan is the best fit. Shall I send over the agreement with those terms?"</blockquote>
            
            <h2>2. The Summary Close</h2>
            <p>Recap the agreed-upon benefits and value points before asking for the sale. This reinforces their decision.</p>
            <blockquote>"So, we've agreed that our platform will help you reduce manual data entry by 50% and increase forecast accuracy, which will save you an estimated $20,000 this year. With that in mind, are you ready to move forward?"</blockquote>

            <h2>3. The "If-Then" Close</h2>
            <p>Use this to handle final hurdles or requests. It secures a commitment based on a condition.</p>
            <blockquote>"If I can get approval for a 10% discount on the annual plan, would you be able to sign the agreement by this Friday?"</blockquote>
        `
    }
];