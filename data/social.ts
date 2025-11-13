import type { DiscussionThread, StudyGroup } from '../types';

export const initialDiscussionThreads: DiscussionThread[] = [
    {
        id: 'thread1',
        moduleId: 'mod1',
        title: 'Question about the "Summary Close" technique',
        authorId: 'user3', // Bob Williams
        timestamp: '2 days ago',
        content: "In the playbook, it mentions the summary close. Has anyone had success with this in a real-world scenario? I feel like it could come across as a bit pushy.",
        replies: [
            { id: 'reply1', authorId: 'user2', timestamp: '1 day ago', content: "Great question, Bob! I use it all the time. The trick is to make it sound like a natural confirmation of what you've both agreed on, not a closing script. Frame it as 'Just to make sure we're on the same page...'. That usually works well." },
            { id: 'reply2', authorId: 'user1', timestamp: '22 hours ago', content: "I agree with Alice. It's all about the delivery. If your tone is collaborative, it feels like a partnership." },
        ],
        isNew: false,
    },
    {
        id: 'thread2',
        moduleId: 'mod1',
        title: 'Best way to use the Sales Script Template?',
        authorId: 'user2', // Alice
        timestamp: '5 days ago',
        content: "I've downloaded the script template, but I'm wondering how everyone adapts it without sounding like a robot. Any tips for keeping it natural?",
        replies: [],
        isNew: true, // For notification badge
    }
];

export const initialStudyGroups: StudyGroup[] = [
    {
        id: 'group1',
        name: 'Q4 Enterprise Closers',
        description: 'A group focused on closing large deals in the last quarter of the year.',
        memberIds: ['user1', 'user2', 'user3'],
        messages: [
            {id: 'msg1', authorId: 'user2', timestamp: '1 hour ago', content: "Hey John, did you see the new playbook on objection handling? The price objection section is pure gold."},
            {id: 'msg2', authorId: 'user1', timestamp: '55 minutes ago', content: "Just read it! Going to try the 'isolate the objection' technique on my call with InnovateCorp tomorrow."},
             {id: 'msg3', authorId: 'user2', timestamp: '30 minutes ago', content: "Let me know how it goes! I'm curious to see their reaction."},
        ],
        isNew: true, // For notification badge
    },
    {
        id: 'group2',
        name: 'New Hire Cohort - July',
        description: 'Study group for new members who joined in July.',
        memberIds: ['user3'],
        messages: []
    }
];
