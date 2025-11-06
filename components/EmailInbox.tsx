import React, { useState, useMemo } from 'react';
import type { Email } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import ComposeEmailModal from './modals/ComposeEmailModal';
import { Inbox, Send, FileText, Trash2, PenSquare, RefreshCw, Star, Paperclip, MoreVertical, Reply, Share, Archive, MailOpen, MousePointerClick } from 'lucide-react';

const initialEmails: Email[] = [
  { id: '1', from: 'Alice Johnson', to: 'Me', subject: 'Project Alpha Update', preview: 'Just a quick update on the project timeline...', body: 'Hi Team,<br><br>Just a quick update on the Project Alpha timeline. We are currently on track to meet the Q3 deadline. All milestones for this month have been achieved.<br><br>Best,<br>Alice', time: '10:45 AM', fullTime: 'July 26, 2024, 10:45 AM', read: false, hasAttachment: true, isImportant: true, threadCount: 3, status: 'replied', tracking: { opened: true, clicked: true, replied: true }, avatarColor: '#3b82f6', initials: 'AJ', folder: 'Inbox', isNew: true },
  { id: '2', from: 'Bob Williams', to: 'Me', subject: 'Lunch tomorrow?', preview: 'Hey, are you free for lunch tomorrow to discuss the new marketing campaign?', body: 'Hey,<br><br>Are you free for lunch tomorrow to discuss the new marketing campaign? I was thinking of that new Italian place downtown.<br><br>Cheers,<br>Bob', time: '9:30 AM', fullTime: 'July 26, 2024, 9:30 AM', read: false, hasAttachment: false, isImportant: false, threadCount: 1, status: 'delivered', tracking: { opened: true, clicked: false, replied: false }, avatarColor: '#10b981', initials: 'BW', folder: 'Inbox' },
  { id: '3', from: 'InnovateCorp', to: 'Me', subject: 'Your Weekly Digest', preview: 'Catch up on the latest news from InnovateCorp...', body: '<h1>InnovateCorp Weekly</h1><p>Here is your digest of the most important news from the past week.</p>', time: 'Yesterday', fullTime: 'July 25, 2024, 4:15 PM', read: true, hasAttachment: false, isImportant: false, threadCount: 1, status: 'opened', tracking: { opened: true, clicked: true, replied: false }, avatarColor: '#f59e0b', initials: 'IC', folder: 'Inbox' },
  { id: '4', from: 'Me', to: 'Charlie Brown', subject: 'Re: Q3 Financials', preview: 'Here are the documents you requested...', body: 'Hi Charlie,<br><br>Attached are the Q3 financial reports. Let me know if you have any questions.<br><br>Thanks!', time: 'Yesterday', fullTime: 'July 25, 2024, 2:00 PM', read: true, hasAttachment: true, isImportant: false, threadCount: 1, status: 'sent', tracking: { opened: true, clicked: true, replied: true }, avatarColor: '#6366f1', initials: 'ME', folder: 'Sent' },
];

const folders = [
  { name: 'Inbox', icon: Inbox },
  { name: 'Sent', icon: Send },
  { name: 'Drafts', icon: FileText },
  { name: 'Trash', icon: Trash2 },
];

