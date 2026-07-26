import React from 'react';

const prompts = [
  'Explain this borehole.',
  'Recommend a foundation type.',
  'Summarize soil investigation.',
  'Identify missing investigation data.',
  'Compare BH-1 and BH-2.',
  'Explain SBC results.',
  'Explain pile capacity.',
  'Generate project summary.',
];

const PromptSuggestions = ({ onSelect }) => {
  return (
    <div className="flex flex-col space-y-2 mt-4 pt-3 border-t border-slate-100">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Suggested Prompts
      </span>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(p)}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-full text-xs font-medium cursor-pointer transition-colors shadow-2xs"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;

