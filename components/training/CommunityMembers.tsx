import React, { useState, useMemo } from 'react';
import type { User, TrainingModule } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Search, Star, UserCheck, X } from 'lucide-react';

interface CommunityMembersProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    trainingModules: TrainingModule[];
    currentUser: User;
}

const ProgressRing = ({ progress }: { progress: number }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    return (
        <div className="relative h-14 w-14">
            <svg className="h-full w-full" width="60" height="60" viewBox="0 0 60 60">
                <circle className="text-slate-200 dark:text-slate-700" strokeWidth="4" stroke="currentColor" fill="transparent" r={radius} cx="30" cy="30" />
                <circle
                    className="text-blue-600 progress-ring-circle"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="30"
                    cy="30"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{Math.round(progress)}%</span>
        </div>
    );
};

const UserProfileModal: React.FC<{ user: User; onClose: () => void; trainingModules: TrainingModule[] }> = ({ user, onClose, trainingModules }) => {
    
    const { completedResources, progress } = useMemo(() => {
        const totalResources = trainingModules.reduce((acc, m) => acc + m.resources.length, 0);
        if (!user.trainingProgress || totalResources === 0) {
            return { completedResources: [], progress: 0 };
        }
        
        const completedIds = new Set(Object.keys(user.trainingProgress));
        const resources = trainingModules.flatMap(m => 
            m.resources.filter(r => completedIds.has(r.id)).map(r => ({ ...r, moduleTitle: m.title }))
        );
        
        const progressPercentage = (resources.length / totalResources) * 100;
        
        return { completedResources: resources, progress: progressPercentage };
    }, [user, trainingModules]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">User Profile</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><X className="h-5 w-5"/></button>
                </div>
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="flex-shrink-0 flex flex-col items-center">
                            <div className="h-28 w-28 rounded-full flex items-center justify-center text-white text-5xl font-bold" style={{backgroundColor: user.avatarColor}}>{user.initials}</div>
                            {user.isMentor && <span className="mt-3 text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 flex items-center"><Star className="h-4 w-4 mr-1.5"/>Mentor</span>}
                            {user.isSeekingMentorship && <span className="mt-3 text-sm px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 flex items-center"><UserCheck className="h-4 w-4 mr-1.5"/>Seeking Mentor</span>}
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                            <h2 className="text-3xl font-bold">{user.name}</h2>
                            <p className="text-gray-500 dark:text-slate-400 text-lg">{user.role}</p>
                            
                            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center gap-4">
                                <ProgressRing progress={progress} />
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-slate-200">Learning Progress</h4>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">{completedResources.length} of {trainingModules.reduce((acc, m) => acc + m.resources.length, 0)} resources completed.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 border-t dark:border-slate-700 pt-4">
                        <h4 className="font-semibold mb-2">Completed Training</h4>
                        {completedResources.length > 0 ? (
                            <ul className="space-y-2 max-h-40 overflow-y-auto">
                                {completedResources.map(res => <li key={res.id} className="text-sm p-2 rounded-md bg-slate-100 dark:bg-slate-700/50"><strong>{res.title}</strong> <span className="text-xs text-gray-500">({res.moduleTitle})</span></li>)}
                            </ul>
                        ) : <p className="text-sm text-gray-500 italic">No training completed yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CommunityMembers: React.FC<CommunityMembersProps> = ({ users, setUsers, trainingModules, currentUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'mentors' | 'mentees'>('all');
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;
            if (filter === 'mentors' && !user.isMentor) return false;
            if (filter === 'mentees' && !user.isSeekingMentorship) return false;
            return true;
        });
    }, [users, searchTerm, filter]);

    const toggleStatus = (statusType: 'isMentor' | 'isSeekingMentorship') => {
        setUsers(prev => prev.map(u => u.id === currentUser.id ? {...u, [statusType]: !u[statusType]} : u));
    };

    return (
        <div>
            {viewingUser && <UserProfileModal user={viewingUser} onClose={() => setViewingUser(null)} trainingModules={trainingModules} />}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                            <input type="text" placeholder="Search members..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-sm rounded-md ${filter==='all' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>All</button>
                            <button onClick={() => setFilter('mentors')} className={`px-3 py-1.5 text-sm rounded-md ${filter==='mentors' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Mentors</button>
                            <button onClick={() => setFilter('mentees')} className={`px-3 py-1.5 text-sm rounded-md ${filter==='mentees' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Mentees</button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="p-4 border rounded-lg dark:border-slate-700 flex flex-col items-center text-center transition-shadow hover:shadow-md">
                                <div className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2" style={{backgroundColor: user.avatarColor}}>{user.initials}</div>
                                <h4 className="font-semibold text-gray-900 dark:text-slate-100">{user.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-slate-400">{user.role}</p>
                                <div className="flex gap-2 mt-2 h-6">
                                    {user.isMentor && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 flex items-center"><Star className="h-3 w-3 mr-1"/>Mentor</span>}
                                    {user.isSeekingMentorship && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 flex items-center"><UserCheck className="h-3 w-3 mr-1"/>Seeking Mentor</span>}
                                </div>
                                <button onClick={() => setViewingUser(user)} className="mt-4 text-sm font-semibold text-blue-600 hover:underline">View Profile</button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
