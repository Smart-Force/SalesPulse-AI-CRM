import React, { useState, useMemo } from 'react';
import type { DiscussionThread, DiscussionReply, User, TrainingModule } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PlusCircle, Send } from 'lucide-react';

interface CommunityDiscussionsProps {
    threads: DiscussionThread[];
    setThreads: React.Dispatch<React.SetStateAction<DiscussionThread[]>>;
    users: User[];
    modules: TrainingModule[];
    currentUser: User;
}

export const CommunityDiscussions: React.FC<CommunityDiscussionsProps> = ({ threads, setThreads, users, modules, currentUser }) => {
    const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
    const [viewingThreadId, setViewingThreadId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [newThread, setNewThread] = useState<{ title: string; content: string } | null>(null);

    const viewingThread = useMemo(() => threads.find(t => t.id === viewingThreadId), [threads, viewingThreadId]);

    const filteredThreads = useMemo(() => {
        const sortedThreads = [...threads].sort((a, b) => (b.isNew ? 1 : -1) - (a.isNew ? -1 : 1));
        if (selectedModuleId === 'all') return sortedThreads;
        return sortedThreads.filter(t => t.moduleId === selectedModuleId)
    }, [threads, selectedModuleId]);

    const getUser = (id: string) => users.find(u => u.id === id);

    const handleViewThread = (threadId: string) => {
        setViewingThreadId(threadId);
        setThreads(prev => prev.map(t => t.id === threadId ? {...t, isNew: false} : t));
    };

    const handlePostReply = () => {
        if (!replyContent.trim() || !viewingThread) return;
        const newReply: DiscussionReply = { id: `reply-${Date.now()}`, authorId: currentUser.id, timestamp: 'Just now', content: replyContent };
        setThreads(prev => prev.map(t => t.id === viewingThread.id ? { ...t, replies: [...t.replies, newReply] } : t));
        setReplyContent('');
    };
    
    const handlePostThread = () => {
        if (!newThread || !newThread.title.trim() || !newThread.content.trim() || selectedModuleId === 'all') {
            alert("Please select a specific module and fill out all fields.");
            return;
        }
        const newThreadData: DiscussionThread = { id: `thread-${Date.now()}`, moduleId: selectedModuleId, ...newThread, authorId: currentUser.id, timestamp: 'Just now', replies: [], isNew: false };
        setThreads(prev => [newThreadData, ...prev]);
        setNewThread(null);
    };

    if (viewingThread) {
        const author = getUser(viewingThread.authorId);
        return (
            <Card>
                <CardHeader>
                    <button onClick={() => setViewingThreadId(null)} className="text-sm font-semibold text-blue-600 hover:underline mb-2">&larr; Back to threads</button>
                    <CardTitle>{viewingThread.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-400 mt-1">
                        <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2" style={{backgroundColor: author?.avatarColor}}>{author?.initials}</div>
                        <strong>{author?.name}</strong><span className="mx-1">&bull;</span><span>{viewingThread.timestamp}</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="border-b pb-4 mb-4 dark:border-slate-700 whitespace-pre-wrap">{viewingThread.content}</p>
                    <h4 className="font-semibold mb-4 text-gray-800 dark:text-slate-200">Replies ({viewingThread.replies.length})</h4>
                    <div className="space-y-6">
                        {viewingThread.replies.map(reply => {
                            const replyAuthor = getUser(reply.authorId);
                            return (
                                <div key={reply.id} className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{backgroundColor: replyAuthor?.avatarColor}}>{replyAuthor?.initials}</div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">{replyAuthor?.name} <span className="font-normal text-xs text-gray-500 dark:text-slate-400">&bull; {reply.timestamp}</span></p>
                                        <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{reply.content}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="mt-8 pt-4 border-t dark:border-slate-700">
                        <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Write a reply..." rows={3} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                        <button onClick={handlePostReply} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold flex items-center hover:bg-blue-700"><Send className="h-4 w-4 mr-2"/>Post Reply</button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (newThread) {
         return (
            <Card><CardHeader>
                <button onClick={() => setNewThread(null)} className="text-sm font-semibold text-blue-600 mb-2">&larr; Cancel</button>
                <CardTitle>Start New Discussion</CardTitle>
            </CardHeader><CardContent className="space-y-4">
                 <div><label className="text-sm font-medium">Module</label><select value={selectedModuleId} onChange={e => setSelectedModuleId(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"><option value="all" disabled>Select a module</option>{modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
                <div><label className="text-sm font-medium">Title</label><input type="text" value={newThread.title} onChange={e => setNewThread({...newThread, title: e.target.value})} className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600"/></div>
                <div><label className="text-sm font-medium">Content</label><textarea value={newThread.content} onChange={e => setNewThread({...newThread, content: e.target.value})} rows={5} className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600"/></div>
                <button onClick={handlePostThread} className="px-4 py-2 bg-blue-600 text-white rounded-md">Post Thread</button>
            </CardContent></Card>
         );
    }

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <select value={selectedModuleId} onChange={e => setSelectedModuleId(e.target.value)} className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                        <option value="all">All Modules</option>
                        {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                </div>
                <button onClick={() => setNewThread({title: '', content: ''})} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center self-start md:self-center"><PlusCircle className="mr-2 h-5 w-5"/>New Thread</button>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {filteredThreads.map(thread => {
                        const author = getUser(thread.authorId);
                        return (
                        <div key={thread.id} onClick={() => handleViewThread(thread.id)} className="p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50 flex items-center gap-4">
                            {thread.isNew && <div className="h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0" title="New thread"></div>}
                            <div className="flex-grow">
                                <h4 className="font-semibold text-gray-900 dark:text-slate-100">{thread.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-slate-400">By {author?.name} &bull; {thread.replies.length} replies</p>
                            </div>
                        </div>
                    )})}
                    {filteredThreads.length === 0 && <p className="text-center text-gray-500 py-8">No discussions for this module yet. Start one!</p>}
                </div>
            </CardContent>
        </Card>
    );
};
