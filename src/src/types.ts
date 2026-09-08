export type UserRole = 'admin' | 'builder' | 'buyer' | 'field_engineer' | 'technical_auditor';

export interface User {
  id: string;
  username: string;
  name: string | null;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export type EnquiryStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'field_engineer_assigned' 
  | 'inspection_scheduled'
  | 'inspection_in_progress'
  | 'inspection_completed' 
  | 'under_review' 
  | 'review_completed'
  | 'certificate_issued';

export interface RecentEnquiry {
    enquiry_id: string;
    propertyAddress: string;
    city: string;
    propertyType: string;
    created_at: string;
    created_by_name: string;
    status: EnquiryStatus;
}
export interface Enquiry {
  id: string;
  clientId: string;
  clientName: string;
  clientRole: 'builder' | 'buyer';
  propertyType: string;
  propertyAddress: string;
  city: string;
  pincode: string;
  constructionStage: string;
  description: string;
  status: EnquiryStatus;
  agentId?: string;
  agentName?: string;
  engineerId?: string;
  engineerName?: string;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  certificateId?: string;
}

export interface QuestionnaireQuestion {
  id: string;
  category: string;
  question: string;
  type: 'text' | 'rating' | 'yes_no' | 'dropdown' |'multiple_choice' | 'photo' | 'video' | 'textarea';
  options?: string[];
  required: boolean;
  order: number;
}

export interface QuestionnaireResponse {
    questionId: string;
    templateId: string;
    templateQuestionId: string;
    questionText: string;
    questionType: string;
    categoryId: string;
    categoryName: string;
    required: boolean;
    hasScoring: boolean;
    maxScore?: number;
    answer: any;
    answerText?: string | null;
    answerBoolean?: boolean | null;
    answerNumber?: number | null;
    answerArray?: string[];
    score?: number;
    remarks?: string;
    isNA?: boolean;
    mediaUrls?: File[];
}

export interface InspectionSubmission {
  id: string;
  enquiryId: string;
  agentId: string;
  agentName: string;
  responses: QuestionnaireResponse[];
  overallNotes: string;
  photos: string[];
  submittedAt: string;
  status: 'submitted' | 'under_review' | 'reviewed';
}

export interface Certificate {
  id: string;
  enquiryId: string;
  propertyAddress: string;
  clientName: string;
  rating: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  issuedBy: string;
  issuedAt: string;
  validUntil: string;
  findings: string;
  recommendations: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'info' | 'success' | 'warning';
}
