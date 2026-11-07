export interface ExtractedData {
  full_name?: string;
  certificate_number?: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  annual_income?: number;
  applicant_category?: string;
  document_type?: string;
  raw_text?: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  document_type: string;
  extracted_data: ExtractedData;
  ocr_confidence: Record<string, number>;
  manual_overrides: Record<string, any>;
  file_path?: string;
  is_synthetic?: boolean;
}

export interface ValidationItem {
  rule_id: string;
  document_id: string;
  status: 'VERIFIED' | 'ATTENTION_REQUIRED' | 'UNABLE_TO_VERIFY';
  category: string;
  reason: string;
  kannada_reason?: string;
  extracted_value?: string;
  expected_value?: string;
  rule_provenance?: {
    rule_id: string;
    government_order_or_notification: string;
    relevant_clause: string;
    verification_status: string;
    source_url?: string;
  };
}

export interface ReadinessScoreBreakdown {
  document_coverage: { score: number; max: number; detail: string };
  certificate_validity: { score: number; max: number; detail: string };
  name_consistency: { score: number; max: number; detail: string };
  format_and_integrity: { score: number; max: number; detail: string };
}

export interface ValidationResponse {
  overall_status: 'VERIFIED' | 'ATTENTION_REQUIRED' | 'UNABLE_TO_VERIFY';
  total_checks: number;
  passed_checks: number;
  warning_checks: number;
  failed_checks: number;
  results: ValidationItem[];
  name_similarity_analysis?: {
    status: string;
    comparisons: Array<{
      name1: string;
      name2: string;
      score: number;
      doc1_type?: string;
      doc2_type?: string;
      explanation: string;
      status: string;
    }>;
    message: string;
  };
  readiness_score: number;
  score_breakdown: ReadinessScoreBreakdown;
  disclaimer: string;
}

export interface SchemeItem {
  id: string;
  name: string;
  kannada_name?: string;
  department: string;
  category: string;
  target_audience?: string;
  description: string;
  kannada_description?: string;
  income_limit: number;
  income_limit_display?: string;
  required_documents: string[];
  application_deadline?: string;
  deadline_verified: boolean;
  official_portal_url: string;
  source_of_information: string;
  verification_status: string;
  type: 'student' | 'welfare';
  tags: string[];
  rules?: any[];
}

export interface SakalaServiceItem {
  service_id: string;
  service_name: string;
  kannada_name?: string;
  department: string;
  stipulated_timeline_days: number;
  timeline_unit: string;
  designated_officer: string;
  first_appellate_authority: string;
  second_appellate_authority: string;
  source_reference: string;
  last_verified_date: string;
  verification_status: string;
}

export interface ApplicationItem {
  id: number;
  gsc_number: string;
  service_id: string;
  service_name: string;
  applicant_name: string;
  submission_date: string;
  stipulated_days: number;
  expected_deadline: string;
  is_overdue: boolean;
  days_remaining_or_overdue: number;
  status: string;
  status_source: string;
  office_name?: string;
  designated_officer?: string;
  first_appellate_authority?: string;
}

export interface LegalProvisionItem {
  provision_key: string;
  provision_number: string;
  act_name: string;
  title: string;
  exact_verified_text: string;
  source_document: string;
  amendment_reference: string;
  verification_date: string;
  verification_status: 'VERIFIED' | 'UNVERIFIED';
  applies_to: string[];
}
