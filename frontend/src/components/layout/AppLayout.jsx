import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { checkHealth } from '../../api/pileApi';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendOffline, setBackendOffline] = useState(false);
  const [checking, setChecking] = useState(false);

  const verifyBackendStatus = async () => {
    setChecking(true);
    try {
      await checkHealth();
      setBackendOffline(false);
    } catch (err) {
      console.warn("Backend health check failed:", err);
      setBackendOffline(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    verifyBackendStatus();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 h-full overflow-hidden min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between min-w-0">
          <div className="w-full max-w-7xl mx-auto space-y-6 min-w-0 h-auto">
            {backendOffline && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg shadow-sm flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Backend unavailable.</strong> The engineering services are temporarily unreachable. Please try again later.
                  </span>
                </div>
                <button
                  onClick={verifyBackendStatus}
                  disabled={checking}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                  <span>{checking ? 'Checking...' : 'Retry'}</span>
                </button>
              </div>
            )}
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
