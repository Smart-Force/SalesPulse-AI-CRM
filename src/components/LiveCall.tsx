import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';
import type { Prospect, TranscriptEntry, ContactHistoryItem } from '../types';
import { summarizeCallTranscript } from '../services/aiService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Phone, MicOff, Bot, User, Loader2, Lightbulb, TrendingUp, CheckCircle, FileText, AlertCircle, CircleDot, Save } from 'lucide-react';
import { useToasts } from '../contexts/ToastContext';

// --- Audio Helper Functions (as per Gemini API guidelines) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Component ---
type CallState = 'idle' | 'requesting_mic' | 'connecting' | 'live' | 'ending' | 'processing_summary' | 'ended' | 'error';

interface LiveCallProps {
  prospects: Prospect[];
  setProspects: React.Dispatch<React.SetStateAction<Prospect[]>>;
}

export const LiveCall: React.FC<LiveCallProps> = ({ prospects, setProspects }) => {
    const [callState, setCallState] = useState<CallState>('idle');
    const [selectedProspectId, setSelectedProspectId] = useState<string>('');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [summary, setSummary] = useState<string>('');
    const [actionItems, setActionItems] = useState<string[]>([]);
    const [error, setError] = useState<string>('');
    const [isHistorySaved, setIsHistorySaved] = useState(false);
    const { addToast } = useToasts();
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioRefs = useRef<{
        inputCtx?: AudioContext;
        outputCtx?: AudioContext;
        scriptProcessor?: ScriptProcessorNode;
        sources: Set<AudioBufferSourceNode>;
        nextStartTime: number;
    }>({ sources: new Set(), nextStartTime: 0 });

    const selectedProspect = useMemo(() => prospects.find(p => p.id === selectedProspectId), [prospects, selectedProspectId]);
    
    const cleanup = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        audioRefs.current.scriptProcessor?.disconnect();
        audioRefs.current.inputCtx?.close();
        audioRefs.current.outputCtx?.close();
        audioRefs.current.sources.forEach(source => source.stop());
        sessionPromiseRef.current = null;
        streamRef.current = null;
        audioRefs.current = { sources: new Set(), nextStartTime: 0 };
    };
    
    useEffect(() => {
        return () => cleanup();
    }, []);

    const handleStartCall = async () => {
        if (!selectedProspectId) {
            addToast('Please select a prospect for the call.', 'error');
            return;
        }

        setCallState('requesting_mic');
        setError('');
        setTranscript([]);
        setSummary('');
        setActionItems([]);
        setIsHistorySaved(false);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            setCallState('connecting');

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            audioRefs.current.inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioRefs.current.outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = audioRefs.current.outputCtx.createGain();

            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: `You are an AI assistant acting as a prospect for a sales training call. The user is a sales representative for a company called 'SalesPulse AI'. You are playing the role of ${selectedProspect?.name || 'a prospect'}, the ${selectedProspect?.title || 'decision maker'} at ${selectedProspect?.company || 'a company'}. Respond naturally based on this persona.`,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setCallState('live');
                        const source = audioRefs.current.inputCtx!.createMediaStreamSource(stream);
                        const scriptProcessor = audioRefs.current.inputCtx!.createScriptProcessor(4096, 1, 1);
                        audioRefs.current.scriptProcessor = scriptProcessor;
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioRefs.current.inputCtx!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle transcription
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            currentInputTranscription += text;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.speaker === 'user' && last.isPartial) {
                                    return [...prev.slice(0, -1), { ...last, text: currentInputTranscription }];
                                }
                                return [...prev, { speaker: 'user', text: currentInputTranscription, isPartial: true }];
                            });
                        }
                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            currentOutputTranscription += text;
                             setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.speaker === 'ai' && last.isPartial) {
                                    return [...prev.slice(0, -1), { ...last, text: currentOutputTranscription }];
                                }
                                return [...prev, { speaker: 'ai', text: currentOutputTranscription, isPartial: true }];
                            });
                        }
                        if (message.serverContent?.turnComplete) {
                            setTranscript(prev => prev.map(t => ({...t, isPartial: false})));
                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                        }
                        
                        // Handle audio output
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio) {
                            const outCtx = audioRefs.current.outputCtx!;
                            let nextStartTime = Math.max(audioRefs.current.nextStartTime, outCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
                            const source = outCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => audioRefs.current.sources.delete(source));
                            source.start(nextStartTime);
                            audioRefs.current.nextStartTime = nextStartTime + audioBuffer.duration;
                            audioRefs.current.sources.add(source);
                        }
                    },
                    onclose: () => {
                        console.debug('closed');
                        if (callState !== 'ending' && callState !== 'ended') {
                             handleEndCall(true);
                        }
                    },
                    onerror: (e) => {
                        console.error('Live session error:', e);
                        setError('A connection error occurred. Please try again.');
                        setCallState('error');
                        cleanup();
                    },
                },
            });

        } catch (err) {
            console.error('Error starting call:', err);
            setError('Failed to access microphone. Please check your browser permissions.');
            setCallState('error');
            cleanup();
        }
    };

    const handleEndCall = async (isClosedByServer = false) => {
        setCallState('ending');
        if (!isClosedByServer) {
            const session = await sessionPromiseRef.current;
            session?.close();
        }
        cleanup();
        
        setCallState('processing_summary');
        const fullTranscript = transcript.map(t => `${t.speaker === 'user' ? 'Sales Rep' : 'Prospect (AI)'}: ${t.text}`).join('\n');
        
        try {
            const { summary, actionItems } = await summarizeCallTranscript(fullTranscript);
            setSummary(summary);
            setActionItems(actionItems);
        } catch(err) {
            console.error("Error summarizing:", err);
            setSummary("Failed to generate summary.");
            setActionItems([]);
            addToast('Error generating call summary.', 'error');
        }

        setCallState('ended');
    };

    const handleSaveToHistory = () => {
        if (!selectedProspect) return;
        const fullTranscript = transcript.map(t => `${t.speaker === 'user' ? 'Sales Rep' : 'Prospect (AI)'}: ${t.text}`).join('\n');
        
        const newHistoryItem: ContactHistoryItem = {
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            type: 'Live Call Practice',
            title: `AI Practice Call with ${selectedProspect.name}`,
            summary: summary,
            transcript: fullTranscript,
            outcome: "Completed AI practice call.",
            aiInsight: "Call summary and action items generated by AI."
        };

        const updatedProspect: Prospect = {
            ...selectedProspect,
            contactHistory: [...(selectedProspect.contactHistory || []), newHistoryItem]
        };
        
        setProspects(prev => prev.map(p => p.id === updatedProspect.id ? updatedProspect : p));
        addToast('Call summary saved to prospect history!', 'success');
        setIsHistorySaved(true);
    };

    const isCallActive = callState === 'live' || callState === 'connecting';

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Live Conversation Intelligence</h1>
                <p className="mt-1 text-gray-600 dark:text-slate-400">Practice sales calls with a real-time AI assistant.</p>
            </div>

            {callState === 'idle' || callState === 'error' ? (
                <Card className="max-w-xl mx-auto">
                    <CardHeader>
                        <CardTitle>Start a New Call</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-500/30 flex items-center"><AlertCircle className="h-5 w-5 mr-2"/>{error}</div>}
                        <div>
                            <label htmlFor="prospect-select" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Select Prospect to Call</label>
                            <select id="prospect-select" value={selectedProspectId} onChange={e => setSelectedProspectId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                                <option value="">-- Select a Prospect --</option>
                                {prospects.map(p => <option key={p.id} value={p.id}>{p.name} - {p.company}</option>)}
                            </select>
                        </div>
                        <button onClick={handleStartCall} disabled={!selectedProspectId} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50">
                            <Phone className="h-5 w-5 mr-2" /> Start Call
                        </button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-14rem)]">
                    {/* Left Column: Transcript */}
                    <Card className="lg:col-span-2 flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <CardTitle>Live Transcript</CardTitle>
                                {isCallActive ? (
                                    <button onClick={() => handleEndCall()} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center shadow-sm">
                                        <MicOff className="h-5 w-5 mr-2" /> End Call
                                    </button>
                                ): (
                                     <button onClick={() => { setCallState('idle'); setError('')}} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm">
                                        Start New Call
                                    </button>
                                )}
                            </div>
                             <div className="flex items-center text-sm mt-2 text-gray-500 dark:text-slate-400">
                                <CircleDot className={`h-4 w-4 mr-2 ${isCallActive ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                                Status: <span className="font-semibold ml-1">{callState.replace('_', ' ')}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto">
                            {callState === 'processing_summary' || callState === 'ended' ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2"><FileText className="h-5 w-5 mr-2" /> Call Summary</h3>
                                        <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-sm text-gray-700 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">{callState === 'processing_summary' ? 'Generating summary...' : summary}</div>
                                    </div>
                                    <div>
                                        <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2"><CheckCircle className="h-5 w-5 mr-2" /> Action Items</h3>
                                        <ul className="space-y-2">
                                            {callState === 'processing_summary' ? <li className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-sm text-gray-500 dark:text-slate-400">Analyzing...</li> :
                                             actionItems.length > 0 ? actionItems.map((item, index) => (
                                                <li key={index} className="flex items-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-sm text-gray-800 dark:text-slate-200">{item}</li>
                                            )) : <li className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-sm text-gray-500 dark:text-slate-400">No action items were identified.</li>}
                                        </ul>
                                    </div>
                                    {callState === 'ended' && (
                                        <div className="pt-4 border-t dark:border-slate-700">
                                            <button onClick={handleSaveToHistory} disabled={isHistorySaved} className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                                <Save className="h-5 w-5 mr-2" /> {isHistorySaved ? 'Saved to History' : 'Save to Prospect History'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {transcript.map((entry, index) => (
                                        <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'ai' ? 'justify-end' : ''}`}>
                                            {entry.speaker === 'user' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center"><User className="h-5 w-5"/></div>}
                                            <div className={`p-3 rounded-lg max-w-md ${entry.speaker === 'user' ? 'bg-slate-100 dark:bg-slate-700' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                                                <p className="text-sm text-gray-800 dark:text-slate-200">{entry.text}</p>
                                            </div>
                                            {entry.speaker === 'ai' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center"><Bot className="h-5 w-5"/></div>}
                                        </div>
                                    ))}
                                    {isCallActive && transcript.length === 0 && <p className="text-center text-gray-500">Listening... Start speaking to begin the call.</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {/* Right Column: Insights */}
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Insights for {selectedProspect?.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!selectedProspect?.isEnriched ? (
                                <div className="text-center p-4 border-2 border-dashed rounded-lg">
                                    <p className="text-sm text-gray-500">Enrich this prospect on the Prospects page to see AI-powered insights here.</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h3 className="flex items-center font-semibold text-gray-800 dark:text-slate-200 mb-2"><Lightbulb className="h-5 w-5 mr-2 text-yellow-500" /> Key Motivations</h3>
                                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-slate-400 space-y-1">
                                            {selectedProspect.aiAnalysis?.motivations?.map((m,i) => <li key={i}>{m}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="flex items-center font-semibold text-gray-800 dark:text-slate-200 mb-2"><TrendingUp className="h-5 w-5 mr-2 text-red-500" /> Potential Pain Points</h3>
                                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-slate-400 space-y-1">
                                            {selectedProspect.aiAnalysis?.painPoints?.map((p,i) => <li key={i}>{p}</li>)}
                                        </ul>
                                    </div>
                                     <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Communication Style</h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-400 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">{selectedProspect.aiAnalysis?.communicationStyle}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};