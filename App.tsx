import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, Download, RefreshCw, Undo2, Redo2, Sparkles, Plus, Image as ImageIcon, Wand2 } from 'lucide-react';
import { generateEditOrDescription } from './services/geminiService';
import { Message } from './types';
import { ChatBubble } from './components/ChatBubble';
import { Spinner } from './components/Spinner';

// --- UI Components ---

const IconButton = ({ 
  icon, 
  onClick, 
  disabled = false, 
  active = false,
  className = "",
  title
}: {
  icon: React.ReactNode, 
  onClick?: () => void, 
  disabled?: boolean,
  active?: boolean,
  className?: string,
  title?: string
}) => {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      title={title}
      className={`
        w-11 h-11 flex items-center justify-center rounded-lg transition-all duration-300
        ${disabled 
          ? 'text-slate-600 cursor-not-allowed' 
          : active 
            ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
            : 'text-slate-400 hover:bg-white/10 hover:text-indigo-300 hover:scale-105 active:scale-95'
        }
        ${className}
      `}
    >
      {icon}
    </button>
  );
};

const App: React.FC = () => {
  // State
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived State
  const currentImage = historyIndex >= 0 ? history[historyIndex] : null;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle File Upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setHistory([base64String]);
      setHistoryIndex(0);
      
      setMessages([
        {
          id: Date.now().toString(),
          role: 'system',
          content: 'Welcome to the studio. How shall we transform this image?',
        },
        {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: "I'm connected and ready. Describe your vision.",
        }
      ]);
    };
    reader.readAsDataURL(file);
  };

  // Handle Undo/Redo
  const handleUndo = () => {
    if (canUndo) {
      setHistoryIndex(prev => prev - 1);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      setHistoryIndex(prev => prev + 1);
    }
  };

  // Handle Send Message
  const handleSendMessage = async () => {
    const textToSend = inputPrompt;
    if (!textToSend.trim() || !currentImage || isLoading) return;

    setInputPrompt('');
    setIsLoading(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await generateEditOrDescription(currentImage, textToSend);
      const newMessages: Message[] = [];

      if (response.image) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(response.image);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        newMessages.push({
          id: Date.now().toString() + '_img',
          role: 'ai',
          content: response.text || "Transformation complete.",
          image: response.image, 
        });
      } else {
        newMessages.push({
          id: Date.now().toString() + '_txt',
          role: 'ai',
          content: response.text || "Analysis complete.",
        });
      }
      setMessages((prev) => [...prev, ...newMessages]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'ai',
          content: "I encountered an issue processing that request.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    if (history.length > 0) {
        if (window.confirm("Reset to original image?")) {
            setHistoryIndex(0);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: "Canvas reset to original."}]);
        }
    }
  };

  // --- Empty State (Landing) ---
  if (!currentImage) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500/30">
        
        {/* Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] opacity-40 animate-pulse delay-0"></div>
             <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-md w-full text-center z-10 relative">
          <div className="w-24 h-24 bg-slate-900/50 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl flex items-center justify-center mx-auto mb-10 hover:scale-105 transition-transform duration-500 ring-1 ring-white/5">
            <Wand2 className="text-indigo-400 w-10 h-10" />
          </div>
          
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-4 tracking-tight">Nano Editor</h1>
          <p className="text-slate-400 mb-12 text-lg font-light">
            AI-powered image transformation. <br/> 
            <span className="text-slate-500">Powered by Gemini 2.5 Flash.</span>
          </p>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="group relative w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-400 text-white rounded-lg font-medium text-lg shadow-xl shadow-indigo-900/10 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-fuchsia-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative flex items-center justify-center gap-3">
               <ImageIcon size={20} className="text-indigo-400" />
               Open Image
            </span>
          </button>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>
      </div>
    );
  }

  // --- Main App Layout ---
  return (
    <div className="fixed inset-0 w-full h-full flex bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* LEFT PANEL: Image Canvas */}
      {/* Full width on mobile, flex-1 on desktop */}
      <div className="relative w-full lg:flex-1 h-full flex flex-col">
        
        {/* Ambient Glow for Canvas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-900/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Bottom Toolbar - Floating Glass Pill */}
        {/* Mobile: bottom-28 (above input), Desktop: bottom-8 */}
        <div className="absolute bottom-28 lg:bottom-8 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 shadow-2xl pointer-events-auto flex items-center gap-2">
                <IconButton icon={<Upload size={18} />} onClick={() => fileInputRef.current?.click()} title="New Image" />
                <div className="w-px h-5 bg-white/10 mx-1"></div>
                <IconButton icon={<Undo2 size={18} />} onClick={handleUndo} disabled={!canUndo} title="Undo" />
                <IconButton icon={<Redo2 size={18} />} onClick={handleRedo} disabled={!canRedo} title="Redo" />
                <IconButton icon={<RefreshCw size={18} />} onClick={handleReset} title="Reset" />
                <div className="w-px h-5 bg-white/10 mx-1"></div>
                <a 
                    href={currentImage} 
                    download="nano-edited.png"
                    className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-500 hover:text-white transition-all duration-300"
                    title="Download"
                >
                    <Download size={18} />
                </a>
            </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-12 relative z-10">
           <div className="relative transition-all duration-500 ease-out max-w-full max-h-full">
               {/* The Image with 8px rounded corners */}
               <img 
                  src={currentImage} 
                  alt="Editing Canvas" 
                  className={`
                    max-w-full max-h-[80dvh] object-contain shadow-2xl transition-all duration-500
                    rounded-lg 
                    ${isLoading ? 'opacity-50 grayscale-[0.3] scale-[0.98] blur-sm' : 'scale-100'}
                  `} 
               />

               {/* Loading State Overlay */}
               {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="bg-slate-950/80 backdrop-blur-md p-6 rounded-lg border border-indigo-500/30 shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <Spinner className="w-8 h-8 text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-200 tracking-wide animate-pulse">PROCESSING</span>
                    </div>
                 </div>
               )}
           </div>
        </div>

        {/* Mobile Input Overlay (Only visible on < lg) */}
        <div className="lg:hidden absolute bottom-0 left-0 w-full p-4 z-40 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pb-8">
             <div className="relative flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl p-2 rounded-lg border border-white/10 shadow-2xl ring-1 ring-white/5">
                <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe change..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 px-4 py-2 text-base"
                    disabled={isLoading}
                />
                <button 
                    onClick={() => handleSendMessage()}
                    disabled={!inputPrompt.trim() || isLoading}
                    className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-lg disabled:opacity-50 transition-transform active:scale-90"
                >
                    <Send size={18} />
                </button>
             </div>
        </div>
      </div>

      {/* RIGHT PANEL: Chat Interface */}
      {/* Hidden on mobile/tablet (< lg), visible on desktop */}
      <div className="hidden lg:flex w-[400px] h-full flex-col bg-slate-900/30 backdrop-blur-xl border-l border-white/5 z-20">
         
         {/* Chat Header */}
         <div className="p-6 border-b border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                    <Sparkles size={14} className="text-white" />
                </div>
                <span className="font-medium text-slate-200 tracking-wide text-sm">AI Assistant</span>
             </div>
             <div className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                 GEMINI 2.5
             </div>
         </div>

         {/* Messages List */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-6 bg-gradient-to-t from-slate-950/50 to-transparent">
            <div className="relative flex items-center gap-2 bg-slate-800/50 backdrop-blur-md p-2 rounded-lg border border-white/10 shadow-lg focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What would you like to change?"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-500 px-4 py-2 text-sm"
                    disabled={isLoading}
                />
                <button 
                    onClick={() => handleSendMessage()}
                    disabled={!inputPrompt.trim() || isLoading}
                    className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white rounded-lg shadow-lg shadow-indigo-900/50 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                >
                    <Send size={18} />
                </button>
            </div>
         </div>
      </div>

      {/* Hidden File Input for Reset */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
    </div>
  );
};

export default App;