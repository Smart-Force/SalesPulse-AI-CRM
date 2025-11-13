import React, { useState, useMemo } from 'react';
import type { User, TrainingModule, DiscussionThread, StudyGroup } from '../../types';
import { Users, MessageSquare, Briefcase } from 'lucide-react';
import { CommunityMembers } from './CommunityMembers';
import { CommunityDiscussions } from './CommunityDiscussions';
import { CommunityGroups } from './CommunityGroups';

interface CommunityProps {
    currentUser: User;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    trainingModules: TrainingModule[];
    discussionThreads: DiscussionThread[];
    setDiscussionThreads: React.Dispatch<React.SetStateAction<DiscussionThread[]>>;
    studyGroups: StudyGroup[];
    setStudyGroups: React.Dispatch<React.SetStateAction<StudyGroup[]>>;
}

type CommunityTab = 'members' | 'discussions' | 'groups';

export const Community: React.FC<CommunityProps> = (props) => {
    const [activeTab, setActiveTab] = useState<CommunityTab>('members');

    const newDiscussionsCount = useMemo(() => props.discussionThreads.filter(t => t.isNew).length, [props.discussionThreads]);
    const newGroupsCount = useMemo(() => props.studyGroups.filter(g => g.isNew).length, [props.studyGroups]);

    const tabs: { id: CommunityTab; name: string; icon: React.ElementType; notificationCount: number }[] = [
        { id: 'members', name: 'Members', icon: Users, notificationCount: 0 },
        { id: 'discussions', name: 'Discussions', icon: MessageSquare, notificationCount: newDiscussionsCount },
        { id: 'groups', name: 'Study Groups', icon: Briefcase, notificationCount: newGroupsCount },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'members':
                return <CommunityMembers users={props.users} setUsers={props.setUsers} trainingModules={props.trainingModules} currentUser={props.currentUser} />;
            case 'discussions':
                return <CommunityDiscussions threads={props.discussionThreads} setThreads={props.setDiscussionThreads} users={props.users} modules={props.trainingModules} currentUser={props.currentUser} />;
            case 'groups':
                return <CommunityGroups groups={props.studyGroups} setGroups={props.setStudyGroups} currentUser={props.currentUser} allUsers={props.users} />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center ${
                                    activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                <tab.icon className="mr-2 h-5 w-5" />
                                {tab.name}
                                {tab.notificationCount > 0 && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">{tab.notificationCount}</span>}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            <div>
                {renderContent()}
            </div>
        </div>
    );
};
