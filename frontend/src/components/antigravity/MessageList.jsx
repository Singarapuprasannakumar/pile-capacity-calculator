import React from 'react';
import { Brain, User } from 'lucide-react';

const MessageList = ({ messages }) => {
  if (!messages || messages.length === 0) return null;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto space-y-3 p-1 scrollbar-thin">
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';

        return (
          <div
            key={idx}
            className={`flex items-start space-x-2 max-w-[85%] ${
              isUser ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold ${
                isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {isUser ? <User className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                isUser
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-2xs font-medium'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-2xs'
              }`}
            >
              {msg.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;

