
import React, { useState } from 'react';
import { FormTemplate, FormSubmission, FieldType } from '../types';

interface FormFillViewProps {
  template: FormTemplate;
  onCancel: () => void;
  onSubmit: (submission: FormSubmission) => void;
}

const FormFillView: React.FC<FormFillViewProps> = ({ template, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  const handleChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const handleMultiCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues: string[] = formData[fieldId] || [];
    let nextValues: string[];
    if (checked) {
      nextValues = [...currentValues, option];
    } else {
      nextValues = currentValues.filter(v => v !== option);
    }
    handleChange(fieldId, nextValues);
  };

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleChange(id, base64String);
        setFilePreviews(prev => ({ ...prev, [id]: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    template.fields.forEach(field => {
      if (field.required && (!formData[field.id] || (Array.isArray(formData[field.id]) && formData[field.id].length === 0))) {
        newErrors[field.id] = 'Wajib diisi';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorId = Object.keys(newErrors)[0];
      const element = document.getElementById(`field-container-${firstErrorId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const submission: FormSubmission = {
      id: Date.now().toString(),
      formId: template.id,
      data: formData,
      timestamp: Date.now()
    };
    
    onSubmit(submission);
  };

  return (
    <div className="bg-white rounded-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">{template.title}</h2>
        <p className="text-sm text-slate-500">{template.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {template.fields.map(field => (
          <div key={field.id} id={`field-container-${field.id}`} className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === FieldType.SELECT ? (
              <select
                className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all ${errors[field.id] ? 'border-red-500' : 'border-slate-200'}`}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              >
                <option value="">Pilih opsi...</option>
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : field.type === FieldType.MULTI_CHECKBOX ? (
              <div className={`grid grid-cols-1 gap-2 p-1 ${errors[field.id] ? 'border border-red-200 rounded-xl bg-red-50/30' : ''}`}>
                {field.options?.map(opt => (
                  <label key={opt} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer active:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      checked={(formData[field.id] || []).includes(opt)}
                      onChange={(e) => handleMultiCheckboxChange(field.id, opt, e.target.checked)}
                    />
                    <span className="text-sm text-slate-700 font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            ) : field.type === FieldType.TEXTAREA ? (
              <textarea
                className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all min-h-[100px] ${errors[field.id] ? 'border-red-500' : 'border-slate-200'}`}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            ) : field.type === FieldType.DATE ? (
              <div className="relative">
                <input
                  type="date"
                  className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all text-slate-700 appearance-none ${errors[field.id] ? 'border-red-500' : 'border-slate-200'}`}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <i className="fas fa-calendar-alt"></i>
                </div>
              </div>
            ) : field.type === FieldType.FILE ? (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id={`file-${field.id}`}
                  onChange={(e) => handleFileChange(field.id, e)}
                />
                <label 
                  htmlFor={`file-${field.id}`}
                  className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors ${errors[field.id] ? 'border-red-500' : 'border-slate-200'}`}
                >
                  {filePreviews[field.id] ? (
                    <img src={filePreviews[field.id]} alt="Preview" className="h-40 w-full object-contain rounded-lg" />
                  ) : (
                    <>
                      <i className="fas fa-camera text-3xl text-slate-300 mb-2"></i>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Klik untuk Ambil Foto</span>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <input
                type={field.type}
                className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all ${errors[field.id] ? 'border-red-500' : 'border-slate-200'}`}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}
            {errors[field.id] && <p className="text-xs text-red-500 font-bold">{errors[field.id]}</p>}
          </div>
        ))}

        <div className="pt-6 space-y-3">
          <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
            Simpan Laporan
          </button>
          <button type="button" onClick={onCancel} className="w-full text-slate-400 p-3 font-bold text-sm uppercase tracking-widest">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormFillView;
