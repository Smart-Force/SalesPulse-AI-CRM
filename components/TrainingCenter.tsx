import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { User, TrainingModule, TrainingResource, QuizContent, TrainingResourceType, CertificateSettings, QuizQuestion, DiscussionThread, StudyGroup } from '../types';
import { usePermissions } from '../contexts/PermissionContext';
import { useToasts } from '../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Community } from './training/Community';
import { playbooks } from '../data/playbooks';
import { 
    Award, BookOpen, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ClipboardCheck, Code,
    File, FileArchive, FileAudio, FileImage, FileSpreadsheet, FileText, FileType, 
    GraduationCap, HelpCircle, Link, PlusCircle, Search, Trash2, Video, RefreshCw, Clock, X, Users, Book, Edit, GripVertical
} from 'lucide-react';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import AddEditModuleModal from './modals/AddEditModuleModal';
import AddEditResourceModal from './modals/AddEditResourceModal';
import { CertificateModal } from './modals/CertificateModal';

// --- Helper Components & Types ---
const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) return <>{text}</>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return <>{parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ? <span key={i} className="search-highlight">{part}</span> : <span key={i}>{part}</span>)}</>;
};

interface TrainingCenterProps {
    currentUser: User;
    trainingModules: TrainingModule[];
    setTrainingModules: React.Dispatch<React.SetStateAction<TrainingModule[]>>;
    onUpdateTrainingProgress: (userId: string, resourceId: string) => void;
    onSelectPlaybook: (playbookId: string) => void;
    certificateSettings: CertificateSettings;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    discussionThreads: DiscussionThread[];
    setDiscussionThreads: React.Dispatch<React.SetStateAction<DiscussionThread[]>>;
    studyGroups: StudyGroup[];
    setStudyGroups: React.Dispatch<React.SetStateAction<StudyGroup[]>>;
}

const resourceTypeConfig: Record<string, { icon: React.ElementType, name: string }> = {
    article: { icon: FileText, name: 'Article' }, video: { icon: Video, name: 'Video' }, pdf: { icon: File, name: 'PDF' }, word: { icon: FileText, name: 'Word' },
    presentation: { icon: FileType, name: 'Presentation' }, excel: { icon: FileSpreadsheet, name: 'Excel' }, audio: { icon: FileAudio, name: 'Audio' },
    image: { icon: FileImage, name: 'Image' }, html: { icon: Code, name: 'HTML' }, link: { icon: Link, name: 'Link' }, archive: { icon: FileArchive, name: 'Archive' },
    quiz: { icon: ClipboardCheck, name: 'Quiz' }
};

const ResourceIcon: React.FC<{ type: TrainingResourceType }> = ({ type }) => {
    const Icon = resourceTypeConfig[type]?.icon || File;
    return <Icon className={`mr-3 h-5 w-5 flex-shrink-0 text-gray-500`} />;
};

const ProgressRing = ({ progress }: { progress: number }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative h-12 w-12 flex-shrink-0">
            <svg className="h-full w-full" width="50" height="50" viewBox="0 0 50 50">
                <circle className="text-slate-200 dark:text-slate-700" strokeWidth="4" stroke="currentColor" fill="transparent" r={radius} cx="25" cy="25" />
                <circle
                    className="progress-ring-circle"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="25"
                    cy="25"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{Math.round(progress)}%</span>
        </div>
    );
};

interface QuizState {
    currentIndex: number;
    answers: Record<string, number>;
    result: { score: number; correct: number; total: number } | null;
}

