import {
  DocumentItem, ValidationResponse, SchemeItem, SakalaServiceItem,
  ApplicationItem, LegalProvisionItem
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  // Documents
  getSamples: async () => {
    const res = await fetch(`${BASE_URL}/documents/samples`);
    return res.json();
  },

  listDocuments: async (): Promise<DocumentItem[]> => {
    const res = await fetch(`${BASE_URL}/documents/list`);
    return res.json();
  },

  uploadDocument: async (file: File, documentTypeHint?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (documentTypeHint) {
      formData.append('document_type_hint', documentTypeHint);
    }
    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to upload document');
    }
    return res.json();
  },

  manualCorrectField: async (documentId: string, fieldName: string, correctedValue: any) => {
    const res = await fetch(`${BASE_URL}/documents/manual-correct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: documentId,
        field_name: fieldName,
        corrected_value: correctedValue,
      }),
    });
    return res.json();
  },

  validateDocuments: async (documentIds?: string[]): Promise<ValidationResponse> => {
    const res = await fetch(`${BASE_URL}/documents/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(documentIds || null),
    });
    return res.json();
  },

  purgeDocuments: async () => {
    const res = await fetch(`${BASE_URL}/documents/purge`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Schemes
  getSchemes: async (params?: { scheme_type?: string; category?: string; max_income?: number; search?: string }): Promise<SchemeItem[]> => {
    const query = new URLSearchParams();
    if (params?.scheme_type) query.append('scheme_type', params.scheme_type);
    if (params?.category) query.append('category', params.category);
    if (params?.max_income) query.append('max_income', params.max_income.toString());
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${BASE_URL}/schemes?${query.toString()}`);
    return res.json();
  },

  getSchemeDetail: async (schemeId: string): Promise<SchemeItem> => {
    const res = await fetch(`${BASE_URL}/schemes/${schemeId}`);
    return res.json();
  },

  checkSchemeReadiness: async (schemeId: string, payload: { uploaded_document_ids: string[]; annual_income?: number }) => {
    const res = await fetch(`${BASE_URL}/schemes/${schemeId}/check-readiness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Sakala
  getSakalaServices: async (): Promise<SakalaServiceItem[]> => {
    const res = await fetch(`${BASE_URL}/sakala/services`);
    return res.json();
  },

  calculateDeadline: async (payload: { service_id: string; submission_date: string; manual_timeline_days?: number }) => {
    const res = await fetch(`${BASE_URL}/sakala/calculate-deadline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  getApplications: async (): Promise<ApplicationItem[]> => {
    const res = await fetch(`${BASE_URL}/sakala/applications`);
    return res.json();
  },

  addApplication: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/sakala/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Appeals
  generateAppeal: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/appeals/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Legal
  getLegalProvisions: async (): Promise<LegalProvisionItem[]> => {
    const res = await fetch(`${BASE_URL}/legal-provisions`);
    return res.json();
  },

  // Voice
  getVoiceStatus: async () => {
    const res = await fetch(`${BASE_URL}/voice/status`);
    return res.json();
  },

  getKannadaPhrases: async () => {
    const res = await fetch(`${BASE_URL}/voice/phrases`);
    return res.json();
  },
};
