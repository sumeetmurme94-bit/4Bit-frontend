import { GrievanceStatus } from './status';

export type StaffRole = 'Ward Staff' | 'Department Head' | 'Hospital Administrator';

export interface AuthUser {
  name: string;
  email: string;
  role: StaffRole;
  department: string;
  staffId: string;
  shift?: string;
  avatar?: string;
  loggedInAt: string;
}

export interface AiAssessmentData {
  verdict: 'Appears Relevant' | 'Partially Relevant' | 'Inconclusive' | 'Highly Relevant';
  confidence: number;
  matchHeadline: string; // e.g. "AI Match: 94% Relevant - Fixed water leak detected"
  details: string;
  detectedObjects?: string[];
  tamperCheck?: string;
  geofenceStatus?: string;
}

export interface EvidenceData {
  imageUrl: string;
  imageCaption: string;
  resolutionNote: string;
  staffName: string;
  staffRole: string;
  submittedAt: string;
  isoTimestamp: string; // strict ISO 8601 timestamp locked at submission
  gpsCoordinates: string; // e.g. "12.9716° N, 77.5946° E"
  gpsLocationName: string;
  gpsAccuracyMeters?: number;
  aiAssessment: AiAssessmentData;
}

export interface Complaint {
  id: string; // e.g. "#VOC-8291"
  timestamp: string;
  language: 'Kannada' | 'English';
  transcript: string;
  summary: string;
  category: string;
  ward: string; // ward name / location
  wardArea?: string; // backwards compatibility alias
  priority: 'Standard' | 'High';
  assignedDepartment: string;
  assignedStaff?: string;
  deadline: string;
  isOverdue: boolean;
  overdueDuration?: string;
  status: GrievanceStatus;
  evidence?: EvidenceData;
  reworkReason?: string; // Reason provided when an authority requests rework
}