export const TrainingCenter: React.FC<TrainingCenterProps> = (props) => {
    const { currentUser, trainingModules, setTrainingModules, onUpdateTrainingProgress, certificateSettings, onSelectPlaybook } = props;
    const { addToast } = useToasts();
    const { create: canCreate, edit: canEdit, delete: canDelete } = usePermissions('Training Center');

    const [activeTab, setActiveTab] = useState<'learning' | 'community'>('learning');
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
    const [moduleSearch, setModuleSearch] = useState('');
    const [resourceSearch, setResourceSearch] = useState('');
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
    const [quizState, setQuizState] = useState<QuizState>({ currentIndex: 0, answers: {}, result: null });
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const timerRef = useRef<number | null>(null);
    const [modal, setModal] = useState<'addEditResource' | 'deleteResource' | 'addEditModule' | 'deleteModule' | 'viewCertificate' | null>(null);
    const [resourceToEdit, setResourceToEdit] = useState<TrainingResource | null>(null);
    const [resourceToDelete, setResourceToDelete] = useState<TrainingResource | null>(null);
    const [moduleToEdit, setModuleToEdit] = useState<TrainingModule | null>(null);
    const [moduleToDelete, setModuleToDelete] = useState<TrainingModule | null>(null);
    const [moduleForCertificate, setModuleForCertificate] = useState<TrainingModule | null>(null);

    const newSocialActivityCount = useMemo(() => {
        const newThreads = props.discussionThreads.filter(t => t.isNew).length;
        const newGroups = props.studyGroups.filter(g => g.isNew).length;
        return newThreads + newGroups;
    }, [props.discussionThreads, props.studyGroups]);

    const { overallProgress, totalResourceCount } = useMemo(() => {
        const total = trainingModules.reduce((acc, m) => acc + m.resources.length, 0);
        if (total === 0) return { overallProgress: 0, totalResourceCount: 0 };
        const completed = Object.keys(currentUser.trainingProgress || {}).length;
        return { overallProgress: (completed / total) * 100, totalResourceCount: total };
    }, [trainingModules, currentUser.trainingProgress]);

    const selectedModule = useMemo(() => trainingModules.find(m => m.id === selectedModuleId), [trainingModules, selectedModuleId]);
    const selectedResource = useMemo(() => selectedModule?.resources.find(r => r.id === selectedResourceId), [selectedModule, selectedResourceId]);
    const quizStorageKey = useMemo(() => currentUser && selectedResource?.type === 'quiz' ? `quiz-progress-${currentUser.id}-${selectedResource.id}` : null, [currentUser.id, selectedResource]);

    useEffect(() => {
        if (!selectedModuleId && trainingModules.length > 0) {
            const firstModule = trainingModules[0];
            setSelectedModuleId(firstModule.id);
            if (firstModule.resources.length > 0) setSelectedResourceId(firstModule.resources[0].id);
        }
    }, [trainingModules, selectedModuleId]);

    useEffect(() => {
        if (selectedModuleId && !trainingModules.find(m => m.id === selectedModuleId)) {
            const firstModule = trainingModules[0];
            setSelectedModuleId(firstModule?.id || null);
            setSelectedResourceId(firstModule?.resources[0]?.id || null);
        }
    }, [trainingModules, selectedModuleId]);
    
    const categories = useMemo(() => {
        const categoryOrder: Record<string, number> = { 'Onboarding': 1, 'Sales Skills': 2, 'Product Knowledge': 3 };
        return [...new Set(trainingModules.map(m => m.category))].sort((a: string, b: string) => (categoryOrder[a] || 99) - (categoryOrder[b] || 99));
    }, [trainingModules]);
    
    const filteredModules = useMemo(() => !moduleSearch ? trainingModules : trainingModules.filter(m => m.title.toLowerCase().includes(moduleSearch.toLowerCase())), [trainingModules, moduleSearch]);
    const filteredResources = useMemo(() => !selectedModule ? [] : !resourceSearch ? selectedModule.resources : selectedModule.resources.filter(r => r.title.toLowerCase().includes(resourceSearch.toLowerCase())), [selectedModule, resourceSearch]);
    const currentResourceIndex = useMemo(() => selectedModule?.resources.findIndex(r => r.id === selectedResourceId) ?? -1, [selectedModule, selectedResourceId]);

    const handleSubmitQuiz = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(null);
        if (quizStorageKey) localStorage.removeItem(quizStorageKey);
        if (!selectedResource || typeof selectedResource.content !== 'object') return;
        
        const quizContent = selectedResource.content as QuizContent;
        let correct = 0;
        quizContent.questions.forEach((q, i) => { if (quizState.answers[i.toString()] === q.correctAnswer) correct++; });
        
        const total = quizContent.questions.length;
        const score = total > 0 ? (correct / total) * 100 : 0;
        setQuizState(p => ({ ...p, result: { score, correct, total } }));

        if (score >= 80) {
            addToast('Congratulations! You passed the quiz.', 'success');
            onUpdateTrainingProgress(currentUser.id, selectedResource.id);
        } else {
            addToast(`You scored ${correct}/${total}. Keep studying!`, 'info');
        }
    }, [selectedResource, quizState.answers, currentUser.id, onUpdateTrainingProgress, addToast, quizStorageKey]);
    
    const handleSelectModule = (id: string) => {
        const module = trainingModules.find(m => m.id === id);
        setSelectedModuleId(id);
        setSelectedResourceId(module?.resources[0]?.id || null);
        setResourceSearch('');
    };

    const handleSelectResource = (id: string) => setSelectedResourceId(id);
    const toggleCategory = (cat: string) => setCollapsedCategories(p => { const s = new Set(p); s.has(cat) ? s.delete(cat) : s.add(cat); return s; });
    const navigateResource = (dir: 'prev' | 'next') => {
        if (!selectedModule) return;
        const newIndex = dir === 'next' ? currentResourceIndex + 1 : currentResourceIndex - 1;
        if (newIndex >= 0 && newIndex < selectedModule.resources.length) handleSelectResource(selectedModule.resources[newIndex].id);
    };

    const handleAnswerChange = (qIndex: number, oIndex: number) => {
        setQuizState(p => {
            const newAnswers = { ...p.answers, [qIndex.toString()]: oIndex };
            if (quizStorageKey) localStorage.setItem(quizStorageKey, JSON.stringify(newAnswers));
            return { ...p, answers: newAnswers };
        });
    };
    const handleRetakeQuiz = () => {
        if (quizStorageKey) localStorage.removeItem(quizStorageKey);
        setQuizState({ currentIndex: 0, answers: {}, result: null });
    };

    const handleSaveModule = (moduleData: Omit<TrainingModule, 'id' | 'resources'> & { id?: string }) => {
        if (moduleData.id) { // Editing
            setTrainingModules(prev => prev.map(m => m.id === moduleData.id ? { ...m, ...moduleData } : m));
            addToast('Module updated successfully!', 'success');
        } else { // Creating
            const newModule: TrainingModule = { ...moduleData, id: `mod-${Date.now()}`, resources: [] };
            setTrainingModules(prev => [newModule, ...prev]);
            setSelectedModuleId(newModule.id);
            setSelectedResourceId(null);
            addToast('Module created successfully!', 'success');
        }
        setModal(null);
        setModuleToEdit(null);
    };

    const handleDeleteModule = () => {
        if (!moduleToDelete) return;
        setTrainingModules(prev => prev.filter(m => m.id !== moduleToDelete.id));
        addToast(`Module "${moduleToDelete.title}" deleted.`, 'success');
        setModuleToDelete(null);
        setModal(null);
    };
    
    const handleSaveResource = (resourceData: Omit<TrainingResource, 'id'> & { id?: string }) => {
        setTrainingModules(prevModules => prevModules.map(m => {
            if (m.id !== selectedModuleId) return m;
            const newResources = resourceData.id ? m.resources.map(r => r.id === resourceData.id ? { ...r, ...resourceData } as TrainingResource : r) : [...m.resources, { ...resourceData, id: `res-${Date.now()}` } as TrainingResource];
            return { ...m, resources: newResources };
        }));
        setModal(null);
        addToast(`Resource ${resourceData.id ? 'updated' : 'added'}!`, 'success');
    };
    const handleDeleteResource = () => {
        if (!resourceToDelete || !selectedModuleId) return;
        setTrainingModules(prev => prev.map(m => m.id === selectedModuleId ? { ...m, resources: m.resources.filter(r => r.id !== resourceToDelete.id) } : m));
        addToast(`Resource "${resourceToDelete.title}" deleted.`, 'success');
        if (selectedResourceId === resourceToDelete.id) setSelectedResourceId(selectedModule?.resources[0]?.id || null);
        setResourceToDelete(null);
        setModal(null);
    };
    const handleReorderResource = (resourceId: string, direction: 'up' | 'down') => {
        setTrainingModules(prev => prev.map(m => {
            if (m.id !== selectedModuleId) return m;
            const resources = [...m.resources];
            const index = resources.findIndex(r => r.id === resourceId);
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= resources.length) return m;
            [resources[index], resources[newIndex]] = [resources[newIndex], resources[index]];
            return { ...m, resources };
        }));
    };

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (selectedResource?.type === 'quiz' && !quizState.result) {
            const duration = selectedResource.duration?.match(/(\d+)/)?.[0];
            setTimeLeft(duration ? parseInt(duration) * 60 : 300);
            timerRef.current = window.setInterval(() => setTimeLeft(t => (t !== null && t > 0) ? t - 1 : 0), 1000);
        } else { setTimeLeft(null); }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [selectedResource?.id, quizState.result]);

    useEffect(() => { if (timeLeft === 0 && quizState.result === null) handleSubmitQuiz(); }, [timeLeft, quizState.result, handleSubmitQuiz]);
    useEffect(() => {
        let loadedAnswers: Record<string, number> = {};
        if (quizStorageKey) {
            const savedProgress = localStorage.getItem(quizStorageKey);
            if (savedProgress) {
                try {
                    const parsedAnswers = JSON.parse(savedProgress);
                    if (typeof parsedAnswers === 'object' && parsedAnswers !== null) loadedAnswers = parsedAnswers;
                } catch (e) { localStorage.removeItem(quizStorageKey); }
            }
        }
        setQuizState({ currentIndex: 0, answers: loadedAnswers, result: null });
    }, [selectedResourceId, currentUser.id, quizStorageKey]);

    const renderContent = () => {
        if (!selectedResource) return <div className="p-6 text-center text-gray-500">Select a resource to begin.</div>;
        
        // --- QUIZ ---
        if (selectedResource.type === 'quiz' && typeof selectedResource.content === 'object') {
            const quiz = selectedResource.content as QuizContent;
            const { currentIndex, answers, result } = quizState;
            const currentQuestion = quiz.questions[currentIndex];

            if (result) {
                const passed = result.score >= 80;
                return (
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                            <p className="text-lg mb-4">You scored</p>
                            <div className={`text-6xl font-bold mb-4 ${passed ? 'text-green-500' : 'text-red-500'}`}>{result.score.toFixed(0)}%</div>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">({result.correct} out of {result.total} correct)</p>
                            {passed ? <p className="text-green-600 font-semibold mb-6 flex items-center justify-center gap-2"><CheckCircle/> Congratulations, you passed!</p> : <p className="text-red-500 font-semibold mb-6 flex items-center justify-center gap-2"><X/> You did not pass. A score of 80% is required.</p>}
                            <button onClick={handleRetakeQuiz} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"><RefreshCw className="h-4 w-4"/> Retake Quiz</button>
                        </div>
                        <h4 className="text-lg font-semibold mb-4">Review Your Answers</h4>
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                             {quiz.questions.map((q, i) => {
                                const userAnswer = answers[i.toString()];
                                const isCorrect = userAnswer === q.correctAnswer;
                                return (
                                <div key={i} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
                                    <p className="font-medium mb-2">{i+1}. {q.question}</p>
                                    <div className="space-y-2">
                                        {q.options.map((opt, oIndex) => {
                                            const isUserAnswer = oIndex === userAnswer;
                                            const isCorrectAnswer = oIndex === q.correctAnswer;
                                            let optionClass = 'quiz-option';
                                            if (isUserAnswer && !isCorrect) optionClass += ' incorrect';
                                            if (isCorrectAnswer) optionClass += ' correct';
                                            return <div key={oIndex} className={`p-2 border rounded-md text-sm ${optionClass}`}>{opt}</div>
                                        })}
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                );
            }

            return (
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Question {currentIndex + 1} of {quiz.questions.length}</h3>
                        {timeLeft !== null && <div className="text-sm font-semibold flex items-center bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full"><Clock className="h-4 w-4 mr-2"/> {Math.floor(timeLeft/60)}:{('0'+timeLeft%60).slice(-2)}</div>}
                    </div>
                    <p className="font-medium mb-4">{currentQuestion.question}</p>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                            <button key={index} onClick={() => handleAnswerChange(currentIndex, index)} className={`w-full text-left p-3 border rounded-lg quiz-option ${answers[currentIndex.toString()] === index ? 'selected' : ''}`}>
                                {option}
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                        <button onClick={() => setQuizState(p => ({...p, currentIndex: p.currentIndex - 1}))} disabled={currentIndex === 0} className="px-6 py-2 font-semibold rounded-lg disabled:opacity-50">Back</button>
                        {currentIndex < quiz.questions.length - 1 ? (
                            <button onClick={() => setQuizState(p => ({...p, currentIndex: p.currentIndex + 1}))} disabled={answers[currentIndex.toString()] === undefined} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">Next</button>
                        ) : (
                            <button onClick={handleSubmitQuiz} disabled={answers[currentIndex.toString()] === undefined} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50">Submit</button>
                        )}
                    </div>
                </div>
            );
        }
        
        // --- OTHER RESOURCE TYPES ---
        const content = selectedResource.content as string;
        if (selectedResource.type === 'video') {
             return <div className="p-6"><iframe className="w-full aspect-video rounded-lg" src={content} title={selectedResource.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>
        }

        const relatedPlaybooks = selectedResource.relatedPlaybookIds?.map(id => playbooks.find(p => p.id === id)).filter(Boolean) || [];

        return (
            <div className="p-6">
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                {relatedPlaybooks.length > 0 && (
                    <div className="mt-8 border-t dark:border-slate-700 pt-6">
                        <h4 className="font-semibold mb-3 flex items-center text-lg text-gray-800 dark:text-slate-200"><BookOpen className="h-5 w-5 mr-2 text-blue-500"/>Related Playbooks</h4>
                        <div className="space-y-2">
                           {relatedPlaybooks.map(playbook => (
                               <button key={playbook!.id} onClick={() => onSelectPlaybook(playbook!.id)} className="w-full text-left p-3 rounded-md bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-blue-600 dark:text-blue-400">{playbook!.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{playbook!.category}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400"/>
                                </button>
                           ))}
                        </div>
                    </div>
                )}
            </div>
        )
    };

    return (
        <div className="text-gray-900 dark:text-white">
             <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center text-gray-900 dark:text-slate-100"><GraduationCap className="mr-3 text-blue-600 h-8 w-8"/>Training Center</h1>
                <p className="text-gray-600 dark:text-slate-400 mt-1">Your hub for sales skills, product knowledge, and team collaboration.</p>
            </div>
            
            <div className="border-b dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('learning')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'learning' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        <Book className="mr-2 h-5 w-5"/> My Learning
                    </button>
                    <button onClick={() => setActiveTab('community')} className={`relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'community' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        <Users className="mr-2 h-5 w-5"/> Community
                        {newSocialActivityCount > 0 && <span className="absolute top-2 -right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>}
                    </button>
                </nav>
            </div>
            
            <main>
                {activeTab === 'learning' ? (
                     <div className="space-y-6">
                        <Card><CardContent className="p-4">
                            <h3 className="font-semibold mb-2">Overall Progress</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"><div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${overallProgress}%`}}></div></div>
                            <p className="text-xs text-gray-500 mt-1">{Object.keys(currentUser.trainingProgress||{}).length} of {totalResourceCount} resources completed ({overallProgress.toFixed(0)}%)</p>
                        </CardContent></Card>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-28rem)]">
                        <div className="lg:col-span-3"><Card className="h-full flex flex-col"><CardHeader><div className="flex justify-between items-center"><CardTitle>Modules</CardTitle>{canCreate && (<button onClick={() => { setModuleToEdit(null); setModal('addEditModule'); }} className="p-1 rounded-full text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-600" title="Add New Module"><PlusCircle className="h-5 w-5" /></button>)}</div><div className="relative mt-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/><input value={moduleSearch} onChange={e=>setModuleSearch(e.target.value)} placeholder="Search modules..." className="w-full pl-9 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/></div></CardHeader><CardContent className="pt-0 space-y-2 overflow-y-auto">{categories.map(cat => (<div key={cat}><div className="flex justify-between items-center mb-1 cursor-pointer" onClick={() => toggleCategory(cat)}><h3 className="text-sm font-semibold uppercase text-gray-500">{cat}</h3>{collapsedCategories.has(cat)?<ChevronRight/>:<ChevronDown/>}</div>{!collapsedCategories.has(cat) && <div className="space-y-1">{filteredModules.filter(m=>m.category===cat).map(m=>{const completedCount = m.resources.filter(r => currentUser.trainingProgress?.[r.id]).length; const moduleProgress = m.resources.length > 0 ? (completedCount / m.resources.length) * 100 : 0; return (<div key={m.id} className={`p-2 rounded-lg transition-colors ${selectedModuleId===m.id?'bg-blue-50 dark:bg-blue-900/20':''}`}><div className="module-item group flex items-center gap-3"><ProgressRing progress={moduleProgress}/><div className="flex-grow"><button onClick={()=>handleSelectModule(m.id)} className="w-full text-left text-sm font-semibold text-gray-800 dark:text-slate-200"><Highlight text={m.title} highlight={moduleSearch}/></button><p className="text-xs text-gray-500">{completedCount} / {m.resources.length} completed</p></div><div className="module-actions flex items-center ml-auto pl-1">{canEdit&&(<button onClick={()=>{setModuleToEdit(m);setModal('addEditModule');}} className="p-1" title="Edit Module"><Edit className="h-4 w-4"/></button>)}{canDelete&&(<button onClick={()=>{setModuleToDelete(m);setModal('deleteModule');}} className="p-1" title="Delete Module"><Trash2 className="h-4 w-4"/></button>)}</div></div>{moduleProgress === 100 && (<button onClick={() => {setModuleForCertificate(m); setModal('viewCertificate')}} className="text-xs font-semibold text-green-600 flex items-center gap-1 mt-1.5 ml-1"><Award className="h-3 w-3"/> View Certificate</button>)}</div>)}) }</div>}</div>))}</CardContent></Card></div>
                        <div className="lg:col-span-4"><Card className="h-full flex flex-col">{selectedModule ? <><CardHeader><CardTitle className="flex justify-between items-center">{selectedModule.title}{canCreate && <button onClick={()=>{setResourceToEdit(null);setModal('addEditResource')}} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><PlusCircle className="h-5 w-5 text-blue-600"/></button>}</CardTitle><div className="relative mt-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/><input value={resourceSearch} onChange={e=>setResourceSearch(e.target.value)} placeholder="Search resources..." className="w-full pl-9 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/></div></CardHeader><CardContent className="pt-0 space-y-1 overflow-y-auto">{filteredResources.length > 0 ? filteredResources.map((res,idx)=>(<div key={res.id} className="resource-item group flex items-center -ml-2 -mr-2 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50"><button onClick={()=>handleSelectResource(res.id)} className={`flex-grow flex items-center p-2 rounded-lg ${selectedResourceId===res.id?'bg-blue-50 dark:bg-blue-900/20':''}`}><ResourceIcon type={res.type}/><div><p className="font-semibold text-sm text-left"><Highlight text={res.title} highlight={resourceSearch}/></p><p className="text-xs text-gray-500 dark:text-slate-400 text-left">{res.duration}</p></div></button>{currentUser.trainingProgress?.[res.id]&&<CheckCircle className="text-green-500 h-5 w-5 ml-2 flex-shrink-0"/>}<div className="resource-actions flex items-center ml-auto pl-2">{canEdit&&<div className="flex items-center"><button onClick={()=>handleReorderResource(res.id, 'up')} disabled={idx === 0} className="p-1 disabled:opacity-30"><ChevronUp className="h-4 w-4"/></button><button onClick={()=>handleReorderResource(res.id, 'down')} disabled={idx === filteredResources.length - 1} className="p-1 disabled:opacity-30"><ChevronDown className="h-4 w-4"/></button></div>}{canEdit&&<button onClick={()=>{setResourceToEdit(res);setModal('addEditResource')}} className="p-1"><Edit className="h-4 w-4"/></button>}{canDelete&&<button onClick={()=>{setResourceToDelete(res);setModal('deleteResource')}} className="p-1"><Trash2 className="h-4 w-4"/></button>}</div></div>)) : <div className="text-center text-gray-500 py-8">No resources in this module.</div>}</CardContent></> : <div className="flex h-full items-center justify-center p-4 text-center text-gray-500">Select a module.</div>}</Card></div>
                        <div className="lg:col-span-5"><Card className="h-full flex flex-col">{selectedResource ? <><CardHeader><CardTitle>{selectedResource.title}</CardTitle><div className="flex justify-between items-center mt-2"><button onClick={()=>navigateResource('prev')} disabled={currentResourceIndex<=0} className="nav-button flex items-center gap-1"><ChevronLeft className="h-4 w-4"/> Prev</button><span className="text-sm text-gray-500">{currentResourceIndex+1} / {selectedModule?.resources.length}</span><button onClick={()=>navigateResource('next')} disabled={currentResourceIndex >= (selectedModule?.resources.length||0)-1} className="nav-button flex items-center gap-1">Next <ChevronRight className="h-4 w-4"/></button></div></CardHeader><CardContent className="pt-0 flex-grow overflow-y-auto">{renderContent()}</CardContent></> : <div className="flex h-full items-center justify-center p-4 text-center text-gray-500">Select a resource to begin.</div>}</Card></div>
                        </div>
                    </div>
                ) : (
                    <Community {...props} />
                )}
            </main>
            {modal === 'addEditResource' && selectedModule && <AddEditResourceModal onClose={() => setModal(null)} onSave={handleSaveResource} resourceToEdit={resourceToEdit} />}
            {modal === 'deleteResource' && resourceToDelete && <ConfirmDeleteModal isOpen={!!resourceToDelete} onClose={() => setModal(null)} onConfirm={handleDeleteResource} title={`Delete "${resourceToDelete.title}"`} description="This action cannot be undone." />}
            {modal === 'addEditModule' && <AddEditModuleModal onClose={() => setModal(null)} onSave={handleSaveModule} moduleToEdit={moduleToEdit} />}
            {modal === 'deleteModule' && moduleToDelete && <ConfirmDeleteModal isOpen={!!moduleToDelete} onClose={() => setModal(null)} onConfirm={handleDeleteModule} title={`Delete "${moduleToDelete.title}"`} description="Are you sure? Deleting this module will also delete all of its resources. This action cannot be undone." />}
            {modal === 'viewCertificate' && moduleForCertificate && <CertificateModal user={currentUser} module={moduleForCertificate} settings={certificateSettings} onClose={() => setModal(null)} />}
        </div>
    );
};
