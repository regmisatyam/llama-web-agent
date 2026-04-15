'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface VoiceAgentProps {
  onVoiceCommand: (command: string) => void;
  onIDECommand?: (command: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

const WaveBar = ({ delay, isActive }: { delay: number; isActive: boolean }) => (
  <div
    className={`w-0.5 rounded-full transition-all duration-150 ${isActive ? 'bg-red-400' : 'bg-gray-600'}`}
    style={{
      height: isActive ? `${Math.random() * 20 + 6}px` : '4px',
      animationDelay: `${delay}ms`,
      animation: isActive ? `wave 0.8s ease-in-out ${delay}ms infinite alternate` : 'none',
    }}
  />
);

const IDE_COMMANDS = [
  { trigger: 'preview', label: 'preview', desc: 'Open preview in new tab' },
  { trigger: 'new file', label: 'new file', desc: 'Open create file dialog' },
  { trigger: 'create file', label: 'create file', desc: 'Open create file dialog' },
  { trigger: 'rename file to', label: 'rename file to [name]', desc: 'Rename current file' },
];

const CODE_COMMANDS = [
  { trigger: 'modify', label: 'modify [text]', desc: 'Modify code element' },
  { trigger: 'add', label: 'add [text]', desc: 'Add new element/code' },
  { trigger: 'change', label: 'change [text]', desc: 'Change existing code' },
  { trigger: 'delete', label: 'delete [text]', desc: 'Remove element' },
  { trigger: 'create', label: 'create [text]', desc: 'Create new component' },
  { trigger: 'make', label: 'make [text]', desc: 'Build something new' },
  { trigger: 'build', label: 'build [text]', desc: 'Build something new' },
  { trigger: 'fix', label: 'fix [text]', desc: 'Fix or debug code' },
  { trigger: 'style', label: 'style [text]', desc: 'Style with CSS/Tailwind' },
];

const VoiceAgent: React.FC<VoiceAgentProps> = ({
  onVoiceCommand,
  onIDECommand,
  isListening,
  setIsListening
}) => {
  const [editableCommand, setEditableCommand] = useState('');
  const [showEditMode, setShowEditMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [waveBars, setWaveBars] = useState<number[]>([]);
  const waveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const commands = [
    ...CODE_COMMANDS.map(c => ({
      command: `${c.trigger} *`,
      callback: (rest: string) => {
        const full = `${c.trigger} ${rest}`;
        setStatusMsg(`Recognized: "${full}"`);
        prepareCommandForEditing(full);
      }
    })),
    ...IDE_COMMANDS.map(c => ({
      command: c.trigger === 'rename file to' ? `rename file to *` : c.trigger,
      callback: (rest?: string) => {
        const full = c.trigger + (rest ? ` ${rest}` : '');
        setStatusMsg(`IDE command: "${full}"`);
        if (onIDECommand) onIDECommand(full);
        else prepareCommandForEditing(full);
      }
    })),
    {
      command: 'send',
      callback: () => {
        if (editableCommand) processVoiceCommand(editableCommand);
      }
    },
    {
      command: 'cancel',
      callback: () => handleCancelEdit()
    },
    {
      command: 'stop listening',
      callback: () => {
        setStatusMsg('Voice paused');
        stopListening();
      }
    },
    {
      command: 'clear',
      callback: () => {
        resetTranscript();
        setStatusMsg('Transcript cleared');
      }
    }
  ];

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition({ commands });

  // Animate waveform bars
  useEffect(() => {
    if (listening) {
      setWaveBars(Array.from({ length: 24 }, () => Math.random() * 100));
      waveTimerRef.current = setInterval(() => {
        setWaveBars(Array.from({ length: 24 }, () => Math.random() * 100));
      }, 200);
    } else {
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
      setWaveBars([]);
    }
    return () => { if (waveTimerRef.current) clearInterval(waveTimerRef.current); };
  }, [listening]);

  const prepareCommandForEditing = useCallback((command: string) => {
    setEditableCommand(command);
    setShowEditMode(true);
    if (listening) SpeechRecognition.stopListening();
  }, [listening]);

  const processVoiceCommand = useCallback((command: string) => {
    setIsProcessing(true);
    setStatusMsg('Processing...');
    onVoiceCommand(command);
    setTimeout(() => {
      resetTranscript();
      setIsProcessing(false);
      setShowEditMode(false);
      setEditableCommand('');
      setStatusMsg('');
    }, 800);
  }, [onVoiceCommand, resetTranscript]);

  const startListening = useCallback(() => {
    setIsListening(true);
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
  }, [setIsListening]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    SpeechRecognition.stopListening();
  }, [setIsListening]);

  const toggleListening = useCallback(() => {
    listening ? stopListening() : startListening();
  }, [listening, startListening, stopListening]);

  useEffect(() => {
    if (isListening && !listening && !showEditMode) startListening();
    else if (!isListening && listening) stopListening();
  }, [isListening, listening, startListening, stopListening, showEditMode]);

  const handleSendEditedCommand = () => {
    if (editableCommand.trim()) processVoiceCommand(editableCommand);
  };

  const handleCancelEdit = () => {
    setShowEditMode(false);
    setEditableCommand('');
    if (isListening) startListening();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'v') toggleListening();
      if (e.altKey && e.key === 'e' && transcript) prepareCommandForEditing(transcript);
      if (e.altKey && e.key === 's' && showEditMode && editableCommand) handleSendEditedCommand();
      if (e.key === 'Escape' && showEditMode) handleCancelEdit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleListening, transcript, prepareCommandForEditing, showEditMode, editableCommand]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-3 bg-red-900/30 border border-red-700/50 text-red-300 text-xs rounded-xl">
        Voice recognition is not supported in this browser. Try Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="voice-agent">
      <style jsx global>{`
        @keyframes wave {
          0% { height: 4px; }
          100% { height: 24px; }
        }
      `}</style>

      {showEditMode ? (
        <div className="bg-gray-900/80 rounded-xl p-3 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-300 font-medium">Edit command before sending</span>
            <div className="flex gap-1 text-[10px] text-gray-600">
              <span className="bg-gray-800 px-1.5 py-0.5 rounded">Alt+S</span> send,
              <span className="bg-gray-800 px-1.5 py-0.5 rounded ml-1">Esc</span> cancel
            </div>
          </div>
          <textarea
            value={editableCommand}
            onChange={e => setEditableCommand(e.target.value)}
            className="w-full bg-gray-950 text-white text-xs rounded-lg p-2.5 mb-2 resize-none outline-none border border-gray-700 focus:border-blue-500"
            rows={2}
            placeholder="Edit your command here..."
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendEditedCommand(); }
              if (e.key === 'Escape') handleCancelEdit();
            }}
          />
          <div className="flex justify-end gap-2">
            <button onClick={handleCancelEdit} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors">Cancel</button>
            <button onClick={handleSendEditedCommand} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors">Send</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Main control row */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleListening}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                listening
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
              }`}
              title={listening ? 'Stop (Alt+V)' : 'Start (Alt+V)'}
            >
              {listening && (
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
              )}
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {listening ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h6v4H9z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                )}
              </svg>
            </button>

            <div className="flex-1">
              {/* Waveform */}
              {listening ? (
                <div className="flex items-center gap-0.5 h-7">
                  {waveBars.map((h, i) => (
                    <div
                      key={i}
                      className="w-0.5 rounded-full bg-red-400 transition-all duration-200"
                      style={{ height: `${Math.max(3, h * 0.25)}px` }}
                    />
                  ))}
                </div>
              ) : (
                <div>
                  <span className="text-xs text-gray-500 block">
                    {isProcessing ? 'Processing...' : 'Click to activate voice'}
                  </span>
                  <span className="text-[10px] text-gray-700">Alt+V to toggle</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowHelp(h => !h)}
              className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              {showHelp ? 'Hide' : 'Commands'}
            </button>
          </div>

          {/* Live transcript */}
          {listening && (
            <div className="bg-gray-950/80 rounded-lg px-3 py-2 border border-gray-800">
              <div className="text-[10px] text-gray-600 mb-1">Transcript</div>
              <div className="text-xs text-gray-300 italic min-h-[1.2em]">
                {transcript || <span className="text-gray-600">Speak now...</span>}
              </div>
              {statusMsg && (
                <div className={`mt-1.5 text-[10px] ${isProcessing ? 'text-yellow-400' : 'text-green-400'}`}>
                  {statusMsg}
                </div>
              )}
              {transcript && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => prepareCommandForEditing(transcript)}
                    className="text-[10px] px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                  >
                    Edit (Alt+E)
                  </button>
                  <button
                    onClick={() => processVoiceCommand(transcript)}
                    className="text-[10px] px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Send Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Help panel */}
          {showHelp && (
            <div className="bg-gray-950/80 rounded-lg p-3 border border-gray-800 text-[10px] space-y-2">
              <div>
                <div className="text-gray-500 font-semibold uppercase tracking-wider mb-1">Code Commands</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                  {CODE_COMMANDS.map(c => (
                    <div key={c.trigger}>
                      <span className="text-blue-400">{c.label}</span>
                      <span className="text-gray-600 ml-1">— {c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-500 font-semibold uppercase tracking-wider mb-1">IDE Commands</div>
                <div className="space-y-0.5">
                  {IDE_COMMANDS.map(c => (
                    <div key={c.trigger}>
                      <span className="text-purple-400">{c.label}</span>
                      <span className="text-gray-600 ml-1">— {c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-500 font-semibold uppercase tracking-wider mb-1">Keyboard</div>
                <div className="space-y-0.5 text-gray-600">
                  <div><span className="bg-gray-800 px-1 rounded">Alt+V</span> toggle listening</div>
                  <div><span className="bg-gray-800 px-1 rounded">Alt+E</span> edit transcript</div>
                  <div><span className="bg-gray-800 px-1 rounded">Alt+S</span> send command</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceAgent;
