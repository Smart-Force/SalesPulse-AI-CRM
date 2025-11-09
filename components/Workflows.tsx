import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { GitFork, PlusCircle, Trash2, ChevronDown, Mail, Wand2, Briefcase, Clock, ArrowDown, Loader2 } from 'lucide-react';
import type { Workflow, WorkflowStep, ProspectStatus, Prospect, WorkflowStepAction } from '../types';
import { templates } from '../data/templates';
import { generateWorkflowEmail } from '../services/aiService';

interface WorkflowsProps {
  workflows: Workflow[];
  setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>>;
  prospects: Prospect[];
}

const statusOptions: ProspectStatus[] = ['New', 'Contacted', 'Engaged', 'Meeting', 'Closed'];

const stepIcons = {
  sendTemplate: Mail,
  sendAIEmail: Wand2,
  createTask: Briefcase,
  wait: Clock,
};

const toneOptions = ['Professional', 'Friendly', 'Casual', 'Formal'];

export const Workflows: React.FC<WorkflowsProps> = ({ workflows, setWorkflows, prospects }) => {
  const [expandedWorkflowId, setExpandedWorkflowId] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<{ [stepId: string]: { prospectId?: string; isGenerating?: boolean; content?: string; sources?: any[] } }>({});


  const handleAddWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: 'New Workflow',
      trigger: { type: 'statusChange', status: 'New' },
      steps: [{ id: `step-${Date.now()}`, action: { 
        type: 'sendAIEmail', 
        tone: 'Friendly', 
        purpose: 'Introduce our main product and ask for a discovery call.',
        keyPoints: 'Highlight benefit A and benefit B.'
      } }],
    };
    setWorkflows(prev => [newWorkflow, ...prev]);
    setExpandedWorkflowId(newWorkflow.id);
  };

  const handleUpdateWorkflow = (id: string, updates: Partial<Workflow>) => {
    setWorkflows(prev => prev.map(wf => (wf.id === id ? { ...wf, ...updates } : wf)));
  };

  const handleRemoveWorkflow = (id: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      setWorkflows(prev => prev.filter(wf => wf.id !== id));
    }
  };

  const handleAddStep = (workflowId: string, type: WorkflowStep['action']['type']) => {
    const newStep: WorkflowStep = { id: `step-${Date.now()}`, action: { type } as any };
    switch (type) {
      case 'sendTemplate': (newStep.action as any).templateId = templates[0]?.id; break;
      case 'sendAIEmail': 
        (newStep.action as any).tone = 'Professional';
        (newStep.action as any).purpose = 'Follow up on our last conversation.';
        (newStep.action as any).keyPoints = '';
        break;
      case 'createTask': (newStep.action as any).taskDescription = 'Follow up with {{first_name}}'; break;
      case 'wait': (newStep.action as any).days = 2; break;
    }
    setWorkflows(prev => prev.map(wf =>
      wf.id === workflowId ? { ...wf, steps: [...wf.steps, newStep] } : wf
    ));
  };
  
  const handleUpdateStep = (workflowId: string, stepId: string, newAction: WorkflowStep['action']) => {
    setWorkflows(prev => prev.map(wf => {
      if (wf.id === workflowId) {
        return {
          ...wf,
          steps: wf.steps.map(step => step.id === stepId ? { ...step, action: newAction } : step)
        };
      }
      return wf;
    }));
  };
  
  const handleRemoveStep = (workflowId: string, stepId: string) => {
     setWorkflows(prev => prev.map(wf => {
      if (wf.id === workflowId) {
        return { ...wf, steps: wf.steps.filter(s => s.id !== stepId) };
      }
      return wf;
    }));
  };

  const handleGeneratePreview = async (stepId: string, action: WorkflowStep['action']) => {
    if (action.type !== 'sendAIEmail') return;
    
    const { prospectId } = previewState[stepId] || {};
    const prospect = prospects.find(p => p.id === prospectId);

    if (!prospect) {
        alert("Please select a prospect to generate a preview for.");
        return;
    }

    setPreviewState(prev => ({ ...prev, [stepId]: { ...prev[stepId], isGenerating: true, content: undefined, sources: [] } }));
    
    try {
        const { body, sources } = await generateWorkflowEmail(prospect, action.tone, action.purpose, action.keyPoints);
        setPreviewState(prev => ({ ...prev, [stepId]: { ...prev[stepId], isGenerating: false, content: body, sources: sources } }));
    } catch (error) {
        console.error(error);
        setPreviewState(prev => ({ ...prev, [stepId]: { ...prev[stepId], isGenerating: false, content: 'Error generating content.' } }));
    }
  };


  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Workflows</h1>
          <p className="mt-1 text-gray-600 dark:text-slate-400">Create intelligent, multi-step automations for your sales process.</p>
        </div>
        <button onClick={handleAddWorkflow} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
          <PlusCircle className="h-5 w-5 mr-2" />
          New Workflow
        </button>
      </div>

      <div className="space-y-4">
        {workflows.map(workflow => {
          const isExpanded = expandedWorkflowId === workflow.id;
          return (
            <Card key={workflow.id} className="overflow-hidden">
              <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => setExpandedWorkflowId(isExpanded ? null : workflow.id)}>
                <div className="flex items-center gap-4">
                  <GitFork className="h-8 w-8 text-blue-500" />
                  <div>
                    <input type="text" value={workflow.name} onChange={(e) => handleUpdateWorkflow(workflow.id, { name: e.target.value })} onClick={e => e.stopPropagation()} className="text-lg font-semibold bg-transparent rounded-md p-1 -ml-1 hover:bg-slate-100 dark:hover:bg-slate-700 focus:ring-2 focus:ring-blue-500"/>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-slate-400">
                      <span>When status becomes</span>
                      <select value={workflow.trigger.status} onChange={(e) => handleUpdateWorkflow(workflow.id, { trigger: { type: 'statusChange', status: e.target.value as ProspectStatus } })} onClick={e => e.stopPropagation()} className="font-semibold bg-transparent rounded-md p-1 border border-transparent hover:border-slate-300 dark:hover:border-slate-600">
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveWorkflow(workflow.id); }} className="p-2 text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50"><Trash2 className="h-5 w-5" /></button>
                  <ChevronDown className={`h-6 w-6 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {isExpanded && (
                <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <div className="space-y-2">
                    {workflow.steps.map((step, index) => {
                      const StepIcon = stepIcons[step.action.type];
                      const currentPreview = previewState[step.id] || {};

                      return (
                        <React.Fragment key={step.id}>
                          {index > 0 && <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-gray-400 dark:text-slate-500"/></div>}
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-grow">
                              <StepIcon className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                              <div className="flex-grow space-y-3">
                                {step.action.type === 'sendTemplate' && (
                                  <select value={step.action.templateId} onChange={e => {
                                      const currentAction = step.action;
                                      if (currentAction.type === 'sendTemplate') {
                                        handleUpdateStep(workflow.id, step.id, { ...currentAction, templateId: e.target.value });
                                      }
                                    }} className="py-1 pl-2 pr-8 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 focus:border-blue-500">
                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                  </select>
                                )}
                                {step.action.type === 'sendAIEmail' && (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">Send AI Email with <select value={step.action.tone} onChange={e => {
                                        const currentAction = step.action;
                                        if (currentAction.type === 'sendAIEmail') {
                                          handleUpdateStep(workflow.id, step.id, { ...currentAction, tone: e.target.value });
                                        }
                                      }} className="font-semibold bg-transparent rounded-md p-1 border border-slate-300 dark:border-slate-600 hover:border-slate-400">{toneOptions.map(t => <option key={t}>{t}</option>)}</select> tone</div>
                                    <textarea value={step.action.purpose} onChange={e => {
                                        const currentAction = step.action;
                                        if (currentAction.type === 'sendAIEmail') {
                                          handleUpdateStep(workflow.id, step.id, { ...currentAction, purpose: e.target.value });
                                        }
                                      }} placeholder="Primary purpose of the email..." rows={2} className="w-full text-sm bg-white dark:bg-slate-700 rounded-md p-2 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500" />
                                    <textarea value={step.action.keyPoints} onChange={e => {
                                        const currentAction = step.action;
                                        if (currentAction.type === 'sendAIEmail') {
                                          handleUpdateStep(workflow.id, step.id, { ...currentAction, keyPoints: e.target.value });
                                        }
                                      }} placeholder="Key points to include (optional)..." rows={2} className="w-full text-sm bg-white dark:bg-slate-700 rounded-md p-2 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500" />
                                     <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md space-y-2">
                                        <h4 className="text-sm font-semibold flex items-center text-gray-800 dark:text-slate-200"><Wand2 className="h-4 w-4 mr-2 text-purple-500"/>Preview AI Personalization</h4>
                                        <div className="flex items-center gap-2">
                                            <select value={currentPreview.prospectId || ''} onChange={(e) => setPreviewState(p => ({...p, [step.id]: {...p[step.id], prospectId: e.target.value}}))} className="flex-grow p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 focus:border-blue-500">
                                                <option value="">Select prospect to preview...</option>
                                                {prospects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <button onClick={() => handleGeneratePreview(step.id, step.action)} disabled={!currentPreview.prospectId || currentPreview.isGenerating} className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm flex items-center disabled:opacity-50">
                                                {currentPreview.isGenerating ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Generate Preview'}
                                            </button>
                                        </div>
                                         {currentPreview.isGenerating ? (<div className="text-center p-4 text-sm text-gray-500">Generating with Gemini...</div>) : currentPreview.content && (
                                            <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-white dark:bg-slate-800 rounded-md border dark:border-slate-600" dangerouslySetInnerHTML={{ __html: currentPreview.content }}/>
                                        )}
                                    </div>
                                  </div>
                                )}
                                {step.action.type === 'createTask' && (
                                  <input type="text" value={step.action.taskDescription} onChange={e => {
                                      const currentAction = step.action;
                                      if (currentAction.type === 'createTask') {
                                        handleUpdateStep(workflow.id, step.id, { ...currentAction, taskDescription: e.target.value });
                                      }
                                    }} className="w-full text-sm bg-transparent rounded-md p-1 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500" />
                                )}
                                {step.action.type === 'wait' && (
                                  <div className="flex items-center gap-2 text-sm">Wait for <input type="number" min="1" value={step.action.days} onChange={e => {
                                      const currentAction = step.action;
                                      if (currentAction.type === 'wait') {
                                        handleUpdateStep(workflow.id, step.id, { ...currentAction, days: parseInt(e.target.value) || 1 });
                                      }
                                    }} className="w-16 p-1 text-center font-semibold bg-transparent rounded-md border border-slate-300 dark:border-slate-600" /> days</div>
                                )}
                              </div>
                            </div>
                            <button onClick={() => handleRemoveStep(workflow.id, step.id)} className="p-2 text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 flex-shrink-0"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </React.Fragment>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-4 mt-2 border-t border-dashed dark:border-slate-700 flex-wrap">
                    <span className="text-sm font-medium mr-2">Add Step:</span>
                    <button onClick={() => handleAddStep(workflow.id, 'sendAIEmail')} className="px-3 py-1 text-xs bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Wand2 className="h-4 w-4 mr-2"/>AI Email</button>
                    <button onClick={() => handleAddStep(workflow.id, 'sendTemplate')} className="px-3 py-1 text-xs bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Mail className="h-4 w-4 mr-2"/>Template</button>
                    <button onClick={() => handleAddStep(workflow.id, 'createTask')} className="px-3 py-1 text-xs bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Briefcase className="h-4 w-4 mr-2"/>Task</button>
                    <button onClick={() => handleAddStep(workflow.id, 'wait')} className="px-3 py-1 text-xs bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Clock className="h-4 w-4 mr-2"/>Wait</button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};