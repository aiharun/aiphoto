import React, { useState, useEffect, useCallback } from 'react';
import { PhotoDisplay } from './components/PhotoDisplay';
import { ChatInterface } from './components/ChatInterface';
import { editImage, getPhotoSuggestions } from './services/geminiService';
import { EditState, Message } from './types';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  // Edit Mode State
  const [editState, setEditState] = useState<EditState>({
    originalImage: null,
    history: [],
    currentIndex: -1,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load suggestions when an image is first loaded
  useEffect(() => {
    const loadSuggestions = async () => {
      if (editState.originalImage && editState.history.length === 1) {
        try {
          const suggs = await getPhotoSuggestions(editState.originalImage);
          setSuggestions(suggs);
        } catch (error) {
          console.error("Failed to load suggestions");
        }
      }
    };
    loadSuggestions();
  }, [editState.originalImage, editState.history.length]);

  // Handle Image Upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setEditState({
        originalImage: base64,
        history: [base64],
        currentIndex: 0,
      });
      
      // Welcome message
      setMessages([{
          id: uuidv4(),
          role: 'model',
          text: "Hi! I've loaded your photo. How would you like to edit it?"
      }]);
    };
    reader.readAsDataURL(file);
  };

  // Edit Logic
  const handleSendMessage = async (text: string) => {
    // Add user message to UI
    const userMsg: Message = {
    id: uuidv4(),
    role: 'user',
    text,
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsProcessing(true);

    // Use the current image from history
    const currentImage = editState.history[editState.currentIndex];

    try {
      const newImageBase64 = await editImage(currentImage, text);

      // Update History
      setEditState((prev) => {
        const newHistory = prev.history.slice(0, prev.currentIndex + 1);
        newHistory.push(newImageBase64);
        return {
          ...prev,
          history: newHistory,
          currentIndex: newHistory.length - 1,
        };
      });

      const modelMsg: Message = {
        id: uuidv4(),
        role: 'model',
        text: "Here is the edited version. How does it look?",
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: uuidv4(),
        role: 'model',
        text: "Sorry, I couldn't process that edit. Please try a different prompt.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // History Navigation
  const handleUndo = useCallback(() => {
    if (editState.currentIndex > 0) {
      setEditState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
      }));
    }
  }, [editState.currentIndex]);

  const handleRedo = useCallback(() => {
    if (editState.currentIndex < editState.history.length - 1) {
      setEditState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
    }
  }, [editState.currentIndex, editState.history.length]);

  const handleReset = useCallback(() => {
    setEditState((prev) => ({
      ...prev,
      currentIndex: 0,
    }));
  }, []);

  const handleClose = () => {
      setEditState({ originalImage: null, history: [], currentIndex: -1 });
      setMessages([]);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Landing Page */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]"></div>
        </div>

        <div className="relative z-20 text-center space-y-12 max-w-4xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">
              Gemini Editor
            </h1>
            <p className="text-gray-400 text-xl md:text-2xl font-light max-w-2xl mx-auto">
              Transform your photos with simple text prompts.
            </p>
          </div>

          <div className="flex justify-center">
            <label className="group relative cursor-pointer inline-block">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
               <div className="relative bg-gray-900 text-white font-medium py-4 px-8 rounded-full transition-all duration-200 flex items-center gap-3 border border-gray-800 hover:bg-gray-800">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                   <polyline points="17 8 12 3 7 8"></polyline>
                   <line x1="12" y1="3" x2="12" y2="15"></line>
                 </svg>
                 <span className="text-lg">Select Photo</span>
               </div>
               <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageSelect} 
                />
            </label>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center z-20">
           <p className="text-gray-500 text-sm font-medium tracking-wide opacity-60">
             &copy; Sefa, Serhat, <span className="text-blue-500">Harun</span>
           </p>
        </div>
      </div>

      {/* Editing Modal Overlay */}
      {editState.originalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-[fadeIn_0.2s_ease-out]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={handleClose}
          />
          
          {/* Modal Window */}
          <div className="relative w-full h-full bg-gray-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
             
             {/* Close Button - Fixed position, centered icon */}
             <button 
                onClick={handleClose}
                className="absolute top-6 right-6 z-50 w-12 h-12 bg-black/60 hover:bg-red-500/20 hover:text-red-400 text-white/80 rounded-full backdrop-blur-md border border-white/10 transition-all duration-200 group flex items-center justify-center shadow-lg"
                title="Close Editor"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
             </button>

             {/* Main Content Area */}
             <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
                
                {/* Left: Photo Canvas */}
                <div className="flex-1 bg-gray-900/50 relative flex items-center justify-center p-8 overflow-hidden order-1 lg:order-1">
                    {/* Subtle grid pattern background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
                    </div>
                    
                    <PhotoDisplay
                        currentImage={editState.history[editState.currentIndex]}
                        originalImage={editState.originalImage}
                        hasChanges={editState.currentIndex > 0}
                        canUndo={editState.currentIndex > 0}
                        canRedo={editState.currentIndex < editState.history.length - 1}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        onReset={handleReset}
                    />
                </div>

                {/* Right: Sidebar / Chat */}
                <div className="w-full lg:w-[400px] xl:w-[450px] border-t lg:border-t-0 lg:border-l border-white/10 bg-gray-950 flex flex-col h-auto lg:h-full order-2 lg:order-2">
                    <ChatInterface
                        messages={messages}
                        isProcessing={isProcessing}
                        suggestions={suggestions}
                        onSendMessage={handleSendMessage}
                    />
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;