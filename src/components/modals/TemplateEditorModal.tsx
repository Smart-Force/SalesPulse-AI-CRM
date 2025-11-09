import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Type, ChevronsRight, Bold, Italic, Underline, List, ListOrdered, Quote, Code, Pilcrow } from 'lucide-react';
import type { Template } from '../../types';

interface TemplateEditorModalProps {
  onClose: () => void;
  onSave: (templateData: Omit<Template, 'id'> & { id?: string }) => void;
  templateToEdit?: Template | null;
}

const EditorButton = ({ icon: Icon, onClick, isActive = false, title }: { icon: React.ElementType, onClick: () => void, isActive?: boolean, title: string }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      className={`p-2 rounded-md transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
);

const availableTags = [
  { tag: '{{first_name}}', desc: "Prospect's first name" },
  { tag: '{{company}}', desc: "Prospect's company name" },
  { tag: '{{recent_achievement}}', desc: "AI-generated company achievement" },
  { tag: '{{specific_pain_point}}', desc: "AI-inferred business challenge" },
  { tag: '{{personal_insight}}', desc: "AI-generated connecting phrase" },
  { tag: '{{primary_service}}', desc: "Your main service offering" },
  { tag: '{{service_rationale}}', desc: "Reason why service is relevant" },
];

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({ onClose, onSave, templateToEdit }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (templateToEdit) {
      setName(templateToEdit.name);
      setSubject(templateToEdit.subject);
      if (editorRef.current) {
        editorRef.current.innerHTML = templateToEdit.body;
      }
    }
  }, [templateToEdit]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateToolbarState();
  };

  const updateToolbarState = () => {
    const newFormats = new Set<string>();
    const commands = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'];
    commands.forEach(cmd => {
      if (document.queryCommandState(cmd)) newFormats.add(cmd);
    });
    setActiveFormats(newFormats);
  };

  const handleSave = () => {
    if (!name || !subject) {
        alert("Please provide a name and subject for the template.");
        return;
    }
    onSave({
      id: templateToEdit?.id,
      name,
      subject,
      body: editorRef.current?.innerHTML || '',
    });
  };

  const handleInsertTag = (tag: string) => {
    editorRef.current?.focus();
    handleFormat('insertHTML', tag);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col transform transition-all duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    {templateToEdit ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-grow p-6 grid grid-cols-3 gap-6 min-h-0">
                <div className="col-span-2 flex flex-col space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Template Name</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" placeholder="e.g., Initial Outreach - Feature Intro"/>
                    </div>
                     <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subject</label>
                        <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" placeholder="e.g., Idea for {{company}}"/>
                    </div>
                    
                    <div className="flex flex-col flex-grow">
                         <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Body</label>
                         <div className="border border-gray-300 dark:border-slate-600 rounded-lg flex-grow flex flex-col">
                            <div className="p-2 border-b border-gray-200 dark:border-slate-700 flex items-center flex-wrap gap-1 bg-gray-50 dark:bg-slate-800/50 rounded-t-lg">
                                <EditorButton title="Bold" icon={Bold} onClick={() => handleFormat('bold')} isActive={activeFormats.has('bold')} />
                                <EditorButton title="Italic" icon={Italic} onClick={() => handleFormat('italic')} isActive={activeFormats.has('italic')} />
                                <EditorButton title="Underline" icon={Underline} onClick={() => handleFormat('underline')} />
                                <div className="h-5 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
                                <EditorButton title="Bulleted List" icon={List} onClick={() => handleFormat('insertUnorderedList')} isActive={activeFormats.has('insertUnorderedList')} />
                                <EditorButton title="Numbered List" icon={ListOrdered} onClick={() => handleFormat('insertOrderedList')} isActive={activeFormats.has('insertOrderedList')} />
                                <EditorButton title="Blockquote" icon={Quote} onClick={() => handleFormat('formatBlock', '<blockquote>')} />
                                <div className="h-5 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
                                <EditorButton title="Insert Paragraph" icon={Pilcrow} onClick={() => handleFormat('insertParagraph')} />
                            </div>
                             <div 
                                ref={editorRef}
                                contentEditable="true"
                                className="flex-grow p-4 outline-none overflow-y-auto text-gray-800 dark:text-slate-200 prose dark:prose-invert max-w-none"
                                data-placeholder="Start writing your template here..."
                                onKeyUp={updateToolbarState}
                                onMouseUp={updateToolbarState}
                                onFocus={updateToolbarState}
                            ></div>
                         </div>
                    </div>
                </div>
                <div className="col-span-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 flex flex-col">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-slate-200 mb-2 flex items-center">
                        <ChevronsRight className="h-5 w-5 mr-2 text-blue-500" />
                        Merge Tags
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Click a tag to insert it into your template body. These will be replaced with prospect-specific data by the AI.</p>
                    <div className="space-y-2 overflow-y-auto">
                        {availableTags.map(({ tag, desc }) => (
                            <button key={tag} onClick={() => handleInsertTag(tag)} title={`Insert ${tag}`} className="w-full text-left p-2 rounded-md bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 border dark:border-slate-600">
                                <p className="font-mono text-sm text-blue-600 dark:text-blue-400">{tag}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end items-center space-x-3 flex-shrink-0">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                    Cancel
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                </button>
            </div>
        </div>
    </div>
  );
};

export default TemplateEditorModal;