export const EmailInbox: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [selectedFolder, setSelectedFolder] = useState<'Inbox' | 'Sent' | 'Drafts' | 'Trash'>('Inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(emails[0]);
  const [isComposeOpen, setComposeOpen] = useState(false);

  const filteredEmails = useMemo(() => {
    return emails.filter(email => email.folder === selectedFolder);
  }, [emails, selectedFolder]);

  const unreadCount = useMemo(() => {
    return emails.filter(e => e.folder === 'Inbox' && !e.read).length;
  }, [emails]);

  const selectEmail = (email: Email) => {
    setSelectedEmail(email);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true, isNew: false } : e));
  };
  
  const handleDeleteEmail = (emailId: string) => {
    if (selectedFolder === 'Trash') {
        if (window.confirm('Permanently delete this email? This action cannot be undone.')) {
            setEmails(prev => prev.filter(e => e.id !== emailId));
            setSelectedEmail(null);
        }
    } else {
        setEmails(prev => prev.map(e => e.id === emailId ? { ...e, folder: 'Trash' } : e));
        setSelectedEmail(null);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white dark:bg-slate-900">
      {isComposeOpen && <ComposeEmailModal onClose={() => setComposeOpen(false)} />}
      
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 dark:border-slate-700 p-4 flex flex-col bg-slate-50 dark:bg-slate-800/50">
        <button onClick={() => setComposeOpen(true)} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm">
          <PenSquare className="h-5 w-5 mr-2" />
          Compose
        </button>
        <nav className="mt-6">
          <ul>
            {folders.map(folder => (
              <li key={folder.name}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setSelectedFolder(folder.name as any); setSelectedEmail(null); }}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedFolder === folder.name ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center">
                    <folder.icon className="h-5 w-5 mr-3" />
                    <span>{folder.name}</span>
                  </div>
                  {folder.name === 'Inbox' && unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Email List */}
      <div className="w-96 border-r border-gray-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">{selectedFolder}</h2>
            <button className="text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"><RefreshCw className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
            {filteredEmails.map(email => (
                <div key={email.id} onClick={() => selectEmail(email)} className={`p-4 border-b border-gray-200 dark:border-slate-700 cursor-pointer transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-50 dark:bg-slate-900/50' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'} ${!email.read ? 'bg-blue-50 dark:bg-transparent border-l-4 border-blue-500' : ''}`}>
                    <div className="flex items-center justify-between">
                        <p className={`font-semibold ${!email.read ? 'text-gray-900 dark:text-slate-100' : 'text-gray-700 dark:text-slate-300'}`}>{email.from}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{email.time}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <p className={`text-sm truncate pr-2 ${!email.read ? 'text-gray-800 dark:text-slate-200' : 'text-gray-600 dark:text-slate-400'}`}>{email.subject}</p>
                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                            {/* Fix: Wrapped icons in a span with a title for tooltip, as title prop is not supported directly. */}
                            {email.tracking.opened && <span title="Opened"><MailOpen className="h-4 w-4 text-gray-400 dark:text-slate-500" /></span>}
                            {email.tracking.clicked && <span title="Clicked"><MousePointerClick className="h-4 w-4 text-green-500" /></span>}
                            {email.tracking.replied && <span title="Replied"><Reply className="h-4 w-4 text-blue-500" /></span>}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-500 truncate">{email.preview}</p>
                    <div className="flex items-center mt-2 space-x-2">
                        {email.hasAttachment && <Paperclip className="h-4 w-4 text-gray-400" />}
                        {email.isImportant && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-900">
        {selectedEmail ? (
          <div>
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{selectedEmail.subject}</h2>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-slate-400">
                    <button className="hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><Reply className="h-5 w-5" /></button>
                    <button className="hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><Share className="h-5 w-5" /></button>
                    <button className="hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><Archive className="h-5 w-5" /></button>
                    <button onClick={() => handleDeleteEmail(selectedEmail.id)} className="hover:text-red-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><Trash2 className="h-5 w-5" /></button>
                    <button className="hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><MoreVertical className="h-5 w-5" /></button>
                </div>
            </div>
            <div className="flex items-center my-6">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold mr-4" style={{ backgroundColor: selectedEmail.avatarColor }}>
                    {selectedEmail.initials}
                </div>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-slate-200">{selectedEmail.from}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">To: {selectedEmail.to}</p>
                </div>
                <p className="ml-auto text-sm text-gray-500 dark:text-slate-400">{selectedEmail.fullTime}</p>
            </div>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
          </div>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-slate-400">
                <p>Select an email to read</p>
            </div>
        )}
      </div>
    </div>
  );
};