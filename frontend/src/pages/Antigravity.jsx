import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Brain } from 'lucide-react';
import ProjectContextCard from '../components/antigravity/ProjectContextCard';
import SuggestedActions from '../components/antigravity/SuggestedActions';
import EngineeringInsights from '../components/antigravity/EngineeringInsights';
import ChatPanel from '../components/antigravity/ChatPanel';
import PromptSuggestions from '../components/antigravity/PromptSuggestions';
import { getProject } from '../api/projectApi';
import { analyzeProject } from '../api/antigravityApi';
import Card from '../components/common/Card';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'chat', label: 'Chat' },
  { id: 'insights', label: 'Insights' },
  { id: 'actions', label: 'Actions' },
];

const Antigravity = () => {
  const { uuid } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePrompt, setActivePrompt] = useState('');

  useEffect(() => {
    if (!uuid) return;
    const fetchProject = async () => {
      try {
        const data = await getProject(uuid);
        setProject(data);
      } catch (e) {
        console.error('Failed to load project context', e);
      }
    };
    fetchProject();
  }, [uuid]);

  const runAnalysis = async () => {
    if (!project) return;
    setLoading(true);
    try {
      const result = await analyzeProject({ projectUuid: uuid });
      setAnalysis(result);
    } catch (e) {
      console.error('Analysis error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'insights' && !analysis) {
      runAnalysis();
    }
  }, [activeTab, analysis]);

  const handlePromptSelect = (promptText) => {
    setActivePrompt(promptText);
    setActiveTab('chat');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/80 shadow-2xs">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Antigravity AI Engineer</h1>
          <p className="text-xs text-slate-500 font-medium">Automated geotechnical analysis, foundation advice, and decision support</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex space-x-2 border-b border-slate-200/80 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all focus:outline-none ${
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            <Card title="Project Context">
              <ProjectContextCard project={project} />
            </Card>
            <Card title="Suggested Actions">
              <SuggestedActions />
            </Card>
          </>
        )}

        {activeTab === 'chat' && (
          <Card title="AI Assistant Chat">
            <ChatPanel
              projectUuid={uuid}
              activePrompt={activePrompt}
              onClearPrompt={() => setActivePrompt('')}
            />
            <PromptSuggestions onSelect={handlePromptSelect} />
          </Card>
        )}

        {activeTab === 'insights' && (
          <Card title="Engineering Insights">
            <EngineeringInsights analysis={analysis} loading={loading} />
          </Card>
        )}

        {activeTab === 'actions' && (
          <Card title="Suggested Actions">
            <SuggestedActions />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Antigravity;

