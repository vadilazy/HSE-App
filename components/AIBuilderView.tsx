
import React, { useState } from 'react';
import { generateFormFromAI } from '../services/geminiService';
import { FormTemplate, FieldType } from '../types';

interface AIBuilderViewProps {
  onAdd: (template: FormTemplate) => void;
}

const AIBuilderView: React.FC<AIBuilderViewProps> = ({ onAdd }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await generateFormFromAI(prompt);
      const newTemplate: FormTemplate = {
        id: Date.now().toString(),
        title: result.title || 'New Form',
        description: result.description || 'AI Generated Form',
        createdAt: Date.now(),
        fields: (result.fields || []).map((f: any, idx: number) => ({
          ...f,
          id: `f-${idx}-${Date.now()}`
        }))
      };
      
      onAdd(newTemplate);
    } catch (err) {
      setError('Could not generate form. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "A fitness workout tracker",
    "Customer feedback for a cafe",
    "Expense report for travel",
    "Daily health check-in"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4 shadow-inner">
          <i className="fas fa-wand-magic-sparkles text-2xl"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800">AI Form Builder</h2>
        <p className="text-sm text-slate-500">Describe what form you need and AI will build the structure for you.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border-2 border-indigo-50 shadow-sm">
        <textarea
          className="w-full p-4 text-slate-700 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] text-sm leading-relaxed"
          placeholder="e.g. A maintenance request form with fields for room number, issue type, priority, and photo description..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        
        {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className={`w-full mt-4 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
            loading || !prompt.trim() 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white shadow-indigo-100 active:scale-95'
          }`}
        >
          {loading ? (
            <><i className="fas fa-circle-notch fa-spin"></i> Generating...</>
          ) : (
            <><i className="fas fa-sparkles"></i> Create Form Structure</>
          )}
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Quick Ideas</h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button 
              key={s}
              onClick={() => setPrompt(s)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIBuilderView;
