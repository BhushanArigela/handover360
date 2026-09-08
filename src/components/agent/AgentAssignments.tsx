import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { StarRating } from '../ui/StarRating';
import { MapPin, Calendar, User,Building2, Camera, Filter, ClipboardList, Clock, Send, CheckCircle, FileText } from 'lucide-react';
import { QuestionnaireResponse } from '../../types';
import { toast } from "react-toastify";
import { API_URL } from '../../config/env';


export const AgentAssignments: React.FC = () => {
  const { submissions, submitInspection, updateEnquiryStatus, navigate } = useApp();
  const [showReview, setShowReview] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [responses, setResponses] = useState<Record<string, QuestionnaireResponse>>({});
  const [overallNotes, setOverallNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const currentUserDetail = JSON.parse(
    localStorage.getItem("user") || "{}"
  );
  const currentUser = currentUserDetail.id
  if (!currentUser) return null;

  const currentUsername = currentUserDetail.name || currentUserDetail.name
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateQuestions, setTemplateQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);  
  
  const calculateQuestionScore = (
      question: any,
      response: any
  ): number => {

      if (!question.has_scoring) return 0;

      switch (question.type) {

          case "rating":
              return Number(response.answerNumber || 0);

          case "yes_no":
          case "multiple_choice":
          case "dropdown": {
              const option = question.options_config.find(
                  (o: any) => o.text === response.answer
              );
              return Number(option?.score || 0);
          }

          case "checkbox":
              return (response.answerArray || []).reduce(
                  (total: number, value: string) => {
                      const option = question.options_config.find(
                          (o: any) => o.text === value
                      );
                      return total + Number(option?.score || 0);
                  },
                  0
              );

          default:
              return 0;
      }
  };
 
  const totalScore = templateQuestions.reduce((total, q) => {
    if (!q.has_scoring) return total;

    return total + Number(
        responses[q.template_question_id]?.score || 0
    );
}, 0);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
         `${API_URL}/enquiries/agent-assignments/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAssignments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const myAssignments = assignments;

  const selected = myAssignments.find(e => e.enquiry_id === selectedId);
  const existingSubmission = selected ? submissions.find(s => s.enquiryId === selected.id) : null;

  const handleStartInspection = async (enq: any) => {
    const target = enq || selected;
  if (!target) return;

    try {
      setLoadingQuestions(true);

      const token = localStorage.getItem("token");
      // console.log(enq)
      // IMPORTANT: use correct field
      const templateId =
        enq.template_id;

      if (!templateId) {
        console.error("No template found for enquiry");
        return;
      }

      const res = await fetch(
        `${API_URL}/masters/templates/${templateId}/structure/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
     

    const template = await res.json();

      setSubmitted(false);
      const statusResp = await fetch(
        `${API_URL}/enquiries/${enq.enquiry_id}/change-status/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            status: "inspection_in_progress",
            remarks: `Inspection started by ${
              currentUserDetail.name || currentUserDetail.username
            }`,
          }),
        }
      );

      if (!statusResp.ok) {
        toast.error("Failed to start inspection");
        return;
      }
      updateEnquiryStatus(enq.enquiry_id, "inspection_in_progress");
      setAssignments((prev) =>
        prev.map((item) =>
          item.enquiry_id === enq.enquiry_id
            ? { ...item, status: "inspection_in_progress" }
            : item
        )
      );
      setSelectedId(enq.enquiry_id);
      navigate("agent-inspection", {
        enquiry: enq,
        enquiryId: enq.enquiry_id
    });
      // setShowInspectionForm(true);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const toggleMultiChoice = (
    questionId: string,
    option: string
  ) => {
    setResponses((prev) => {
      const answer = prev[questionId]?.answer;

      const currentAnswers: string[] = Array.isArray(answer)
        ? answer
        : [];

      const updatedAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter(
            (item) => item !== option
          )
        : [...currentAnswers, option];

      return {

        ...prev,

        [questionId]: {

            ...prev[questionId],

            questionId,

            answer: updatedAnswers,

            answerArray: updatedAnswers,

            answerBoolean: null,

            answerNumber: null,

            answerText: null,

            score: updatedAnswers.reduce(

                (sum, item) => {

                    const q = templateQuestions.find(
                        (x) => x.template_question_id === questionId
                    );

                    const opt = q?.options_config?.find(
                        (o: any) => o.text === item
                    );

                    return sum + Number(opt?.score || 0);

                },

                0

            )

        }

    };
    });
  };
  const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB

  const ALLOWED_IMAGE_TYPES = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
  ];

  const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

  const ALLOWED_VIDEO_TYPES = [
      "video/mp4",
      "video/quicktime", // mov
      "video/webm"
  ];
  const updateResponse = (
    qId: string,
    field: string,
    value: any
  ) => {

      setResponses(prev => ({

          ...prev,

          [qId]: {

              ...prev[qId],

              [field]: value

          }

      }));

  };

  const getCategoryLabel = (index: number) =>
    String.fromCharCode(65 + index);
  
  const renderAnswer = (q: any) => {
    const response = responses[q.template_question_id];

    if (!response) {
      return (
        <span className="text-gray-400 italic">
          Not Answered
        </span>
      );
    }

    switch (q.type) {
      case "yes_no":
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              response.answerBoolean
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {response.answerBoolean ? "YES" : "NO"}
          </span>
        );

      case "text":
      case "textarea":
        return response.answerText || (
          <span className="text-gray-400">-</span>
        );

      case "rating":
        return (
          <div className="flex">
            {Array.from({
              length: Number(response.answerNumber || 0),
            }).map((_, i) => (
              <span key={i}>⭐</span>
            ))}
          </div>
        );

      case "multiple_choice":
        return (
          response.answerArray?.join(", ") ||
          <span className="text-gray-400">-</span>
        );

      case "photo":
        return (
          <span>
            {response.mediaUrls?.length || 0} Photo(s)
          </span>
        );

      case "video":
        return (
          <span>
            {response.mediaUrls?.length || 0} Video(s)
          </span>
        );

      default:
        return "-";
    }
  };
  
  const handleSaveDraft = async () => {
    if (!selected) return;

    const payload = {
      enquiry_id: selected.enquiry_id,

      template_id: selected.template_id,

      inspection_started_at: null,
      inspection_completed_at: null,

      latitude: null,
      longitude: null,

      device_info: navigator.userAgent,
      app_version: "1.0.0",

      overall_notes: overallNotes,

      responses: Object.values(responses).map((r: any) => ({
        question_id: r.questionId,

        template_question_id: r.templateQuestionId,

        question_text: r.questionText,
        question_type: r.questionType,

        category_id: r.categoryId,
        category_name: r.categoryName,

        required: r.required,

        answer_text: r.answerText,
        answer_boolean: r.answerBoolean,
        answer_number: r.answerNumber,
        answer_array: r.answerArray,

        remarks: r.remarks,
        score: r.score,
        is_na: r.isNA,
      })),
    };

    try {
      
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/responses/inspection/save-draft/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Draft saved successfully");
      } else {
        toast.error(data.message || "Failed to save draft");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to save draft");
    }
  };

  const handleSubmitInspection = async () => {
    if (!selected) return;

    const missingQuestions = templateQuestions.filter((q) => {

      if (!q.required) return false;

      const response = responses[q.template_question_id];

      if (!response) return true;

      // Ignore N/A
      if (response.isNA) return false;

      switch (q.type) {

          case "text":
          case "textarea":
              return !response.answerText?.trim();

          case "yes_no":
              return response.answerBoolean === null ||
                    response.answerBoolean === undefined;

          case "rating":
              return response.answerNumber === null ||
                    response.answerNumber === undefined;

          case "multiple_choice":
              return (
                  !response.answerArray ||
                  response.answerArray.length === 0
              );

          case "photo":
          case "video":
              return (
                  !response.mediaUrls ||
                  response.mediaUrls.length === 0
              );

          default:
              return false;
      }

  });

    if (missingQuestions.length > 0) {
      toast.error(
        `Please complete all required questions (${missingQuestions.length} remaining:\n\n${missingQuestions
          .map((q) => `• ${q.question_text}`)
          .join("\n")})`
      );
      return;
    }
    
    const payload = {

      enquiry_id: selected.enquiry_id,

      template_id: selected.template_id,

      inspection_started_at: null,
      inspection_completed_at: null,

      latitude: null,
      longitude: null,

      device_info: navigator.userAgent,

      app_version: "1.0.0",
      overall_notes: overallNotes,

      responses: Object.values(responses).map((r:any)=>({

          question_id: r.questionId,

          template_question_id: r.templateQuestionId,

          question_text: r.questionText,

          question_type: r.questionType,

          category_id: r.categoryId,

          category_name: r.categoryName,

          required: r.required,

          answer_text: r.answerText,

          answer_boolean: r.answerBoolean,

          answer_number: r.answerNumber,

          answer_array: r.answerArray,

          remarks: r.remarks,

          score: r.score,

          is_na: r.isNA

      }))

  };

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/responses/inspection/submit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (res.ok) {
      for (const [qId, r] of Object.entries(responses)) {
        if (r.mediaUrls?.length) {
          const fd = new FormData();

          fd.append("question_id", qId);
          fd.append("enquiry_id", selected.enquiry_id);

          r.mediaUrls.forEach((file: File) => {
            fd.append("files", file);
          });

          await fetch(`${API_URL}/responses/upload-media/`, {
            method: "POST",
            headers: {
              Authorization: `Token ${token}`,
            },
            body: fd,
          });
        }
      }

      const resp = await fetch(
        `${API_URL}/enquiries/${selected.enquiry_id}/change-status/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`
          },
          body: JSON.stringify({
            status: "inspection_completed",
            remarks: "Inspection done by "+ currentUserDetail.name || currentUserDetail.username,
          }),
        }
      );
      if (resp.ok){
        setSubmitted(true);
      } else {
        toast.error("Failed to save");
      }
    } else{
      toast.error("Failed to save");
    }
    
  };

    
  const categories = React.useMemo(() => {
    return [...new Set(templateQuestions.map(q => q.category))];
  }, [templateQuestions]);

  useEffect(() => {
    let score = 0;

    templateQuestions.forEach((q: any) => {
      if (!q.has_scoring) return;

      const response = responses[q.template_question_id];

      if (!response) return;

      score += Number(response.score || 0);
    });

    
  }, [responses, templateQuestions]);

  const getCategoryScore = (category: string) => {
    return templateQuestions
      .filter(
        (q: any) => q.category === category && q.has_scoring
      )
      .reduce((total, q: any) => {
        const response = responses[q.template_question_id];
        return total + Number(response?.score || 0);
      }, 0);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">My Assignments</h2>
        <p className="text-gray-500 text-sm mt-1">Pending inspection assignments for site visits.</p>
      </div>
      <div className="assignment-toolbar">

    {/* <div className="filter-tabs">

        <button className="filter-btn active">
            <ClipboardList className="w-7 h-7" /> 
            <span>All Assignments</span>
            <span className="count">2</span>
        </button>

        <button className="filter-btn">
            <User className="w-7 h-7 text-blue-600" /> 
            <span>Field Engineer Assigned</span>
            <span className="count">2</span>
        </button>

        <button className="filter-btn">
            <Clock className="w-7 h-7 text-orange-600" /> 
            <span>In Progress</span>
            <span className="count">0</span>
        </button>

        <button className="filter-btn ">
            <CheckCircle className="w-7 h-7 text-green-600" /> 
            <span>Completed</span>
            <span className="count">0</span>
        </button>

    </div>

    <button className="sort-btn">
        <Filter className="w-7 h-7" /> 
        <span>Sort by: Latest</span>
        <i className="fa-solid fa-chevron-down"></i>
    </button> */}

</div>

      {myAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <CheckCircle className="w-16 h-16 text-green-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No pending assignments!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myAssignments.map(enq => (
            <div
              key={enq.enquiry_id}
              onClick={() => setSelectedId(enq.enquiry_id)}
              className="bg-white rounded-2xl border border-l-[3px] border-l-blue-500 border-gray-100 p-5 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="w-24 h-24 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                  <MapPin className="w-12 h-12" /> 
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-400">#{enq.enquiry_id.slice(-4).toUpperCase()}</span>
                    <StatusBadge status={enq.status} />
                  </div>
                  <h3 className="text-base mb-2 font-semibold text-gray-900 truncate">{enq.propertyAddress}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 mb-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {enq.city}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {enq.propertyType}</span>
                    <span className="flex items-center gap-1"><User className="w-4 h-4" /> {enq.clientName}</span>
                    {enq.scheduledDate && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {enq.scheduledDate}</span>}
                  </div>
                  {/* <div className="text-xs w-fit bg-gray-100 p-3 rounded-lg flex items-center gap-3 text-gray-600">
                    <Calendar className="w-4 h-4" />  Due: <b>24 May, 2025</b>
                    <Clock className="w-4 h-4" />  <b>10:00 AM - 12:00 PM</b>
                  </div> */}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedId(enq.enquiry_id); handleStartInspection(enq); }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  {enq.status === "inspection_in_progress"
                  ? "Continue Inspection"
                  : "Start Inspection"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspection Form Modal */}
      <Modal
        isOpen={showInspectionForm}
        onClose={() => setShowInspectionForm(false)}
        title={submitted ? 'Inspection Submitted' : 'Inspection Questionnaire'}
        size="xl"
      >
        {submitted ? (
          <div key={selected?.enquiry_id} className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Inspection Report Submitted!</h3>
            <p className="text-gray-500 mb-4">Your inspection report has been submitted for tecnical auditor review.</p>
            <button
              onClick={() => { setShowInspectionForm(false); setSelectedId(null); fetchAssignments()}}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {selected && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="text-sm font-semibold text-blue-900">{selected.propertyAddress}</div>
                <div className="text-xs text-blue-600 mt-1">{selected.propertyType} • {selected.constructionStage} • {selected.clientName}</div>
              </div>
            )}

            {existingSubmission ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-700 font-medium">Inspection already submitted for this enquiry.</p>
              </div>
            ) : showReview ? (

            <div className="space-y-6">

              {/* Property Details */}

              <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">

                  <h3 className="text-lg font-bold text-blue-900 mb-4">
                      Inspection Preview
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">

                      <div>
                          <div className="font-semibold">Property</div>
                          <div>{selected?.propertyAddress}</div>
                      </div>

                      <div>
                          <div className="font-semibold">Client</div>
                          <div>{selected?.clientName}</div>
                      </div>

                      <div>
                          <div className="font-semibold">Property Type</div>
                          <div>{selected?.propertyType}</div>
                      </div>

                      <div>
                          <div className="font-semibold">Construction Stage</div>
                          <div>{selected?.constructionStage}</div>
                      </div>

                  </div>

              </div>

              {/* Categories */}

              {categories.map((cat, catIndex) => (

                  <div
                      key={cat}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm"
                  >

                      <div className="bg-gray-50 border-b px-5 py-3 rounded-t-xl">

                          <h4 className="font-bold">
                              {getCategoryLabel(catIndex)}. {cat}

                              <span className="float-right text-green-600">
                                {getCategoryScore(cat)}
                              </span>
                          </h4>

                      </div>

                      <div className="divide-y">

                          {templateQuestions
                              .filter(q => q.category === cat)
                              .map((q, index) => {

                                  const response =
                                      responses[q.template_question_id];

                                  return (

                                      <div
                                          key={q.template_question_id}
                                          className="p-5"
                                      >

                                          <div className="font-medium text-gray-800 mb-3">

                                              {index + 1}. {q.question_text} 

                                          </div>

                                          <div className="text-sm">
                                              
                                              {/* YES NO */}

                                              {q.type === "yes_no" && (

                                                  <span
                                                      className={`px-3 py-1 rounded-full text-white ${
                                                          response?.answerBoolean
                                                              ? "bg-green-600"
                                                              : "bg-red-600"
                                                      }`}
                                                  >

                                                      {response?.answerBoolean
                                                          ? "YES"
                                                          : "NO"}

                                                  </span>

                                              )}
                                          
                                              {/* TEXT */}

                                              {(q.type === "text" ||
                                                  q.type === "textarea" || q.type === "dropdown") && (

                                                  <span className='px-3 py-1 rounded-full text-white bg-green-600'>

                                                      {response?.answerText || "-"}

                                                  </span>

                                              )}

                                              {/* RATING */}

                                              {q.type === "rating" && (

                                                  <div className="flex">

                                                      {Array.from({
                                                          length:
                                                              Number(
                                                                  response?.answerNumber ||
                                                                      0
                                                              ),
                                                      }).map((_, i) => (

                                                          <span key={i}>
                                                              ⭐
                                                          </span>

                                                      ))}

                                                  </div>

                                              )}

                                              {/* MULTIPLE */}

                                              {["multiple_choice", "checkbox"].includes(q.type) && (

                                                  <span className='px-3 py-1 rounded-full text-white bg-green-600'>

                                                      {response?.answerArray?.join(
                                                          ", "
                                                      ) || "-"}

                                                  </span>

                                              )}

                                              {/* PHOTO */}

                                              {q.type === "photo" && (

                                                  <span>

                                                      {response?.mediaUrls?.length || 0}
                                                      {" "}Photo(s)

                                                  </span>

                                              )}

                                              {/* VIDEO */}

                                              {q.type === "video" && (

                                                  <span>

                                                      {response?.mediaUrls?.length || 0}
                                                      {" "}Video(s)

                                                  </span>

                                              )}
                                            {q.has_scoring && (
                            
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            Score: {response?.score ?? 0}
        </span>
    )}
                                          </div>

                                      </div>

                                  );

                              })}

                      </div>

                  </div>

              ))}

              {/* Overall Notes */}

              <div className="bg-white rounded-xl border p-5">

                  <h4 className="font-bold mb-2">

                      Overall Notes

                  </h4>

                  <div className="text-gray-700 whitespace-pre-wrap">

                      {overallNotes || "-"}

                  </div>

              </div>

              {/* Score */}

              <div className="bg-green-50 rounded-xl border border-green-200 p-4 flex justify-between">

                  <span className="font-semibold">

                      Total Score

                  </span>

                  <span className="font-bold text-green-700">

                      {totalScore}

                  </span>

              </div>

              {/* Buttons */}

              <div className="flex gap-3 sticky bottom-0 bg-white py-4 border-t">

                  <button
                      onClick={() => setShowReview(false)}
                      className="px-6 py-3 border rounded-xl"
                  >
                      Back To Edit
                  </button>

                  <button
                      onClick={handleSubmitInspection}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                  >
                      Submit Inspection Report
                  </button>

              </div>

          </div>
            ) : (
              <>
              
                {categories.map((cat, catIndex) => (
                  <div key={cat}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full" />
                      {getCategoryLabel(catIndex)}. {cat}
                    </h4>
                    <div className="space-y-4 ml-4">
                      {templateQuestions
                        .filter((q) => q.category === cat)
                        .map((q, qIndex) => (
                          <div
                            key={q.template_question_id}
                            className="bg-gray-50 rounded-xl p-4"
                          >
                            <div className="text-sm font-medium text-gray-800 mb-2 flex gap-2">
                              <span className="font-semibold text-gray-600">
                                {qIndex + 1}.
                              </span>

                              <span>
                                {q.question_text}
                                {q.required && <span className="text-red-500 ml-1">*</span>}
                              </span>
                            </div>
                            {q.help_text && (
                              <div className="text-xs text-gray-500 mt-1">
                                {q.help_text}
                              </div>
                            )}
                            {/* DROPDOWN */}
                              {q.type === "dropdown" &&
                                q.options_config?.length > 0 && (
                                  <select
                                    value={responses[q.template_question_id]?.answer || ""}
                                    onChange={(e) => {
                                    const value = e.target.value;

                                    const selectedOption = q.options_config.find(
                                        (opt: any) => opt.text === value
                                    );

                                    setResponses(prev => ({
                                        ...prev,
                                        [q.template_question_id]: {
                                            ...prev[q.template_question_id],

                                            answer: value,
                                            answerText: value,

                                            answerBoolean: null,
                                            answerNumber: null,
                                            answerArray: [],

                                            score: Number(selectedOption?.score || 0),
                                        }
                                    }));
                                }}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                  >
                                    <option value="">Select an option</option>

                                    {q.options_config.map((opt: any) => (
                                      <option
                                        key={opt.text}
                                        value={opt.text}
                                      >
                                        {opt.text}
                                        {q.has_scoring ? ` (${opt.score})` : ""}
                                      </option>
                                    ))}
                                  </select>
                              )}
                            {/* YES / NO */}
                            {q.type === "yes_no" && (
                              <div className="flex gap-2">
                                {["Yes", "No"].map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      const selectedOption = q.options_config?.find(
                                          (o: any) => o.text === opt
                                      );

                                      console.log("Clicked:", opt);
                                      console.log("Options:", q.options_config);
                                      console.log("Matched:", selectedOption);

                                      setResponses(prev => ({
                                          ...prev,
                                          [q.template_question_id]: {
                                              ...prev[q.template_question_id],

                                              answer: opt,
                                              answerBoolean: opt === "Yes",
                                              answerText: null,
                                              answerNumber: null,
                                              answerArray: [],

                                              score: q.has_scoring
                                                  ? Number(selectedOption?.score || 0)
                                                  : 0
                                          }
                                      }));
                                  }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                      responses[q.template_question_id]?.answerBoolean === (opt === "Yes")
                                        ? opt === "Yes"
                                          ? "bg-green-500 text-white"
                                          : "bg-red-500 text-white"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* RATING */}
                            {q.type === "rating" && (
                              <StarRating
                                rating={
                                  Number(
                                    responses[q.template_question_id]?.answerNumber
                                  ) || 0
                                }
                                onRate={(r) => {

                                  setResponses(prev => ({

                                      ...prev,

                                      [q.template_question_id]: {

                                          ...prev[q.template_question_id],

                                          answer: r,

                                          answerNumber: r,

                                          answerText: null,

                                          answerBoolean: null,

                                          answerArray: [],

                                          score: r

                                      }

                                  }));

                              }}
                                size="md"
                              />
                            )}

                            {/* TEXT */}
                            {q.type === "text" && (
                              <input
                                type="text"
                                value={
                                  responses[q.template_question_id]?.answerText || ""
                                }
                                onChange={(e)=>{

                                  const value = e.target.value;

                                  setResponses(prev=>({

                                      ...prev,

                                      [q.template_question_id]:{

                                          ...prev[q.template_question_id],

                                          answer:value,

                                          answerText:value,

                                          answerBoolean:null,

                                          answerNumber:null,

                                          answerArray:[]

                                      }

                                  }));

                              }}
                                placeholder={q.placeholder || "Enter your answer"}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            )}

                            {/* TEXTAREA */}
                            {q.type === "textarea" && (
                              <textarea
                                value={
                                  responses[q.template_question_id]?.answerText || ""
                                }
                                onChange={(e)=>{

                                  const value = e.target.value;

                                  setResponses(prev=>({

                                      ...prev,

                                      [q.template_question_id]:{

                                          ...prev[q.template_question_id],

                                          answer:value,

                                          answerText:value,

                                          answerBoolean:null,

                                          answerNumber:null,

                                          answerArray:[]

                                      }

                                  }));

                              }}
                                placeholder={q.placeholder || "Describe in detail"}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                              />
                            )}

                            {/* MULTIPLE CHOICE */}
                            {["multiple_choice", "checkbox"].includes(q.type) &&
                              q.options_config?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {q.options_config.map((opt: any) => {
                                    const selectedOptions =
                                      responses[q.template_question_id]?.answerArray || [];

                                    const isSelected =
                                      selectedOptions.includes(opt.text);

                                    return (
                                      <button
                                        key={opt.text}
                                        type="button"
                                        onClick={() =>
                                          toggleMultiChoice(
                                            q.template_question_id,
                                            opt.text
                                          )
                                        }
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                          isSelected
                                            ? "bg-blue-500 text-white"
                                            : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
                                        }`}
                                      >
                                        {opt.text}
                                        {q.has_scoring && (
                                          <span className="ml-2 text-xs opacity-75">
                                            ({opt.score})
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                            )}

                            {/* PHOTO */}
                            {q.type === "photo" && (
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 cursor-pointer">
                                  <Camera className="w-4 h-4" />
                                  Upload Photos

                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || []);
                                      for (const file of files) {
                                          if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                                              toast.error(`${file.name} is not a supported image.`);
                                              return;
                                          }

                                          if (file.size > MAX_PHOTO_SIZE) {
                                              toast.error(`${file.name} exceeds 10 MB.`);
                                              return;
                                          }
                                      }
                                      setResponses((prev) => ({
                                        ...prev,
                                        [q.template_question_id]: {
                                          ...prev[q.template_question_id],
                                          mediaUrls: files, // ✅ real files stored here
                                          answerText: "uploaded",
                                        },
                                      }));
                                    }}
                                  />
                                </label>

                                {responses[q.template_question_id]?.answer ===
                                  "uploaded" && (
                                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Uploaded
                                  </span>
                                )}
                              </div>
                            )}

                            {/* VIDEO */}
                            {q.type === "video" && (
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 cursor-pointer">
                                  <Camera className="w-4 h-4" />
                                  Upload Video

                                  <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || []);
                                      for (const file of files) {
                                          if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
                                              toast.error(`${file.name} is not a supported video.`);
                                              return;
                                          }

                                          if (file.size > MAX_VIDEO_SIZE) {
                                              toast.error(`${file.name} exceeds 10 MB.`);
                                              return;
                                          }
                                      }
                                      setResponses((prev) => ({
                                        ...prev,
                                        [q.template_question_id]: {
                                          ...prev[q.template_question_id],
                                          mediaUrls: files,
                                          answerText: "uploaded",
                                        },
                                      }));
                                    }}
                                  />
                                </label>
                                {responses[q.template_question_id]?.answer ===
                                  "uploaded" && (
                                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Uploaded
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Overall Notes</h4>
                  <textarea
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    placeholder="Add your overall observations, notes, and recommendations..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2 sticky bottom-0 bg-white py-4 border-t border-gray-100 -mx-5 px-5 -mb-5">
                  <button
                    onClick={handleSaveDraft}
                    className="px-6 py-3 border border-gray-300 bg-white rounded-xl font-semibold hover:bg-gray-50"
                  >
                    Save Draft
                  </button>

                    <button
                    className="px-5 py-3 rounded-xl bg-blue-600 text-white"
                    onClick={() => setShowReview(true)}
                    >
                    Preview
                    </button>
                  <button
                    onClick={handleSubmitInspection}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25"
                  >
                    <Send className="w-5 h-5" /> Submit Inspection Report
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};
