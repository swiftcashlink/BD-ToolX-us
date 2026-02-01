import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import ContentQueue from './pages/ContentQueue';
import Affiliates from './pages/Affiliates';
import Proxies from './pages/Proxies';
import Settings from './pages/Settings';
import AITools from './pages/AITools';
import BioLinkPage from './pages/BioLinkPage';
import LinkShortener from './pages/LinkShortener';
import Analytics from './pages/Analytics';
import Marketplace from './pages/Marketplace';
import MediaLibrary from './pages/MediaLibrary';
import IncomingWebhookNotification from './components/IncomingWebhookNotification';
import { Bell, Search, Terminal } from 'lucide-react';
import { getGravatarUrl } from './utils/gravatar';
import { initWebhookService, getWebhookService } from './services/webhookService';
import { autoDistributor } from './auto-distributor';

const Layout: React.FC<{ children: React.ReactNode, notifications: any[], setNotifications: any }> = ({ children, notifications, setNotifications }) => {
  const adminEmail = "bdtoolxmedia@gmail.com";
  const avatarUrl = getGravatarUrl(adminEmail, 100);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  return (
    <div className="flex min-h-screen selection:bg-indigo-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-24 bg-white/90 border-b border-slate-100 flex items-center justify-between px-12 sticky top-0 z-50 backdrop-blur-xl">
          <div className="flex items-center gap-8 flex-1">
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                placeholder="Query neural network clusters..." 
                className="w-full pl-14 pr-8 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner uppercase tracking-widest"
              />
            </div>
          </div>
          <div className="flex items-center gap-10">
            <div className="relative">
              <button 
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                className={`relative p-4 rounded-2xl transition-all group ${showNotifPanel ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
              >
                <Bell size={24} className="group-hover:rotate-12 transition-transform" />
                {notifications.length > 0 && (
                  <span className="absolute top-3.5 right-3.5 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full shadow-lg"></span>
                )}
              </button>
              
              {showNotifPanel && (
                <div className="absolute top-full right-0 mt-6 w-[450px] bg-white rounded-[3rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[100]">
                  <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Terminal size={20} className="text-indigo-400" />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em]">Neural Signal Log</h3>
                    </div>
                    <button onClick={() => setNotifications([])} className="text-[10px] font-black text-slate-400 hover:text-white uppercase transition-colors tracking-widest">Wipe Data</button>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-4 space-y-4 bg-slate-50/50">
                    {notifications.length === 0 ? (
                      <div className="p-16 text-center opacity-10 space-y-4">
                        <Bell size={64} className="mx-auto" />
                        <p className="text-xs font-black uppercase tracking-[0.4em]">Silence in the Terminal</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <IncomingWebhookNotification 
                          key={n.id} 
                          notification={n} 
                          onDismiss={() => setNotifications((prev: any[]) => prev.filter(item => item.id !== n.id))} 
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-12 w-px bg-slate-100"></div>
            <div className="flex items-center gap-5 pl-2 pr-6 py-2">
              <div className="relative group">
                <img src={avatarUrl} alt="Admin" className="w-12 h-12 rounded-[1.2rem] object-cover border-2 border-white shadow-2xl transition-transform group-hover:scale-105" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tighter">Production Admin</p>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Neural Tier Access</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 p-12 lg:p-16 overflow-y-auto bg-slate-50/30 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('bdtoolx_settings');
    let config: any = {};
    
    if (saved) {
      try {
        config = JSON.parse(saved);
      } catch(e) { config = {}; }
    }

    // ✅ GLOBAL FALLBACK TO THE USER'S SPECIFIC WEBHOOK
    const finalWebhookUrl = config.makeWebhookUrl || 'https://hook.eu1.make.com/au25ztp8yvw93mg6cex7nive32z2hwmi';

    const service = initWebhookService({
      makeWebhookUrl: finalWebhookUrl,
      webhookSecret: config.webhookSecret || 'neural-secret-2.9',
      autoSendEvents: true,
      eventsToSend: ['link_created', 'content_posted', 'task_completed', 'payout_received', 'account_created']
    });

    service.on('incoming_webhook', async (data) => {
      const newNotif = {
        id: Date.now(),
        title: 'Neural Matrix Sync',
        message: data.message || `Remote node trigger: ${data.command || 'Cluster Task'}`,
        timestamp: new Date().toISOString(),
        type: 'remote_task',
        data: data
      };
      setNotifications(prev => [newNotif, ...prev]);

      if (data.command === 'create_shortlink') {
        const result = await autoDistributor.generateShortUrl({ setup: 'BD ToolX', platform: 'Instagram' } as any, data.url);
        service.sendToMake('task_completed', { command: 'create_shortlink', status: 'success', original: data.url, shortened: result });
      }
    });

  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/links/:username" element={<BioLinkPage />} />
        <Route path="/" element={<Layout notifications={notifications} setNotifications={setNotifications}><Dashboard /></Layout>} />
        <Route path="/accounts" element={<Layout notifications={notifications} setNotifications={setNotifications}><Accounts /></Layout>} />
        <Route path="/content" element={<Layout notifications={notifications} setNotifications={setNotifications}><ContentQueue /></Layout>} />
        <Route path="/affiliates" element={<Layout notifications={notifications} setNotifications={setNotifications}><Affiliates /></Layout>} />
        <Route path="/proxies" element={<Layout notifications={notifications} setNotifications={setNotifications}><Proxies /></Layout>} />
        <Route path="/settings" element={<Layout notifications={notifications} setNotifications={setNotifications}><Settings /></Layout>} />
        <Route path="/aistudio" element={<Layout notifications={notifications} setNotifications={setNotifications}><AITools /></Layout>} />
        <Route path="/shortener" element={<Layout notifications={notifications} setNotifications={setNotifications}><LinkShortener /></Layout>} />
        <Route path="/analytics" element={<Layout notifications={notifications} setNotifications={setNotifications}><Analytics /></Layout>} />
        <Route path="/marketplace" element={<Layout notifications={notifications} setNotifications={setNotifications}><Marketplace /></Layout>} />
        <Route path="/media" element={<Layout notifications={notifications} setNotifications={setNotifications}><MediaLibrary /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;