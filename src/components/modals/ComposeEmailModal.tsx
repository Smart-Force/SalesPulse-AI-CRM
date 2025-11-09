import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Send, Paperclip, Smile, Trash, Link2, 
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Code, 
  Undo, Redo, ChevronDown, Heading1, Heading2, Heading3
} from 'lucide-react';

interface ComposeEmailModalProps {
  onClose: () => void;
}

const EditorButton = ({
  icon: Icon,
  onClick,
  isActive = false,
  title
}: {
  icon: React.ElementType,
  onClick: () => void,
  isActive?: boolean,
  title: string
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
    className={`p-2 rounded-md transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
    }`}
  >
    <Icon className="h-5 w-5" />
  </button>
);

const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({ onClose }) => {
  const [subject, setSubject] = useState('');
  const [to, setTo] = useState('');
  const [emailError, setEmailError] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [isHeadingsOpen, setIsHeadingsOpen] = useState(false);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateToolbarState();
  };

  const updateToolbarState = () => {
    const newFormats = new Set<string>();
    const commands = ['bold', 'italic', 'underline', 'strikethrough', 'insertUnorderedList', 'insertOrderedList'];
    commands.forEach(cmd => {
      if (document.queryCommandState(cmd)) {
        newFormats.add(cmd);
      }
    });
    setActiveFormats(newFormats);
  };

  const validateEmails = (emailString: string): boolean => {
    if (!emailString.trim()) {
        setEmailError('Recipient email is required.');
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = emailString.split(',').map(e => e.trim()).filter(Boolean);
    
    for (const email of emails) {
        if (!emailRegex.test(email)) {
            setEmailError(`Invalid email address: ${email}`);
            return false;
        }
    }

    setEmailError('');
    return true;
  };

  const handleSend = () => {
    if (!validateEmails(to)) {
        return;
    }
    console.log({
      to,
      subject,
      body: editorRef.current?.innerHTML,
    });
    alert('Email sent (mock)!');
    onClose();
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const headings = [
    { name: 'Heading 1', tag: 'h1', icon: Heading1 },
    { name: 'Heading 2', tag: 'h2', icon: Heading2 },
    { name: 'Heading 3', tag: 'h3', icon: Heading3 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-4">
      <div className="bg-white dark:bg-slate-800 rounded-t-lg shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col transform transition-all duration-300 ease-out translate-y-full animate-slide-up-modal">
        <style>{`
          @keyframes slide-up-modal {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up-modal { animation: slide-up-modal 0.3s forwards; }
        `}</style>
        <div className="px-4 py-2 bg-slate-700 dark:bg-slate-900 text-white rounded-t-lg flex items-center justify-between">
          <h3 className="text-sm font-semibold">New Message</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <input
            type="email"
            value={to}
            onChange={(e) => {
                setTo(e.target.value);
                if (emailError) setEmailError('');
            }}
            placeholder="To"
            className="w-full text-sm outline-none bg-transparent text-gray-800 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-400"
          />
          {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
        </div>
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full text-sm outline-none bg-transparent text-gray-800 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-400"
          />
        </div>

        {/* Editor Toolbar */}
        <div className="p-2 border-b border-gray-200 dark:border-slate-700 flex items-center flex-wrap gap-1 bg-gray-50 dark:bg-slate-800/50">
          <div className="relative">
            <button
              onClick={() => setIsHeadingsOpen(!isHeadingsOpen)}
              onMouseDown={(e) => e.preventDefault()}
              className="flex items-center p-2 rounded-md text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <span className="font-medium text-sm">Headings</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            {isHeadingsOpen && (
              <div
                className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-slate-700 rounded-md shadow-lg border dark:border-slate-600 z-10"
                onMouseLeave={() => setIsHeadingsOpen(false)}
              >
                {headings.map(({ name, tag, icon: Icon }) => (
                  <button
                    key={name}
                    onClick={() => {
                      handleFormat('formatBlock', `<${tag}>`);
                      setIsHeadingsOpen(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="h-5 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
          <EditorButton title="Bold" icon={Bold} onClick={() => handleFormat('bold')} isActive={activeFormats.has('bold')} />
          <EditorButton title="Italic" icon={Italic} onClick={() => handleFormat('italic')} isActive={activeFormats.has('italic')} />
          <EditorButton title="Underline" icon={Underline} onClick={() => handleFormat('underline')} isActive={activeFormats.has('underline')} />
          <EditorButton title="Strikethrough" icon={Strikethrough} onClick={() => handleFormat('strikethrough')} isActive={activeFormats.has('strikethrough')} />
          <div className="h-5 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
          <EditorButton title="Bulleted List" icon={List} onClick={() => handleFormat('insertUnorderedList')} isActive={activeFormats.has('insertUnorderedList')} />
          <EditorButton title="Numbered List" icon={ListOrdered} onClick={() => handleFormat('insertOrderedList')} isActive={activeFormats.has('insertOrderedList')} />
          <EditorButton title="Blockquote" icon={Quote} onClick={() => handleFormat('formatBlock', '<blockquote>')} />
          <EditorButton title="Code Block" icon={Code} onClick={() => handleFormat('formatBlock', '<pre>')} />
          <div className="h-5 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
          <EditorButton title="Undo" icon={Undo} onClick={() => handleFormat('undo')} />
          <EditorButton title="Redo" icon={Redo} onClick={() => handleFormat('redo')} />
        </div>

        <div 
          ref={editorRef}
          contentEditable="true"
          className="flex-grow p-4 text-base outline-none overflow-y-auto text-gray-800 dark:text-slate-200 prose dark:prose-invert max-w-none"
          data-placeholder="Compose email..."
          onKeyUp={updateToolbarState}
          onMouseUp={updateToolbarState}
          onFocus={updateToolbarState}
        >
        </div>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-600 dark:text-slate-400 bg-transparent rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 dark:text-slate-400 bg-transparent rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
              <Link2 className="h-5 w-5" />
            </button>
             <button className="p-2 text-gray-600 dark:text-slate-400 bg-transparent rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
              <Smile className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="p-2 text-gray-600 dark:text-slate-400 bg-transparent rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <Trash className="h-5 w-5" />
            </button>
            <button
              onClick={handleSend}
              className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center shadow-sm"
            >
              Send
              <Send className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmailModal;