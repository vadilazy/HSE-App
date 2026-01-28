
import React, { useState, useEffect } from 'react';
import { FormTemplate, FormSubmission, FieldType } from './types';

// --- Views ---
import HomeView from './components/HomeView';
import FormFillView from './components/FormFillView';
import SubmissionsView from './components/SubmissionsView';
import AIBuilderView from './components/AIBuilderView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'ai' | 'history'>('home');
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [isFilling, setIsFilling] = useState(false);

  useEffect(() => {
    const savedTemplates = localStorage.getItem('templates');
    const savedSubmissions = localStorage.getItem('submissions');
    
    if (savedTemplates && JSON.parse(savedTemplates).length > 0) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      const initialTemplates: FormTemplate[] = [
        {
          id: 'tpl-inspection',
          title: 'Inspection Form',
          description: 'Laporan inspeksi rutin area kerja dan temuan K3.',
          createdAt: Date.now(),
          fields: [
            { id: 'i1', label: 'Tanggal Inspeksi', type: FieldType.DATE, required: true },
            { id: 'i2', label: 'Nama Inspektor', type: FieldType.TEXT, required: true },
            { id: 'i3', label: 'Lokasi / Area', type: FieldType.TEXT, required: true },
            { id: 'i4', label: 'Jenis Temuan', type: FieldType.SELECT, required: true, options: ['Unsafe Act', 'Unsafe Condition'] },
            { id: 'i5', label: 'Keterangan', type: FieldType.TEXTAREA, required: true },
            { id: 'i6', label: 'Follow-up Action', type: FieldType.TEXTAREA, required: true },
            { id: 'i7', label: 'Status', type: FieldType.SELECT, required: true, options: ['Open', 'Close'] },
            { id: 'i8', label: 'Photo Upload', type: FieldType.FILE, required: false }
          ]
        },
        {
          id: 'tpl-briefing',
          title: 'Safety Briefing Log',
          description: 'Catatan pelaksanaan briefing keselamatan harian atau mingguan.',
          createdAt: Date.now() - 1000,
          fields: [
            { id: 'b1', label: 'Tanggal', type: FieldType.DATE, required: true },
            { id: 'b2', label: 'Nama Pembicara', type: FieldType.TEXT, required: true },
            { id: 'b3', label: 'Lokasi / Area', type: FieldType.TEXT, required: true },
            { id: 'b4', label: 'Topik Briefing', type: FieldType.TEXT, required: true },
            { id: 'b5', label: 'Keterangan', type: FieldType.TEXTAREA, required: false },
            { id: 'b6', label: 'Photo Upload', type: FieldType.FILE, required: false }
          ]
        },
        {
          id: 'tpl-incident',
          title: 'Incident Report',
          description: 'Laporan detail kejadian kecelakaan kerja atau nyaris celaka (near miss).',
          createdAt: Date.now() - 2000,
          fields: [
            { id: 'r1', label: 'Tanggal Kejadian', type: FieldType.DATE, required: true },
            { id: 'r2', label: 'Waktu Kejadian', type: FieldType.TEXT, required: true, placeholder: 'HH:mm' },
            { id: 'r3', label: 'Lokasi Kejadian', type: FieldType.TEXT, required: true },
            { id: 'r4', label: 'Nama Pelapor', type: FieldType.TEXT, required: true },
            { id: 'r5', label: 'Nama Pekerja Terlibat', type: FieldType.TEXT, required: true },
            { id: 'r6', label: 'Jenis Kejadian', type: FieldType.SELECT, required: true, options: ['Near Miss', 'Fire Case', 'Property Damage', 'First Aid', 'Medical Treatment', 'Restricted Work Case', 'Lost Time Injury', 'Fatality'] },
            { id: 'r7', label: 'Kronologi Kejadian', type: FieldType.TEXTAREA, required: true },
            { id: 'r8', label: 'Faktor Penyebab', type: FieldType.MULTI_CHECKBOX, required: true, options: ['Faktor Personil', 'Faktor Alat', 'Faktor Metode/Prosedur', 'Faktor Lingkungan'] },
            { id: 'r9', label: 'Keterangan', type: FieldType.TEXTAREA, required: false },
            { id: 'r10', label: 'Tindakan Perbaikan', type: FieldType.TEXTAREA, required: true },
            { id: 'r11', label: 'Tindakan Pencegahan', type: FieldType.TEXTAREA, required: true },
            { id: 'r12', label: 'Photo Upload', type: FieldType.FILE, required: false }
          ]
        },
        {
          id: 'tpl-punishment',
          title: 'Safety Punishment',
          description: 'Catatan pelanggaran aturan K3 dan pemberian poin sanksi.',
          createdAt: Date.now() - 3000,
          fields: [
            { id: 'p7', label: 'Tanggal Pelaporan', type: FieldType.DATE, required: true },
            { id: 'p1', label: 'Nama Pelapor', type: FieldType.TEXT, required: true },
            { id: 'p2', label: 'Nama Pelanggar', type: FieldType.TEXT, required: true },
            { id: 'p3', label: 'Jabatan Pelanggar', type: FieldType.TEXT, required: true },
            { id: 'p4', label: 'Jenis Pelanggaran', type: FieldType.TEXT, required: true },
            { id: 'p5', label: 'Keterangan', type: FieldType.TEXTAREA, required: true },
            { id: 'p6', label: 'Poin Pelanggaran', type: FieldType.NUMBER, required: true }
          ]
        }
      ];
      setTemplates(initialTemplates);
    }
    
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
  }, []);

  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem('templates', JSON.stringify(templates));
    }
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('submissions', JSON.stringify(submissions));
  }, [submissions]);

  const addTemplate = (template: FormTemplate) => {
    setTemplates(prev => [template, ...prev]);
    setActiveTab('home');
  };

  const addSubmission = (submission: FormSubmission) => {
    setSubmissions(prev => [submission, ...prev]);
    setIsFilling(false);
    setSelectedTemplate(null);
    setActiveTab('history');
  };

  const deleteTemplate = (id: string) => {
    if (confirm("Hapus form ini dan semua isinya?")) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      setSubmissions(prev => prev.filter(s => s.formId !== id));
    }
  };

  const handleStartFill = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setIsFilling(true);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      <header className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-10">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <i className="fas fa-hard-hat text-yellow-400"></i>
          HSE Mobile
        </h1>
        {isFilling && (
          <button onClick={() => setIsFilling(false)} className="p-2 bg-white/10 rounded-full">
            <i className="fas fa-times"></i>
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {isFilling && selectedTemplate ? (
          <FormFillView 
            template={selectedTemplate} 
            onCancel={() => setIsFilling(false)} 
            onSubmit={addSubmission}
          />
        ) : (
          <>
            {activeTab === 'home' && <HomeView templates={templates} onSelect={handleStartFill} onDelete={deleteTemplate} />}
            {activeTab === 'ai' && <AIBuilderView onAdd={addTemplate} />}
            {activeTab === 'history' && <SubmissionsView submissions={submissions} templates={templates} onDelete={(id) => setSubmissions(prev => prev.filter(s => s.id !== id))} />}
          </>
        )}
      </main>

      {!isFilling && (
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 safe-bottom z-10 shadow-lg">
          <NavButton active={activeTab === 'home'} icon="fa-clipboard-check" label="Forms" onClick={() => setActiveTab('home')} />
          <NavButton active={activeTab === 'ai'} icon="fa-wand-magic-sparkles" label="AI" onClick={() => setActiveTab('ai')} />
          <NavButton active={activeTab === 'history'} icon="fa-list-ul" label="History" onClick={() => setActiveTab('history')} />
        </nav>
      )}
    </div>
  );
};

const NavButton: React.FC<{active: boolean, icon: string, label: string, onClick: () => void}> = ({active, icon, label, onClick}) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 transition-colors ${active ? 'text-slate-900' : 'text-slate-400'}`}>
    <i className={`fas ${icon} text-lg`}></i>
    <span className="text-[10px] font-bold uppercase">{label}</span>
  </button>
);

export default App;
