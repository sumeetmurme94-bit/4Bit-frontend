import { GrievanceStatus } from './status';

/**
 * ============================================================================
 * CRUCIAL PRIVACY GUARDRAILS: PUBLIC TRANSPARENCY DATA MODEL
 * ============================================================================
 * Under the Hospital Citizen Privacy & Transparency Charter:
 * - NO patient names, phone numbers, or government IDs are ever stored or exposed.
 * - NO raw audio recordings or voice biometric data are made publicly accessible.
 * - NO personal medical diagnoses, prescriptions, or bed assignments are exposed.
 * - All complaints are tracked strictly by cryptographic, non-identifying tokens
 *   (e.g., #VOC-8291).
 * ============================================================================
 */

export interface PublicComplaintRecord {
  /** Publicly trackable complaint ID (e.g., #VOC-8291) */
  id: string;
  /** High-level operational service category */
  category: string;
  /** Responsible hospital department */
  department: string;
  /** High-level campus zone (non-identifying) */
  zone: string;
  /** Current verified grievance lifecycle status */
  status: GrievanceStatus;
  /** Public timestamp when the grievance token was registered */
  loggedDate: string;
  /** Timestamp of the most recent operational update */
  lastUpdated: string;
  /** Target SLA duration in hours */
  slaTargetHours: number;
  /** Time taken to resolve or elapsed time so far in hours */
  elapsedHours: number;
  /** Whether the complaint has reached full verified resolution */
  isResolved: boolean;
  /** Non-sensitive operational resolution summary */
  publicResolutionSummary: string;
  /** Non-identifying operational audit milestone */
  operationalMilestone: string;
}

export interface DepartmentMetric {
  id: string;
  departmentName: string;
  category: string;
  resolutionRate: number; // e.g. 98.2%
  slaTargetRate: number; // e.g. 95%
  totalComplaints: number;
  resolvedComplaints: number;
  avgTurnaroundHours: number;
  iconName: 'sparkles' | 'wrench' | 'pill' | 'activity' | 'file-text' | 'utensils';
}

export interface HospitalKpiSummary {
  slaResolutionRate: number; // e.g. 96.4
  avgTurnaroundHours: number; // e.g. 2.8
  totalGrievancesAddressed: number; // e.g. 1428
  activeGrievances: number; // e.g. 52
  privacyComplianceScore: number; // e.g. 100.0
}
