import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { User, TrainingModule, TrainingResource, QuizContent, TrainingResourceType, CertificateSettings, QuizQuestion, DiscussionThread, StudyGroup } from '../types';
import { usePermissions } from '../contexts/PermissionContext';
import { useToasts } from '../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Community } from './training/Community';
import { playbooks } from '../data/playbooks';
import { 
    Award, BookOpen, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Code,
    File, FileArchive, FileAudio, FileImage, FileSpreadsheet, FileText, FileType, 
    GraduationCap, Link, PlusCircle, Search, Trash2, Video, RefreshCw, Clock, X, Users, Book, Edit, Copy, Download, Upload, Folder, FolderOpen
} from 'lucide-react';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import AddEditModuleModal from './modals/AddEditModuleModal';
import AddEditResourceModal from './modals/AddEditResourceModal';
import { CertificateModal } from './modals/CertificateModal';
import { initialResourceContents } from '../data/training';


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

interface QuizState {
    currentIndex: number;
    answers: Record<string, number>;
    result: { score: number; correct: number; total: number } | null;
}

export const TrainingCenter: React.FC<TrainingCenterProps> = (props) => {
    // Deconstruct props
    const { currentUser, trainingModules, setTrainingModules, onUpdateTrainingProgress, certificateSettings, onSelectPlaybook } = props;
    
    // Hooks
    const { addToast } = useToasts();
    const { create: canCreate, edit: canEdit, delete: canDelete } = usePermissions('Training Center');
    const importFileRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<number | null>(null);

    // State
    const [activeTab, setActiveTab] = useState<'learning' | 'community'>('learning');
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
    const [selectedModuleIds, setSelectedModuleIds] = useState<Set<string>>(new Set());
    
    // Modals State
    const [modal, setModal] = useState<'addEditResource' | 'deleteResource' | 'addEditModule' | 'deleteModule' | 'viewCertificate' | null>(null);
    const [resourceToEdit, setResourceToEdit] = useState<TrainingResource | null>(null);
    const [resourceToDelete, setResourceToDelete] = useState<TrainingResource | null>(null);
    const [moduleToHandle, setModuleToHandle] = useState<TrainingModule | null>(null);
    const [moduleForCertificate, setModuleForCertificate] = useState<TrainingModule | null>(null);
    
    // Quiz State
    const [quizState, setQuizState] = useState<QuizState>({ currentIndex: 0, answers: {}, result: null });
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Memos
    const newSocialActivityCount = useMemo(() => (props.discussionThreads.filter(t => t.isNew).length + props.studyGroups.filter(g => g.isNew).length), [props.discussionThreads, props.studyGroups]);

    const { overallProgress, totalResourceCount } = useMemo(() => {
        const allResources = trainingModules.flatMap(m => m.resources);
        const total = allResources.length;
        if (total === 0) return { overallProgress: 0, totalResourceCount: 0 };
        const completedIds = new Set(Object.keys(currentUser.trainingProgress || {}));
        const completedCount = allResources.filter(r => completedIds.has(r.id)).length;
        return { overallProgress: (completedCount / total) * 100, totalResourceCount: total };
    }, [trainingModules, currentUser.trainingProgress]);
    
    const modulesById = useMemo(() => new Map(trainingModules.map(m => [m.id, m])), [trainingModules]);

    const selectedModule = useMemo(() => modulesById.get(selectedModuleId || ''), [modulesById, selectedModuleId]);
    const selectedResource = useMemo(() => selectedModule?.resources.find(r => r.id === selectedResourceId), [selectedModule, selectedResourceId]);
    
    const quizStorageKey = useMemo(() => currentUser && selectedResource?.type === 'quiz' ? `quiz-progress-${currentUser.id}-${selectedResource.id}` : null, [currentUser.id, selectedResource]);

    const filteredModules = useMemo(() => {
        if (!searchTerm) return trainingModules;
        const lowercasedSearch = searchTerm.toLowerCase();
        const searchResults = new Set<string>();
        const getParentIds = (id: string, path: Set<string> = new Set()): Set<string> => {
            const module = modulesById.get(id);
            if (module?.parentId && !path.has(module.parentId)) {
                path.add(module.parentId);
                return getParentIds(module.parentId, path);
            }
            return path;
        };

        trainingModules.forEach(m => {
            if (m.title.toLowerCase().includes(lowercasedSearch) || m.tags?.some(t => t.toLowerCase().includes(lowercasedSearch))) {
                searchResults.add(m.id);
                getParentIds(m.id).forEach(pid => searchResults.add(pid));
            }
        });
        return trainingModules.filter(m => searchResults.has(m.id));
    }, [searchTerm, trainingModules, modulesById]);
    
    const currentResourceIndex = useMemo(() => selectedModule?.resources.findIndex(r => r.id === selectedResourceId) ?? -1, [selectedModule, selectedResourceId]);
    
    // Effects
    useEffect(() => {
        if (!selectedModuleId && filteredModules.length > 0) {
            setSelectedModuleId(filteredModules.find(m => !m.parentId)?.id || filteredModules[0].id);
        } else if (selectedModuleId && !modulesById.has(selectedModuleId)) {
            setSelectedModuleId(null);
            setSelectedResourceId(null);
        }
    }, [filteredModules, selectedModuleId, modulesById]);
    
    useEffect(() => {
        if (searchTerm) {
            setCollapsedIds(new Set());
        }
    }, [searchTerm]);

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
    
    // Handlers
    const toggleCollapse = (moduleId: string) => setCollapsedIds(prev => {
        const newSet = new Set(prev);
        newSet.has(moduleId) ? newSet.delete(moduleId) : newSet.add(moduleId);
        return newSet;
    });

    const handleSelectModule = (moduleId: string) => {
        setSelectedModuleId(moduleId);
        const module = modulesById.get(moduleId);
        setSelectedResourceId(module?.resources[0]?.id || null);
    };

    const navigateResource = (dir: 'prev' | 'next') => {
        if (!selectedModule) return;
        const newIndex = dir === 'next' ? currentResourceIndex + 1 : currentResourceIndex - 1;
        if (newIndex >= 0 && newIndex < selectedModule.resources.length) setSelectedResourceId(selectedModule.resources[newIndex].id);
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
        setTrainingModules(prev => {
            if (moduleData.id) { // Edit
                return prev.map(m => m.id === moduleData.id ? { ...m, ...moduleData } as TrainingModule : m);
            } else { // Create
                const newModule: TrainingModule = { ...moduleData, id: `mod-${Date.now()}`, resources: [] };
                return [...prev, newModule];
            }
        });
        addToast(`Module ${moduleData.id ? 'updated' : 'created'}!`, 'success');
        setModal(null);
    };

    const handleDeleteModules = () => {
        if (!moduleToHandle && selectedModuleIds.size === 0) return;
        const idsToDelete = new Set(moduleToHandle ? [moduleToHandle.id] : selectedModuleIds);
        const getDescendantIds = (moduleId: string): string[] => {
            const children = trainingModules.filter(m => m.parentId === moduleId);
            return [moduleId, ...children.flatMap(c => getDescendantIds(c.id))];
        };
        const allIdsToDelete = new Set(Array.from(idsToDelete).flatMap(id => getDescendantIds(id)));
        
        setTrainingModules(prev => prev.filter(m => !allIdsToDelete.has(m.id)));
        addToast(`${allIdsToDelete.size} module(s) deleted.`, 'success');
        setSelectedModuleIds(new Set());
        setModuleToHandle(null);
        setModal(null);
    };
    
    const handleCloneModule = () => {
        const id = moduleToHandle?.id;
        if (!id) return;
        
        const idMap = new Map<string, string>();
        const getDescendants = (moduleId: string): TrainingModule[] => {
            const children = trainingModules.filter(m => m.parentId === moduleId);
            return [...children, ...children.flatMap(c => getDescendants(c.id))];
        };

        const original = modulesById.get(id);
        if (!original) return;
        const descendants = getDescendants(id);
        
        const newModules: TrainingModule[] = [];

        const cloneWithNewId = (module: TrainingModule): TrainingModule => {
            const newId = `mod-${Date.now()}-${Math.random()}`;
            idMap.set(module.id, newId);
            return {
                ...module,
                id: newId,
                title: `${module.title} (Copy)`,
                resources: module.resources.map(r => ({...r, id: `res-${Date.now()}-${Math.random()}`})),
            };
        };
        
        const clonedRoot = cloneWithNewId(original);
        newModules.push(clonedRoot);

        descendants.forEach(desc => {
            const clonedDesc = cloneWithNewId(desc);
            newModules.push(clonedDesc);
        });
        
        const finalClones = newModules.map(nm => ({...nm, parentId: nm.parentId ? idMap.get(nm.parentId) : nm.parentId }));

        setTrainingModules(prev => [...prev, ...finalClones]);
        addToast(`Cloned "${original.title}" and its submodules.`, 'success');
        setModuleToHandle(null);
    };

    const handleExport = () => {
        const data = JSON.stringify(trainingModules, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'training-modules.json';
        a.click();
        URL.revokeObjectURL(url);
        addToast('Modules exported successfully!', 'success');
    };
    
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // FIX: Add type guard to ensure e.target.result is a string before parsing.
                const result = e.target?.result;
                if (typeof result !== 'string') {
                    throw new Error('Could not read file as text.');
                }
                const importedModules = JSON.parse(result);
                // Basic validation
                if (Array.isArray(importedModules) && importedModules.every(m => m.id && m.title)) {
                    setTrainingModules(importedModules);
                    addToast('Modules imported successfully!', 'success');
                } else {
                    throw new Error('Invalid file format.');
                }
            } catch (error) {
                addToast('Failed to import modules. Invalid file.', 'error');
                console.error(error);
            }
        };
        reader.readAsText(file);
    };

    // RENDER LOGIC
    const renderModuleTree = (parentId?: string, level = 0) => {
        return filteredModules
            .filter(m => m.parentId === parentId)
            .sort((a,b) => a.title.localeCompare(b.title))
            .map(module => {
                const children = renderModuleTree(module.id, level + 1);
                const isCollapsed = collapsedIds.has(module.id);
                const isSelected = selectedModuleId === module.id;
                const hasChildren = trainingModules.some(m => m.parentId === module.id);
                
                return (
                    <div key={module.id} style={{ paddingLeft: `${level * 1}rem` }}>
                        <div className={`group flex items-center p-1.5 rounded-md cursor-pointer ${isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                           {canEdit && <input type="checkbox" className="h-4 w-4 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedModuleIds.has(module.id)} onChange={() => setSelectedModuleIds(prev => {const s = new Set(prev); s.has(module.id) ? s.delete(module.id) : s.add(module.id); return s;})} onClick={e => e.stopPropagation()} />}
                            
                            <div className="flex items-center gap-1.5 flex-grow" onClick={() => handleSelectModule(module.id)}>
                                <span onClick={e => {e.stopPropagation(); hasChildren && toggleCollapse(module.id);}} className="w-5 h-5 flex items-center justify-center">{hasChildren && (isCollapsed ? <ChevronRight className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>)}</span>
                                {hasChildren ? (isCollapsed ? <Folder className="h-5 w-5 text-blue-500"/> : <FolderOpen className="h-5 w-5 text-blue-500"/>) : <BookOpen className="h-5 w-5 text-gray-500"/>}
                                <span className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                                    <Highlight text={module.title} highlight={searchTerm}/>
                                </span>
                            </div>
                            <div className="hidden group-hover:flex items-center ml-auto gap-1">
                                {canEdit && <button onClick={e => { e.stopPropagation(); setModuleToHandle(module); setModal('addEditModule');}} title="Edit"><Edit className="h-4 w-4"/></button>}
                                {canCreate && <button onClick={e => { e.stopPropagation(); setModuleToHandle(module); handleCloneModule();}} title="Clone"><Copy className="h-4 w-4"/></button>}
                                {canDelete && <button onClick={e => { e.stopPropagation(); setModuleToHandle(module); setModal('deleteModule');}} title="Delete"><Trash2 className="h-4 w-4 text-red-500"/></button>}
                            </div>
                        </div>
                        {!isCollapsed && children}
                    </div>
                );
            });
    };

    const renderContent = () => {
        if (!selectedResource) {
            if (selectedModule) {
                 return <div className="p-6 text-center text-gray-500">Select a resource to begin learning.</div>;
            }
            return <div className="p-6 text-center text-gray-500">Select a module from the list.</div>;
        }
        
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
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: initialResourceContents[content] || content }} />
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
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             {/* Modals */}
             {modal === 'addEditModule' && <AddEditModuleModal onClose={() => setModal(null)} onSave={handleSaveModule} moduleToEdit={moduleToHandle} allModules={trainingModules} parentId={selectedModuleId} />}
             {modal === 'deleteModule' && <ConfirmDeleteModal isOpen={!!modal} onClose={() => setModal(null)} onConfirm={handleDeleteModules} title={`Delete Module(s)`} description={`Are you sure you want to delete ${moduleToHandle ? `"${moduleToHandle.title}"` : `${selectedModuleIds.size} modules`} and all their submodules? This is permanent.`} />}
             {modal === 'addEditResource' && selectedModule && <AddEditResourceModal onClose={() => setModal(null)} onSave={() => {}} resourceToEdit={resourceToEdit} />}
             {modal === 'deleteResource' && resourceToDelete && <ConfirmDeleteModal isOpen={!!modal} onClose={() => setModal(null)} onConfirm={() => {}} title={`Delete "${resourceToDelete.title}"`} description="This action cannot be undone." />}
             {modal === 'viewCertificate' && moduleForCertificate && <CertificateModal user={currentUser} module={moduleForCertificate} settings={certificateSettings} onClose={() => setModal(null)} />}

             <input type="file" ref={importFileRef} onChange={handleImport} style={{display: 'none'}} accept=".json"/>

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
                        <Card>
                            <CardHeader>
                                <CardTitle>Learning Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="flex-grow">
                                        <h3 className="font-semibold mb-2">Overall Progress</h3>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"><div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${overallProgress}%`}}></div></div>
                                        <p className="text-xs text-gray-500 mt-1">{Object.keys(currentUser.trainingProgress||{}).length} of {totalResourceCount} resources completed ({overallProgress.toFixed(0)}%)</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[60vh]">
                            <div className="lg:col-span-4"><Card className="h-full flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-center mb-2">
                                        <CardTitle>Modules</CardTitle>
                                        {canCreate && <div className="flex items-center gap-2">
                                            <button onClick={() => importFileRef.current?.click()} title="Import Modules"><Upload className="h-5 w-5"/></button>
                                            <button onClick={handleExport} title="Export Modules"><Download className="h-5 w-5"/></button>
                                            <button onClick={() => {setModuleToHandle(null); setModal('addEditModule');}} title="Add New Module"><PlusCircle className="h-5 w-5 text-blue-600"/></button>
                                        </div>}
                                    </div>
                                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search modules..." className="w-full pl-9 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/></div>
                                </CardHeader>
                                <CardContent className="pt-0 flex-grow overflow-y-auto">
                                    {selectedModuleIds.size > 0 && <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md mb-2 flex justify-between items-center text-sm"><span>{selectedModuleIds.size} selected</span><button onClick={() => {setModuleToHandle(null); setModal('deleteModule');}} className="font-semibold text-red-600">Delete</button></div>}
                                    {renderModuleTree()}
                                </CardContent>
                            </Card></div>
                            <div className="lg:col-span-8"><Card className="h-full flex flex-col">
                                {selectedModule ? (
                                    <>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>{selectedModule.title}</CardTitle>
                                                <div className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">{selectedModule.difficulty}</div>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">{selectedModule.description}</p>
                                             <div className="flex flex-wrap gap-1 mt-2">
                                                {selectedModule.tags?.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{t}</span>)}
                                             </div>
                                        </CardHeader>
                                        <div className="flex-grow overflow-y-auto">
                                            <div className="border-t dark:border-slate-700 px-6 py-4">
                                                <h4 className="font-semibold mb-2 text-gray-800 dark:text-slate-200">Resources ({selectedModule.resources.length})</h4>
                                                {canCreate && <button onClick={() => {setResourceToEdit(null); setModal('addEditResource')}} className="w-full text-center py-2 border-2 border-dashed rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-slate-600 dark:hover:bg-blue-900/50">+ Add Resource</button>}
                                            </div>
                                            {selectedModule.resources.length > 0 ? (
                                                <div className="px-6 pb-6 space-y-1">
                                                    {selectedModule.resources.map(res => (
                                                        <div key={res.id} onClick={() => setSelectedResourceId(res.id)} className={`p-2 rounded-lg flex items-center cursor-pointer ${selectedResourceId === res.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                                                            <ResourceIcon type={res.type} />
                                                            <div className="flex-grow"><p className="font-medium text-sm">{res.title}</p><p className="text-xs text-gray-500">{res.duration}</p></div>
                                                            {currentUser.trainingProgress?.[res.id] && <CheckCircle className="text-green-500 h-5 w-5 ml-2 flex-shrink-0"/>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-center py-8 text-gray-500">This module has no resources yet.</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex h-full items-center justify-center p-4 text-center text-gray-500">Select a module to see its details and resources.</div>
                                )}
                            </Card></div>
                        </div>
                    </div>
                ) : (
                    <Community {...props} />
                )}
            </main>
        </div>
    );
};
