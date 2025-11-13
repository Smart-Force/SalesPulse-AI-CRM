import React, { useState, useRef, useEffect } from 'react';
import type { StudyGroup, GroupMessage, User } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PlusCircle, Send } from 'lucide-react';

interface CommunityGroupsProps {
    groups: StudyGroup[];
    setGroups: React.Dispatch<React.SetStateAction<StudyGroup[]>>;
    currentUser: User;
    allUsers: User[];
}

export const CommunityGroups: React.FC<CommunityGroupsProps> = ({ groups, setGroups, currentUser, allUsers }) => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const selectedGroup = groups.find(g => g.id === selectedGroupId);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [selectedGroup?.messages]);

    const getUser = (id: string) => allUsers.find(u => u.id === id);
    
    const handleSelectGroup = (groupId: string) => {
        setSelectedGroupId(groupId);
        setIsCreating(false);
        setGroups(prev => prev.map(g => g.id === groupId ? {...g, isNew: false} : g));
    }

    const handleJoinGroup = (groupId: string) => {
        const updatedGroups = groups.map(g => g.id === groupId ? { ...g, memberIds: [...new Set([...g.memberIds, currentUser.id])] } : g);
        setGroups(updatedGroups);
    };

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) return;
        const newGroup: StudyGroup = {
            id: `group-${Date.now()}`, name: newGroupName, description: newGroupDesc, memberIds: [currentUser.id], messages: [], isNew: false
        };
        setGroups(prev => [newGroup, ...prev]);
        setIsCreating(false);
        setNewGroupName('');
        setNewGroupDesc('');
    };

    const handleSendMessage = () => {
        if (!chatMessage.trim() || !selectedGroup) return;
        const newMessage: GroupMessage = { id: `msg-${Date.now()}`, authorId: currentUser.id, timestamp: 'Just now', content: chatMessage };
        setGroups(prev => prev.map(g => g.id === selectedGroup.id ? {...g, messages: [...g.messages, newMessage]} : g));
        setChatMessage('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-22rem)]">
            <Card className="lg:col-span-1 h-full flex flex-col">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Study Groups</CardTitle>
                    <button onClick={() => {setIsCreating(true); setSelectedGroupId(null);}} className="text-blue-600 hover:text-blue-800"><PlusCircle/></button>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    <div className="space-y-2">
                        {groups.map(group => (
                            <div key={group.id} onClick={() => handleSelectGroup(group.id)} className={`p-3 border rounded-lg cursor-pointer dark:border-slate-700 flex justify-between items-start ${selectedGroupId === group.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-slate-100">{group.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{group.memberIds.length} members</p>
                                </div>
                                {group.isNew && <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" title="New messages"></div>}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 h-full flex flex-col">
                {isCreating ? (
                    <><CardHeader><CardTitle>Create New Group</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><label className="text-sm font-medium">Group Name</label><input value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/></div>
                        <div><label className="text-sm font-medium">Description</label><textarea value={newGroupDesc} onChange={e=>setNewGroupDesc(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" rows={3}/></div>
                        <button onClick={handleCreateGroup} className="px-4 py-2 bg-blue-600 text-white rounded-md">Create Group</button>
                    </CardContent></>
                ) : selectedGroup ? (
                    <div className="flex flex-col h-full">
                        <CardHeader>
                            <CardTitle>{selectedGroup.name}</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{selectedGroup.description}</p>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50">
                            {selectedGroup.messages.map(msg => {
                                const author = getUser(msg.authorId);
                                const isCurrentUser = author?.id === currentUser.id;
                                return (
                                    <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                                        {!isCurrentUser && (
                                            <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{backgroundColor: author?.avatarColor}}>{author?.initials}</div>
                                        )}
                                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 rounded-bl-none'}`}>
                                            {!isCurrentUser && <p className="font-semibold text-xs mb-1 text-blue-600 dark:text-blue-400">{author?.name}</p>}
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500 dark:text-slate-400'}`}>{msg.timestamp}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={chatEndRef} />
                        </CardContent>
                        {selectedGroup.memberIds.includes(currentUser.id) ? (
                             <div className="p-4 border-t dark:border-slate-700 flex gap-2">
                                <input value={chatMessage} onChange={e=>setChatMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-grow p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                <button onClick={handleSendMessage} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex-shrink-0"><Send/></button>
                            </div>
                        ) : (
                            <div className="p-4 border-t dark:border-slate-700 text-center">
                                <button onClick={() => handleJoinGroup(selectedGroup.id)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Join Group to Chat</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-slate-400">Select a group or create a new one.</div>
                )}
            </Card>
        </div>
    );
};
