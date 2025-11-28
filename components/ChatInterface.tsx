import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isProcessing: boolean;
  suggestions: string[];
  onSendMessage: (text: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isProcessing,
  suggestions,
  onSendMessage,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (window.innerWidth >= 1024) { // Only scroll on desktop where history is visible
      scrollToBottom();
    }
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 w-full">
      {/* Desktop Header */}
      <div className="hidden lg:flex p-6 border-b border-white/5 bg-gray-950/50 backdrop-blur z-10">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          AI Assistant
        </h2>
      </div>

      {/* Messages Area - Hidden on Mobile/Tablet */}
      <div className="hidden lg:flex flex-1 flex-col overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white/10 text-gray-200 rounded-bl-sm border border-white/5'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-gray-400 rounded-2xl rounded-bl-sm px-5 py-4 border border-white/5 flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-0"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="text-xs tracking-wide uppercase">Generating...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mobile/Tablet Spacer to push input down if needed */}
      <div className="lg:hidden flex-1"></div>

      {/* Suggestions Area - Always visible, styled with 'visual' elements */}
      {suggestions.length > 0 && !isProcessing && (
        <div className="px-6 pb-2 pt-4 animate-[fadeIn_0.5s_ease-out]">
            <p className="text-gray-500 text-xs mb-3 uppercase tracking-wider font-medium px-1">Suggested Edits</p>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
            {suggestions.map((s, i) => (
                <button
                key={i}
                onClick={() => onSendMessage(s)}
                className="flex-shrink-0 lg:w-full text-left group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 p-1"
                >
                    <div className="flex items-center gap-3 p-2">
                        {/* Icon representing the 'image' aspect of the suggestion */}
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 group-hover:text-white transition-colors">
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                <path d="m21 2-9 9m9-9H17m4 0v4"></path>
                            </svg>
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors whitespace-nowrap lg:whitespace-normal pr-2">
                            {s}
                        </span>
                    </div>
                </button>
            ))}
            </div>
        </div>
      )}

      {/* Mobile Status Indicator (since history is hidden) */}
      {isProcessing && (
        <div className="lg:hidden px-6 py-2 flex items-center justify-center gap-2 text-indigo-400 animate-pulse">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
            <span className="text-xs uppercase tracking-wide font-medium">Generating Edit...</span>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 bg-gray-950 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isProcessing ? "Improving image..." : "Ask to edit image..."}
            disabled={isProcessing}
            className="w-full bg-white/5 text-white rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-white/10 placeholder-gray-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-0 disabled:translate-x-2 transition-all duration-200 shadow-lg shadow-indigo-900/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};