'use client';

import { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface VoiceAgentProps {
  onVoiceCommand: (command: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ 
  onVoiceCommand, 
  isListening, 
  setIsListening 
}) => {
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editableCommand, setEditableCommand] = useState<string>('');
  const [showEditMode, setShowEditMode] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Configure speech recognition
  const commands = [
    {
      command: 'modify *',
      callback: (modifyCommand: string) => {
        setMessage(`Command recognized: "modify ${modifyCommand}"`);
        prepareCommandForEditing(`modify ${modifyCommand}`);
      }
    },
    {
      command: 'add *',
      callback: (addCommand: string) => {
        setMessage(`Command recognized: "add ${addCommand}"`);
        prepareCommandForEditing(`add ${addCommand}`);
      }
    },
    {
      command: 'change *',
      callback: (changeCommand: string) => {
        setMessage(`Command recognized: "change ${changeCommand}"`);
        prepareCommandForEditing(`change ${changeCommand}`);
      }
    },
    {
      command: 'delete *',
      callback: (deleteCommand: string) => {
        setMessage(`Command recognized: "delete ${deleteCommand}"`);
        prepareCommandForEditing(`delete ${deleteCommand}`);
      }
    },
    {
      command: 'stop listening',
      callback: () => {
        setMessage('Voice recognition paused');
        stopListening();
      }
    },
    {
      command: 'send',
      callback: () => {
        if (editableCommand) {
          setMessage('Sending command...');
          processVoiceCommand(editableCommand);
        }
      }
    },
    {
      command: 'edit',
      callback: () => {
        if (transcript) {
          prepareCommandForEditing(transcript);
        }
      }
    }
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({ commands });

  // Prepare command for editing
  const prepareCommandForEditing = useCallback((command: string) => {
    setEditableCommand(command);
    setShowEditMode(true);
    // Pause listening while editing
    if (listening) {
      SpeechRecognition.stopListening();
    }
  }, [listening]);

  // Process the voice command
  const processVoiceCommand = useCallback((command: string) => {
    setIsProcessing(true);
    
    // Send the command to the parent component
    onVoiceCommand(command);
    
    // Reset for next command
    setTimeout(() => {
      resetTranscript();
      setIsProcessing(false);
      setShowEditMode(false);
      setEditableCommand('');
    }, 1000);
  }, [onVoiceCommand, resetTranscript]);

  // Start listening
  const startListening = useCallback(() => {
    setIsListening(true);
    SpeechRecognition.startListening({ continuous: true });
  }, [setIsListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    setIsListening(false);
    SpeechRecognition.stopListening();
  }, [setIsListening]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  // Update UI when listening state changes
  useEffect(() => {
    if (isListening && !listening && !showEditMode) {
      startListening();
    } else if (!isListening && listening) {
      stopListening();
    }
  }, [isListening, listening, startListening, stopListening, showEditMode]);

  // Handle sending the edited command
  const handleSendEditedCommand = () => {
    if (editableCommand.trim()) {
      processVoiceCommand(editableCommand);
    }
  };

  // Handle canceling the edit
  const handleCancelEdit = () => {
    setShowEditMode(false);
    setEditableCommand('');
    // Resume listening if it was active
    if (isListening) {
      startListening();
    }
  };

  // Add keyboard shortcut for voice agent
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+V to toggle voice recognition
      if (e.altKey && e.key === 'v') {
        toggleListening();
      }
      
      // Alt+E to edit the current transcript
      if (e.altKey && e.key === 'e' && transcript) {
        prepareCommandForEditing(transcript);
      }
      
      // Alt+S to send the edited command
      if (e.altKey && e.key === 's' && showEditMode && editableCommand) {
        handleSendEditedCommand();
      }
      
      // Escape to cancel edit mode
      if (e.key === 'Escape' && showEditMode) {
        handleCancelEdit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening, transcript, prepareCommandForEditing, showEditMode, editableCommand, handleSendEditedCommand, handleCancelEdit]);

  // Toggle help section
  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  // Check browser support
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-3 bg-red-900 bg-opacity-30 text-red-200 text-sm rounded-md">
        Your browser doesn't support speech recognition.
      </div>
    );
  }

  return (
    <div className="voice-agent">
      {/* Edit Mode */}
      {showEditMode ? (
        <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-300">Edit your command:</div>
            <div className="text-xs text-gray-500">
              <span className="bg-gray-700 px-1 rounded">Alt+S</span> to send, 
              <span className="bg-gray-700 px-1 rounded ml-1">Esc</span> to cancel
            </div>
          </div>
          <textarea
            value={editableCommand}
            onChange={(e) => setEditableCommand(e.target.value)}
            className="w-full bg-gray-900 text-white rounded p-2 text-sm mb-3 min-h-[60px]"
            placeholder="Edit your command here..."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEditedCommand}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
            >
              Send Command
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-full ${
                  listening 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title={listening ? 'Stop listening (Alt+V)' : 'Start listening (Alt+V)'}
              >
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {listening ? (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" 
                    />
                  ) : (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                    />
                  )}
                </svg>
              </button>
              <div>
                <span className={`text-sm block ${listening ? 'text-green-400' : 'text-gray-400'}`}>
                  {listening ? 'Listening...' : 'Voice Agent (Click to activate)'}
                </span>
                <span className="text-xs text-gray-500">Press <span className="bg-gray-700 px-1 rounded">Alt+V</span> to toggle</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={toggleHelp}
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showHelp ? 'Hide Help' : 'Show Commands'}
              </button>
            </div>
            
            {listening && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs text-gray-400">
                  Try saying: "modify button color to blue"
                </span>
              </div>
            )}
          </div>
          
          {listening && transcript && (
            <div className="bg-gray-800 rounded-md p-2 text-sm">
              <div className="text-gray-400 mb-1 text-xs">Transcript:</div>
              <div className="text-gray-200 italic">
                {transcript || 'Speak now...'}
              </div>
              {message && (
                <div className={`mt-2 text-xs ${isProcessing ? 'text-yellow-400' : 'text-green-400'}`}>
                  {message}
                </div>
              )}
              {transcript && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => prepareCommandForEditing(transcript)}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs flex items-center gap-1"
                    title="Edit Command (Alt+E)"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Command <span className="ml-1 text-gray-400">(Alt+E)</span>
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Help section */}
          {showHelp && (
            <div className="mt-2 bg-gray-900 rounded-md p-2 text-xs border border-gray-700">
              <h4 className="font-medium text-gray-300 mb-1">Available Voice Commands:</h4>
              <ul className="space-y-1 text-gray-400">
                <li><span className="text-blue-400">modify [text]</span> - Modify code with your instructions</li>
                <li><span className="text-blue-400">add [text]</span> - Add new code or elements</li>
                <li><span className="text-blue-400">change [text]</span> - Change existing code</li>
                <li><span className="text-blue-400">delete [text]</span> - Delete code elements</li>
                <li><span className="text-blue-400">edit</span> - Edit the current transcript</li>
                <li><span className="text-blue-400">send</span> - Send the edited command</li>
                <li><span className="text-blue-400">stop listening</span> - Turn off voice recognition</li>
              </ul>
              <h4 className="font-medium text-gray-300 mt-2 mb-1">Keyboard Shortcuts:</h4>
              <ul className="space-y-1 text-gray-400">
                <li><span className="bg-gray-700 px-1 rounded">Alt+V</span> - Toggle voice recognition</li>
                <li><span className="bg-gray-700 px-1 rounded">Alt+E</span> - Edit current transcript</li>
                <li><span className="bg-gray-700 px-1 rounded">Alt+S</span> - Send edited command</li>
                <li><span className="bg-gray-700 px-1 rounded">Esc</span> - Cancel editing</li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VoiceAgent; 