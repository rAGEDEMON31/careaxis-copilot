export type UserRole = 'doctor' | 'admin' | 'nurse' | 'receptionist';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  healthId: string;
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  lastVisit?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  symptoms: string;
  notes: string;
  diagnosis: string;
  prescription: string;
  complianceStatus: 'compliant' | 'minor' | 'moderate' | 'severe';
  complianceFeedback?: string;
  doctorJustification?: string;
}

export interface ComplianceStat {
  status: string;
  count: number;
  color: string;
}
