import React, { useState } from 'react';
import { Send, Brain } from 'lucide-react';
import MessageList from './MessageList';
import { analyzeProject } from '../../api/antigravityApi';

const ChatPanel = ({ projectUuid, activePrompt, onClearPrompt }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to Antigravity AI Engineer! Select a project and ask questions about your boreholes, soil layers, or engineering calculations.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // If a prompt chip was clicked from parent
  React.useEffect(() => {
    if (activePrompt) {
      setInput(activePrompt);
      if (onClearPrompt) onClearPrompt();
    }
  }, [activePrompt, onClearPrompt]);

  const sendMessage = async (overrideInput) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await analyzeProject({ projectUuid, prompt: textToSend });
      const aiMsg = { role: 'assistant', content: response.summary || 'Analysis complete based on current project parameters.' };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error processing request. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[420px] bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-3">
      <MessageList messages={messages} />

      <div className="flex items-center space-x-2 pt-2 border-t border-slate-200/80">
        <textarea
          className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl resize-none text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a question about boreholes, soil layers, or calculations..."
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs transition-colors disabled:opacity-40 disabled:hover:bg-blue-600 shrink-0"
          title="Send message"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;

