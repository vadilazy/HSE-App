
import React, { useState } from 'react';
import { FormSubmission, FormTemplate } from '../types';

interface SubmissionsViewProps {
  submissions: FormSubmission[];
  templates: FormTemplate[];
  onDelete: (id: string) => void;
}

const SubmissionsView: React.FC<SubmissionsViewProps> = ({ submissions, templates, onDelete }) => {
  const [filterFormId, setFilterFormId] = useState<string>('all');
  
  const getTemplateTitle = (id: string) => templates.find(t => t.id === id)?.title || 'Unknown Form';

  const formatValue = (val: any) => {
    if (Array.isArray(val)) return val.join("; ");
    if (typeof val === 'boolean') return val ? 'Ya' : 'Tidak';
    if (val && val.toString().startsWith('data:image')) return '[Photo Attached]';
    return String(val || '');
  };

  const exportToCSV = () => {
    const targetSubmissions = filterFormId === 'all' 
      ? submissions 
      : submissions.filter(s => s.formId === filterFormId);

    if (targetSubmissions.length === 0) return;

    let csvContent = "";

    if (filterFormId !== 'all') {
      const template = templates.find(t => t.id === filterFormId);
      if (!template) return;

      const headers = ["Timestamp", ...template.fields.map(f => f.label)];
      const rows = targetSubmissions.map(sub => {
        const timestamp = new Date(sub.timestamp).toLocaleString();
        return [
          `"${timestamp}"`,
          ...template.fields.map(field => `"${formatValue(sub.data[field.id])}"`)
        ];
      });
      csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    } else {
      const headers = ["Timestamp", "Form Title", "Field Name", "Value"];
      const rows = targetSubmissions.flatMap(sub => {
        const template = templates.find(t => t.id === sub.formId);
        const timestamp = new Date(sub.timestamp).toLocaleString();
        return template ? template.fields.map(field => [
          `"${timestamp}"`,
          `"${template.title}"`,
          `"${field.label}"`,
          `"${formatValue(sub.data[field.id])}"`
        ]) : [];
      });
      csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hse_export_${filterFormId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubmissions = filterFormId === 'all' 
    ? submissions 
    : submissions.filter(s => s.formId === filterFormId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 mb-4">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Riwayat Laporan</h2>
        
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
          <FilterTab 
            label="Semua" 
            active={filterFormId === 'all'} 
            onClick={() => setFilterFormId('all')} 
          />
          {templates.map(t => (
            <FilterTab 
              key={t.id} 
              label={t.title} 
              active={filterFormId === t.id} 
              onClick={() => setFilterFormId(t.id)} 
            />
          ))}
        </div>

        {filteredSubmissions.length > 0 && (
          <button 
            onClick={exportToCSV}
            className="w-full bg-emerald-600 text-white p-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:bg-emerald-700 transition-colors shadow-lg shadow-emerald-50"
          >
            <i className="fas fa-file-excel"></i> Export ke Excel
          </button>
        )}
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <i className="fas fa-clipboard-list text-3xl text-slate-200 mb-2"></i>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Belum ada data</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map(sub => {
            const template = templates.find(t => t.id === sub.formId);
            return (
              <div key={sub.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-400 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">{getTemplateTitle(sub.formId)}</h3>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(sub.timestamp).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => onDelete(sub.id)}
                    className="text-slate-200 hover:text-red-500 p-1 transition-colors"
                  >
                    <i className="fas fa-trash-can text-sm"></i>
                  </button>
                </div>
                
                <div className="mt-3 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {template?.fields.slice(0, 4).map(field => (
                    <div key={field.id} className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-slate-500 font-bold uppercase text-[9px] truncate">{field.label}</span>
                      <span className="text-slate-900 font-bold truncate text-right">
                        {formatValue(sub.data[field.id])}
                      </span>
                    </div>
                  ))}
                  {(template?.fields.length ?? 0) > 4 && (
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-1 text-center border-t border-slate-200 mt-1">
                      + {(template?.fields.length ?? 0) - 4} data lainnya
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FilterTab: React.FC<{label: string, active: boolean, onClick: () => void}> = ({label, active, onClick}) => (
  <button 
    onClick={onClick}
    className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
      active ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
    }`}
  >
    {label}
  </button>
);

export default SubmissionsView;
