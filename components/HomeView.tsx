
import React, { useState, useEffect } from 'react';
import { FormTemplate } from '../types';

interface HomeViewProps {
  templates: FormTemplate[];
  onSelect: (template: FormTemplate) => void;
  onDelete: (id: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ templates, onSelect, onDelete }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('inspection')) return 'fa-clipboard-check text-emerald-500';
    if (t.includes('briefing')) return 'fa-users-viewfinder text-blue-500';
    if (t.includes('incident')) return 'fa-triangle-exclamation text-orange-600';
    if (t.includes('punish')) return 'fa-gavel text-red-600';
    return 'fa-file-shield text-slate-500';
  };

  return (
    <div className="space-y-4">
      {deferredPrompt && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl mb-6 border border-slate-700 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900">
              <i className="fas fa-download"></i>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Install HSE App</p>
              <p className="text-[10px] text-slate-400">Gunakan sebagai aplikasi Android</p>
            </div>
          </div>
          <button 
            onClick={handleInstallClick}
            className="bg-white text-slate-900 px-4 py-2 rounded-lg text-[10px] font-black uppercase"
          >
            Install
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">HSE Templates</h2>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
          {templates.length} Forms
        </span>
      </div>

      <div className="grid gap-3">
        {templates.map(template => (
          <div 
            key={template.id} 
            className="group relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-all hover:border-slate-900"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <i className={`fas ${getIcon(template.title)}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 leading-tight truncate pr-4">{template.title}</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(template.id); }}
                    className="text-slate-200 hover:text-red-500 transition-colors"
                  >
                    <i className="fas fa-trash-can text-sm"></i>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">{template.description}</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {template.fields.length} Inputs
              </span>
              <button 
                onClick={() => onSelect(template)}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
              >
                Buat Laporan <i className="fas fa-arrow-right text-[10px]"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-20">
          <i className="fas fa-folder-open text-4xl text-slate-100 mb-4"></i>
          <p className="text-slate-400 text-sm font-medium">Belum ada form. Gunakan AI untuk buat baru!</p>
        </div>
      )}
    </div>
  );
};

export default HomeView;
