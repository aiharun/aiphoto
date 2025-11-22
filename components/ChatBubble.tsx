import React from 'react';
import { Message } from '../types';
import { Download, Sparkles, User } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center py-4">
        <span className="bg-slate-900/80 backdrop-blur-sm text-slate-500 text-xs font-medium px-4 py-1.5 rounded-full border border-slate-800/50">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group px-2`}>
      <div className={`flex max-w-[85%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
          isUser 
            ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white ring-2 ring-slate-900' 
            : 'bg-slate-800 text-indigo-400 ring-1 ring-slate-700'
        }`}>
          {isUser ? <User size={14} /> : <Sparkles size={14} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div 
            className={`relative px-5 py-3.5 shadow-md text-sm leading-relaxed ${
              isUser 
                ? 'bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white rounded-lg rounded-tr-sm' 
                : 'bg-slate-800/80 backdrop-blur-sm text-slate-200 border border-slate-700/50 rounded-lg rounded-tl-sm'
            }`}
          >
            {message.content}
            
            {/* Image Attachment */}
            {message.image && !isUser && (
                <div className="mt-3 rounded-lg overflow-hidden border border-white/10 shadow-lg relative group/image bg-slate-900">
                  <img src={message.image} alt="Edited result" className="w-full h-auto object-contain max-h-[250px]" />
                  
                  <a 
                      href={message.image} 
                      download={`nano-edit-${message.id}.png`}
                      className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white p-2 rounded-lg shadow-lg opacity-0 group-hover/image:opacity-100 transition-all hover:scale-110 hover:bg-indigo-500 border border-white/20"
                      title="Download Image"
                  >
                      <Download size={16} />
                  </a>
                </div>
            )}
            
            {/* Error Indicator */}
            {message.isError && (
                <div className="mt-2 text-xs text-red-300 font-medium bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                    Failed to process
                </div>
            )}
          </div>
          
          <span className="text-[10px] text-slate-600 mt-1 px-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(parseInt(message.id.split('_')[0])).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>

      </div>
    </div>
  );
};