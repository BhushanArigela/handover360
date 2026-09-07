import { User, Enquiry, QuestionnaireQuestion, InspectionSubmission, Certificate, Notification } from './types';

// Default questionnaire
export const defaultQuestions: QuestionnaireQuestion[] = [
  { id: 'q1', category: 'Structural', question: 'Is the foundation work completed as per approved plan?', type: 'yes_no', required: true, order: 1 },
  { id: 'q2', category: 'Structural', question: 'Rate the quality of RCC work (columns, beams, slabs)', type: 'rating', required: true, order: 2 },
  { id: 'q3', category: 'Structural', question: 'Any visible cracks in structural elements?', type: 'yes_no', required: true, order: 3 },
  { id: 'q4', category: 'Structural', question: 'Upload photos of structural elements', type: 'photo', required: true, order: 4 },
  { id: 'q5', category: 'Structural', question: 'Describe the condition of load-bearing walls', type: 'textarea', required: true, order: 5 },
  { id: 'q6', category: 'Plumbing', question: 'Is the plumbing layout as per approved plan?', type: 'yes_no', required: true, order: 6 },
  { id: 'q7', category: 'Plumbing', question: 'Rate the quality of plumbing fixtures', type: 'rating', required: true, order: 7 },
  { id: 'q8', category: 'Plumbing', question: 'Any leakage observed during pressure test?', type: 'yes_no', required: true, order: 8 },
  { id: 'q9', category: 'Plumbing', question: 'Upload photos of plumbing work', type: 'photo', required: false, order: 9 },
  { id: 'q10', category: 'Electrical', question: 'Is the electrical wiring as per IS standards?', type: 'yes_no', required: true, order: 10 },
  { id: 'q11', category: 'Electrical', question: 'Rate the quality of electrical fittings', type: 'rating', required: true, order: 11 },
  { id: 'q12', category: 'Electrical', question: 'Is proper earthing done?', type: 'yes_no', required: true, order: 12 },
  { id: 'q13', category: 'Electrical', question: 'Type of wiring used', type: 'multiple_choice', options: ['Copper', 'Aluminium', 'Mixed', 'Other'], required: true, order: 13 },
  { id: 'q14', category: 'Finishing', question: 'Rate the quality of plastering work', type: 'rating', required: true, order: 14 },
  { id: 'q15', category: 'Finishing', question: 'Rate the quality of flooring work', type: 'rating', required: true, order: 15 },
  { id: 'q16', category: 'Finishing', question: 'Rate the quality of painting work', type: 'rating', required: true, order: 16 },
  { id: 'q17', category: 'Finishing', question: 'Upload photos of finishing work', type: 'photo', required: true, order: 17 },
  { id: 'q18', category: 'Safety', question: 'Are fire safety measures in place?', type: 'yes_no', required: true, order: 18 },
  { id: 'q19', category: 'Safety', question: 'Is proper ventilation provided?', type: 'yes_no', required: true, order: 19 },
  { id: 'q20', category: 'Safety', question: 'Additional observations and notes', type: 'textarea', required: false, order: 20 },
];

// Demo users
export const demoUsers: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@Handover360.com', role: 'admin', phone: '9876543210', createdAt: '2024-01-01', isActive: true },
  { id: 'u2', name: 'Rajesh Kumar', email: 'rajesh@builder.com', role: 'builder', phone: '9876543211', createdAt: '2024-02-15', isActive: true },
  { id: 'u3', name: 'Priya Sharma', email: 'priya@buyer.com', role: 'buyer', phone: '9876543212', createdAt: '2024-03-01', isActive: true },
  { id: 'u4', name: 'Amit Patel', email: 'amit@agent.com', role: 'field_engineer', phone: '9876543213', createdAt: '2024-01-10', isActive: true },
  { id: 'u5', name: 'Suresh Reddy', email: 'suresh@agent.com', role: 'field_engineer', phone: '9876543214', createdAt: '2024-02-01', isActive: true },
  { id: 'u6', name: 'Dr. Meera Iyer', email: 'meera@engineer.com', role: 'technical_auditor', phone: '9876543215', createdAt: '2024-01-05', isActive: true },
  { id: 'u7', name: 'Vikram Singh', email: 'vikram@engineer.com', role: 'technical_auditor', phone: '9876543216', createdAt: '2024-02-20', isActive: true },
];

export const demoEnquiries: Enquiry[] = [
  {
    id: 'e1', clientId: 'u2', clientName: 'Rajesh Kumar', clientRole: 'builder',
    propertyType: 'Residential Apartment', propertyAddress: '123, Green Valley Apartments, Whitefield',
    city: 'Bangalore', pincode: '560066', constructionStage: 'Finishing Stage',
    description: 'Need quality certification for 3BHK apartment in Green Valley project. Construction is 90% complete.',
    status: 'inspection_completed', agentId: 'u4', agentName: 'Amit Patel',
    engineerId: 'u6', engineerName: 'Dr. Meera Iyer',
    scheduledDate: '2024-06-15', createdAt: '2024-06-01', updatedAt: '2024-06-16',
  },
  {
    id: 'e2', clientId: 'u3', clientName: 'Priya Sharma', clientRole: 'buyer',
    propertyType: 'Independent Villa', propertyAddress: '45, Sunrise Layout, Electronic City',
    city: 'Bangalore', pincode: '560100', constructionStage: 'Structural Stage',
    description: 'Want to verify construction quality before final payment to builder.',
    status: 'field_engineer_assigned', agentId: 'u5', agentName: 'Suresh Reddy',
    scheduledDate: '2024-07-01', createdAt: '2024-06-20', updatedAt: '2024-06-22',
  },
  {
    id: 'e3', clientId: 'u2', clientName: 'Rajesh Kumar', clientRole: 'builder',
    propertyType: 'Commercial Building', propertyAddress: '78, Tech Park Road, Marathahalli',
    city: 'Bangalore', pincode: '560037', constructionStage: 'Foundation Stage',
    description: 'Quality check for commercial building foundation work.',
    status: 'pending', createdAt: '2024-06-25', updatedAt: '2024-06-25',
  },
  {
    id: 'e4', clientId: 'u3', clientName: 'Priya Sharma', clientRole: 'buyer',
    propertyType: 'Residential Apartment', propertyAddress: '12, Lake View Towers, Hebbal',
    city: 'Bangalore', pincode: '560024', constructionStage: 'Finishing Stage',
    description: 'Pre-purchase quality inspection for 2BHK flat.',
    status: 'certificate_issued', agentId: 'u4', agentName: 'Amit Patel',
    engineerId: 'u6', engineerName: 'Dr. Meera Iyer',
    scheduledDate: '2024-05-10', createdAt: '2024-05-01', updatedAt: '2024-05-20',
    rating: 4.2, certificateId: 'cert1',
  },
];

