import React, { useEffect, useState } from "react";
import { useApp, } from '../../context/AppContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { StarRating } from '../ui/StarRating';
import { apiRequest } from "../../api/api";
import { MapPin, Calendar, User, FileCheck, CheckCircle, Award } from 'lucide-react';
import { toast } from "react-toastify";

export const EngineerReviews: React.FC = () => {
  type SelectedSubType = {
    questions: any[];
    responses: any[];
    overallNotes: string;
  };

  type Question = {
    question_id: string;
    question: string;
    type: string;
    category_name?: string;
    required?: boolean;
  };

  type Response = {
    question_id: string;
    question_text?: string;
    question_type?: string;
    category_name?: string;
    answer_text?: string;
    answer_boolean?: boolean;
    answer_number?: number;
    answer_array?: string[];
    remarks?: string;
    score?: number;
    is_na?: boolean;
    media?: {
        media_id: string;
        file: string;
        file_type: string;
        caption: string;
    }[];
  };

  type Enquiry = {
    enquiry_id: string;
    propertyAddress: string;
    propertyType: string;
    constructionStage: string;
    clientName: string;
  };
  const { currentUser, submissions, navigate} = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<SelectedSubType | null>(null);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const grouped = selectedSub?.responses.reduce((acc, r) => {
    const category = r.category_name || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(r);
    return acc;
  }, {} as Record<string, any[]>);
  
  if (!currentUser) return null;

  useEffect(() => {
      fetchPending();
    }, []);
    const fetchPending = async () => { 
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/enquiries/engineer-assignments/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        toast.error("Failed to load dashboard");
        throw new Error("Failed to load dashboard");
      }

      const data = await response.json();
      console.log(data)
      setDashboard(data);
    } catch (error) {
      toast.error("Failed to load dashboard"+error);
      console.error(error);
    }
  };

  if (!dashboard) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }


  // const handleStartReview = async (enqId: string) => {
  //   setSelectedId(enqId);

  //   const res = await fetch(
  //     `http://127.0.0.1:8000/api/enquiries/review-detail/${enqId}/`,
  //     {
  //       headers: {
  //         Authorization: `Token ${localStorage.getItem("token")}`,
  //       },
  //     }
  //   );

  //   const data = await res.json();

  //   setSelected(data.enquiry);

  //   // setSelectedSub({
  //   //   questions: data.questions,
  //   //   responses: data.responses,
  //   //   overallNotes: data.agent_notes,
  //   // });

  //   setShowReviewForm(true);
  // };

  

    const handleStartReview = async (enquiryId: string) => {
    try {

        setLoadingReview(true);

        const data = await apiRequest(
            `/enquiries/review-detail/${enquiryId}/`
        );
        console.log("Review Detail API:", data);
console.log("Responses:", data.responses);
        navigate(
            "engineer-review-inspection",
            {
                enquiry: data.enquiry,
                report: data.inspection_report,
                template: data.template,
                responses: data.responses,
            }
        );

    } catch (err) {

        console.error(err);

    } finally {

        setLoadingReview(false);

    }
};

  const calculateGrade = (r: number): 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' => {
    if (r >= 4.5) return 'A+';
    if (r >= 4.0) return 'A';
    if (r >= 3.5) return 'B+';
    if (r >= 3.0) return 'B';
    if (r >= 2.0) return 'C';
    return 'D';
  };

  
  const handleIssueCertificate = async () => {
    if (!selected?.enquiry_id || rating === 0 || !findings) return;

    try {
      const payload = {
        rating,
        findings,
        recommendations,
      };

        const res = await fetch(
          `http://127.0.0.1:8000/api/certificates/reviews/${selected.enquiry_id}/issue-certificate/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                rating,
                findings,
                recommendations,
              }),
            });

        if (!res.ok) {
            const error = await res.json();
            toast.error(error.detail || "Failed to issue certificate");
            return;
        }

        const certificate = await res.json();

      setShowReviewForm(false);
      await fetchPending();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while issuing certificate");
    }
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Pending Reviews</h2>
        <p className="text-gray-500 text-sm mt-1">Review inspection reports and issue quality certificates.</p>
      </div>

      {!dashboard ? (
        <div className="p-6 text-gray-500">Loading...</div>
      ) : dashboard?.pending_reviews?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <CheckCircle className="w-16 h-16 text-green-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No pending reviews!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dashboard.pending_reviews.map((enq: any) => {
            const id = enq.enquiry_id;
            const sub = submissions.find(
              (s: any) => s.enquiryId === id || s.enquiry_id === id
            );

            return (
              <div key={id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">
                        #{id.slice(-4).toUpperCase()}
                      </span>
                      <StatusBadge status={enq.status} />
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {enq.propertyAddress}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {enq.city}
                      </span>

                      <span>
                        {enq.propertyType} • {enq.constructionStage}
                      </span>

                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> Client: {enq.clientName}
                      </span>
                      {enq.agentName && <span className="flex items-center gap-1"><User className="w-3 h-3" /> Field Engineer: {enq.agentName}</span>}
                      {sub && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Submitted: {sub.submittedAt}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                   onClick={() => handleStartReview(id)}
                    // onClick={() => handleStartReview(id)}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Form Modal */}
      <Modal
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        title={submitted ? 'Certificate Issued!' : 'Review Inspection Report'}
        size="xl"
      >
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Certificate Issued Successfully!</h3>
            <p className="text-gray-500 mb-2">Grade: <span className="font-bold text-green-600 text-lg">{calculateGrade(rating)}</span> • Rating: <span className="font-bold">{rating}/5</span></p>
            <p className="text-gray-400 text-sm mb-6">The client has been notified about the certificate.</p>
            <button
              onClick={() => { setShowReviewForm(false); setSelectedId(null); }}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {selected && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <div className="text-sm font-semibold text-purple-900">{selected.propertyAddress}</div>
                <div className="text-xs text-purple-600 mt-1">{selected.propertyType} • {selected.constructionStage} • Client: {selected.clientName}</div>
              </div>
            )}

            {/* Inspection Responses */}
            {selectedSub?.responses?.map((resp: any, i: number) => {
             
              const displayAnswer =
                  resp.answer_boolean !== null &&
                  resp.answer_boolean !== undefined
                    ? (resp.answer_boolean ? "Yes" : "No")
                    : resp.answer_number !== null &&
                      resp.answer_number !== undefined
                    ? resp.answer_number
                    : resp.answer_text
                    ? resp.answer_text
                    : resp.answer_array?.length
                    ? resp.answer_array.join(", ")
                    : "—";
              return (
                <div key={i} className="bg-gray-50 rounded-xl p-3 flex gap-3">
                  <span className="text-xs font-mono text-gray-400">Q{i + 1}. </span>

                  <div className="flex-1">
                    <div className="text-xs text-gray-500">
                      {resp.question_text}
                    </div>

                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {displayAnswer}
                    </div>
                    {resp.score !== null && resp.score !== undefined && (

                    <div className="text-xs text-green-700 mt-1">
                      Score : {resp.score}
                    </div>
                      
                    )}
                    {resp.remarks && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-gray-500">
                          Remarks
                        </div>
                        <div className="text-sm">
                          {resp.remarks}
                        </div>
                      </div>
                      )}
                      {resp.is_na && (
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs">
                        Not Applicable
                        </span>
                      )}
                      {resp.media?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {resp.media.map((m:any)=>(
                            <img
                            key={m.media_id}
                            src={`http://127.0.0.1:8000${m.file}`}
                            className="w-24 h-24 rounded object-cover"
                            />
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}

            <div className="mt-3 bg-blue-50 rounded-xl p-3">
              <div className="text-xs font-medium text-blue-600">Field Engineer's Notes</div>
              <div className="text-sm text-blue-900 mt-1">
                {selectedSub?.overallNotes || "No notes provided"}
              </div>
            </div>
            
            {/* Tecnical Auditors's Assessment */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-bold text-gray-900 mb-4">Your Assessment</h4>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Overall Quality Rating <span className="text-red-500 ml-1">*</span></label>
                <div className="flex items-center gap-3">
                  <StarRating rating={rating} onRate={setRating} size="lg" />
                  {rating > 0 && (
                    <span className="text-lg font-bold text-gray-700">
                      {rating}/5 — Grade: <span className="text-green-600">{calculateGrade(rating)}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Findings <span className="text-red-500 ml-1">*</span></label>
                <textarea
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Summarize your findings based on the inspection report..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Recommendations</label>
                <textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Any recommendations for the property..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 sticky bottom-0 bg-white py-4 border-t border-gray-100 -mx-5 px-5 -mb-5">
              <button
                onClick={handleIssueCertificate}
                disabled={rating === 0 || !findings}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Award className="w-5 h-5" /> Issue Certificate
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};
