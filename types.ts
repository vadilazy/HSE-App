
export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  FILE = 'file',
  MULTI_CHECKBOX = 'multi_checkbox'
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For select and multi_checkbox types
  placeholder?: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: number;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  timestamp: number;
}