export const demoSubmissions: InspectionSubmission[] = [
  {
    id: 's1', enquiryId: 'e1', agentId: 'u4', agentName: 'Amit Patel',
    responses: [
      { questionId: 'q1', answer: 'Yes' },
      { questionId: 'q2', answer: '4' },
      { questionId: 'q3', answer: 'No' },
      { questionId: 'q4', answer: '', mediaUrls: ['photo1.jpg', 'photo2.jpg'] },
      { questionId: 'q5', answer: 'Load-bearing walls are in good condition with proper bonding and no visible cracks.' },
      { questionId: 'q6', answer: 'Yes' },
      { questionId: 'q7', answer: '4' },
      { questionId: 'q8', answer: 'No' },
      { questionId: 'q10', answer: 'Yes' },
      { questionId: 'q11', answer: '5' },
      { questionId: 'q12', answer: 'Yes' },
      { questionId: 'q13', answer: 'Copper' },
      { questionId: 'q14', answer: '4' },
      { questionId: 'q15', answer: '4' },
      { questionId: 'q16', answer: '3' },
      { questionId: 'q17', answer: '', mediaUrls: ['photo3.jpg'] },
      { questionId: 'q18', answer: 'Yes' },
      { questionId: 'q19', answer: 'Yes' },
      { questionId: 'q20', answer: 'Overall construction quality is good. Minor touch-up needed in painting work.' },
    ],
    overallNotes: 'Construction quality is satisfactory. Recommended minor improvements in painting finish.',
    photos: ['site1.jpg', 'site2.jpg', 'site3.jpg'],
    submittedAt: '2024-06-16',
    status: 'submitted',
  },
  {
    id: 's2', enquiryId: 'e4', agentId: 'u4', agentName: 'Amit Patel',
    responses: [
      { questionId: 'q1', answer: 'Yes' },
      { questionId: 'q2', answer: '4' },
      { questionId: 'q3', answer: 'No' },
      { questionId: 'q5', answer: 'Good structural integrity observed.' },
      { questionId: 'q6', answer: 'Yes' },
      { questionId: 'q7', answer: '5' },
      { questionId: 'q8', answer: 'No' },
      { questionId: 'q10', answer: 'Yes' },
      { questionId: 'q11', answer: '4' },
      { questionId: 'q12', answer: 'Yes' },
      { questionId: 'q13', answer: 'Copper' },
      { questionId: 'q14', answer: '5' },
      { questionId: 'q15', answer: '4' },
      { questionId: 'q16', answer: '4' },
      { questionId: 'q18', answer: 'Yes' },
      { questionId: 'q19', answer: 'Yes' },
    ],
    overallNotes: 'Excellent quality construction with high-grade materials used throughout.',
    photos: ['site4.jpg', 'site5.jpg'],
    submittedAt: '2024-05-12',
    status: 'reviewed',
  },
];

export const demoCertificates: Certificate[] = [
  {
    id: 'cert1', enquiryId: 'e4', propertyAddress: '12, Lake View Towers, Hebbal',
    clientName: 'Priya Sharma', rating: 4.2, grade: 'A',
    issuedBy: 'Dr. Meera Iyer', issuedAt: '2024-05-20', validUntil: '2025-05-20',
    findings: 'The property meets all quality standards. Structural integrity is excellent. Electrical and plumbing work follows IS standards. Finishing quality is above average.',
    recommendations: 'Regular maintenance of plumbing fixtures recommended. Annual waterproofing check advised.',
  },
];

export const demoNotifications: Notification[] = [
  { id: 'n1', userId: 'u2', title: 'Enquiry Confirmed', message: 'Your enquiry #e1 has been confirmed and a field engineer has been assigned.', read: true, createdAt: '2024-06-02', type: 'success' },
  { id: 'n2', userId: 'u2', title: 'Inspection Completed', message: 'Inspection for enquiry #e1 has been completed. Under review.', read: false, createdAt: '2024-06-16', type: 'info' },
  { id: 'n3', userId: 'u3', title: 'Certificate Issued', message: 'Quality certificate for Lake View Towers has been issued.', read: false, createdAt: '2024-05-20', type: 'success' },
  { id: 'n4', userId: 'u4', title: 'New Assignment', message: 'You have been assigned to inspect Green Valley Apartments.', read: true, createdAt: '2024-06-02', type: 'info' },
];
