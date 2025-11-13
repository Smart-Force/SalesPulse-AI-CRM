import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { TrainingResource, TrainingResourceType, QuizContent } from '../../types';

const resourceTypeConfig: Record<string, { name: string }> = {
    article: { name: 'Article' }, video: { name: 'Video' }, pdf: { name: 'PDF' }, word: { name: 'Word' },
    presentation: { name: 'Presentation' }, excel: { name: 'Excel' }, audio: { name: 'Audio' },
    image: { name: 'Image' }, html: { name: 'HTML' }, link: { name: 'Link' }, archive: { name: 'Archive' },
    quiz: { name: 'Quiz' }
};

interface AddEditResourceModalProps {
    onClose: () => void;
    onSave: (resourceData: Omit<TrainingResource, 'id'> & { id?: string }) => void;
    resourceToEdit: TrainingResource | null;
}

const AddEditResourceModal: React.FC<AddEditResourceModalProps> = ({ onClose, onSave, resourceToEdit }) => {
    const isEditMode = !!resourceToEdit;
    const [title, setTitle] = useState(resourceToEdit?.title || '');
    const [type, setType] = useState<TrainingResourceType>(resourceToEdit?.type || 'article');
    const [duration, setDuration] = useState(resourceToEdit?.duration || '');
    const [content, setContent] = useState(typeof resourceToEdit?.content === 'string' ? resourceToEdit.content : '');
    const [quizContent, setQuizContent] = useState<QuizContent>(
        (resourceToEdit?.type === 'quiz' && typeof resourceToEdit.content === 'object') 
        ? resourceToEdit.content 
        : { questions: [] }
    );

    const handleSave = () => {
        if (!title || !type) {
            alert('Title and Type are required.');
            return;
        }
        const resourceData = {
            id: resourceToEdit?.id,
            title,
            type,
            duration,
            content: type === 'quiz' ? quizContent : content,
        };
        onSave(resourceData);
    };

    const handleAddQuestion = () => setQuizContent(p => ({ ...p, questions: [...p.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }] }));
    const handleQuestionChange = (qIndex: number, value: string) => setQuizContent(p => ({ ...p, questions: p.questions.map((q, i) => i === qIndex ? { ...q, question: value } : q) }));
    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => setQuizContent(p => ({ ...p, questions: p.questions.map((q, i) => i === qIndex ? { ...q, options: q.options.map((opt, j) => j === oIndex ? value : opt) } : q) }));
    const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => setQuizContent(p => ({ ...p, questions: p.questions.map((q, i) => i === qIndex ? { ...q, correctAnswer: oIndex } : q) }));
    const handleRemoveQuestion = (qIndex: number) => setQuizContent(p => ({ ...p, questions: p.questions.filter((_, i) => i !== qIndex) }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center"><h3 className="text-lg font-semibold">{isEditMode ? 'Edit' : 'Add'} Resource</h3><button onClick={onClose}><X/></button></div>
                <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    <div><label className="text-sm font-medium">Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Type</label><select value={type} onChange={e => setType(e.target.value as TrainingResourceType)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600">{Object.entries(resourceTypeConfig).map(([key, { name }]) => <option key={key} value={key}>{name}</option>)}</select></div>
                        <div><label className="text-sm font-medium">Duration</label><input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g., 5 min read" className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/></div>
                    </div>
                    {type !== 'quiz' && <div><label className="text-sm font-medium">Content / URL</label><input type="text" value={content} onChange={e => setContent(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/></div>}
                    {type === 'quiz' && <div className="space-y-4 pt-2 border-t dark:border-slate-600">
                        <h4 className="font-semibold">Quiz Builder</h4>
                        {quizContent.questions.map((q, qIndex) => (
                            <div key={qIndex} className="p-3 border rounded-lg dark:border-slate-600 space-y-2 bg-slate-50 dark:bg-slate-700/50">
                                <div className="flex justify-between items-center">
                                    <label className="font-medium text-sm">Question {qIndex + 1}</label>
                                    <button onClick={() => handleRemoveQuestion(qIndex)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4"/></button>
                                </div>
                                <textarea value={q.question} placeholder="Question text..." onChange={e => handleQuestionChange(qIndex, e.target.value)} className="w-full p-1 border rounded dark:bg-slate-700 dark:border-slate-600" rows={2}/>
                                <div className="space-y-1">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <input type="radio" name={`q${qIndex}-correct`} checked={q.correctAnswer === oIndex} onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}/>
                                            <input type="text" value={opt} placeholder={`Option ${oIndex+1}`} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className="w-full p-1 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button onClick={handleAddQuestion} className="text-blue-600 font-semibold text-sm">+ Add Question</button>
                    </div>}
                </div>
                <div className="p-4 border-t flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50"><button onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-600 border dark:border-slate-500 rounded-md">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Resource</button></div>
            </div>
        </div>
    );
};
export default AddEditResourceModal;
