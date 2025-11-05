import type { Template } from '../types';

export const templates: Template[] = [
    {
        id: 't1',
        name: 'Initial Outreach - Feature Intro',
        subject: 'Idea for {{company}}',
        body: `
<p>Hi {{first_name}},</p>
<p>I was impressed to see that {{company}} recently {{recent_achievement}}. {{personal_insight}}</p>
<p>Many leaders in your position often struggle with {{specific_pain_point}}. At SalesPulse, we help you overcome this with {{primary_service}}, which provides real-time insights to streamline your workflow.</p>
<p>Would you be open to a brief 15-minute call next week to explore how this could specifically benefit {{company}}?</p>
<p>Best regards,</p>
`
    },
    {
        id: 't2',
        name: 'Follow-up After No Reply',
        subject: 'Re: Idea for {{company}}',
        body: `
<p>Hi {{first_name}},</p>
<p>Just wanted to quickly follow up on my previous email regarding {{primary_service}}.</p>
<p>Given your role at {{company}}, tackling {{specific_pain_point}} is likely a priority. Our platform has helped similar companies achieve a 20% increase in productivity within the first quarter.</p>
<p>Is this something that aligns with your current goals?</p>
<p>Best,</p>
`
    },
     {
        id: 't3',
        name: 'Value Proposition Angle',
        subject: 'A different approach to your sales process',
        body: `
<p>Hi {{first_name}},</p>
<p>Congratulations on {{recent_achievement}}! It's clear that {{company}} is a leader in your space.</p>
<p>As you continue to innovate, the challenge of {{specific_pain_point}} can become a significant bottleneck. I believe {{primary_service}} could offer a unique solution by {{service_rationale}}.</p>
<p>We've helped others in your industry save an average of 10 hours per week. If that's a priority for you, I'd be happy to share how.</p>
<p>Thanks,</p>
`
    },
];
