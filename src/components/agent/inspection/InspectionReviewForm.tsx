import React, { useState, useEffect  } from "react";
import { getMediaUrl } from '../../../config/env';

interface Props {
    item: any;
    response?: any;
    onSave?: (payload: any) => void;
}

export const InspectionReviewForm: React.FC<Props> = ({
    item,
    response,
    onSave,
}) => {
    const [reviewStatus, setReviewStatus] = useState("");
    const [rating, setRating] = useState(5);
    const [remarks, setRemarks] = useState("");
    const [criticalFinding, setCriticalFinding] = useState(false);
    const [rectificationRequired, setRectificationRequired] = useState(false);
    const [targetDate, setTargetDate] = useState("");

    useEffect(() => {
        setReviewStatus(response?.review_status || "");
        setRating(response?.review_rating || 5);
        setRemarks(response?.review_remarks || "");
        setCriticalFinding(response?.critical_finding || false);
        setRectificationRequired(response?.rectification_required || false);
        setTargetDate(response?.target_date || "");
    }, [response]);
    const isReviewed = !!response?.review_status;

    return (
        <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-6">

            {/* Field Engineer Response */}

            <div className="bg-white rounded-lg border border-gray-200 p-4">

                <h3 className="font-semibold text-gray-800 mb-4">
                    Field Engineer Inspection
                </h3>

                <div className="grid grid-cols-2 gap-4">

                    <div>
                        <label className="text-xs text-gray-500">
                            Status
                        </label>

                        <div className="font-medium">
                            {response?.status
                                ?.replace(/_/g, " ")
                                ?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || "-"}

                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500">
                            Severity
                        </label>

                        <div className="font-medium">
                            {response?.severity
                                ?.replace(/_/g, " ")
                                ?.replace(/\b\w/g, (c: any) => c.toUpperCase()) || "-"}
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label className="text-xs text-gray-500">
                            Observation
                        </label>

                        <div className="bg-gray-100 rounded p-2 mt-1">
                            {response?.observation || "-"}
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label className="text-xs text-gray-500">
                            Rectification
                        </label>

                        <div className="bg-gray-100 rounded p-2 mt-1">
                            {response?.rectification || "-"}
                        </div>
                    </div>

                </div>

                {response?.photos?.length > 0 && (
                    <div className="mt-4">

                        <label className="text-xs text-gray-500">
                            Photos
                        </label>

                        <div className="flex flex-wrap gap-3 mt-2">

                            {response.photos.map((photo: any, index: number) => (
                                <img
                                    key={index}
                                    src={getMediaUrl(photo.file)}
                                    className="w-28 h-28 rounded border border-gray-200 object-cover"
                                />
                            ))}

                        </div>

                    </div>
                )}

                {response?.videos?.length > 0 && (
                    <div className="mt-4">

                        <label className="text-xs text-gray-500">
                            Videos
                        </label>

                        <div className="space-y-3 mt-2">

                            {response.videos.map((video: any, index: number) => (
                                <video
                                    key={index}
                                    controls
                                    className="w-64 rounded border border-gray-200"
                                >
                                    <source src={getMediaUrl(video.file)} />
                                </video>
                            ))}

                        </div>

                    </div>
                )}

            </div>

            {/* Technical Auditor Review */}

            <div className="bg-white rounded-lg border border-gray-200 p-4">

                <h3 className="font-semibold text-blue-700 mb-4">
                    Technical Auditor Review
                </h3>

                <div className="grid md:grid-cols-2 gap-4">

                    <div>

                        <label className="block text-sm font-medium mb-2">
                            Review Status
                        </label>

                        <select
                            className="w-full border border-gray-200 rounded-lg p-2"
                            value={reviewStatus}
                            onChange={(e) =>
                                setReviewStatus(e.target.value)
                            }
                        >
                            <option value="">Select</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="rework">Need Rectification</option>
                        </select>

                    </div>

                    <div>

                        <label className="block text-sm font-medium mb-2">
                            Rating
                        </label>

                        <select
                            className="w-full border border-gray-200 rounded-lg p-2"
                            value={rating}
                            onChange={(e) =>
                                setRating(Number(e.target.value))
                            }
                        >
                            <option value={5}>5</option>
                            <option value={4}>4</option>
                            <option value={3}>3</option>
                            <option value={2}>2</option>
                            <option value={1}>1</option>
                        </select>

                    </div>

                    <div className="flex items-center gap-2">

                        <input
                            type="checkbox"
                            checked={criticalFinding}
                            onChange={(e) =>
                                setCriticalFinding(e.target.checked)
                            }
                        />

                        <label>Critical Finding</label>

                    </div>

                    <div className="flex items-center gap-2">

                        <input
                            type="checkbox"
                            checked={rectificationRequired}
                            onChange={(e) =>
                                setRectificationRequired(e.target.checked)
                            }
                        />

                        <label>Rectification Required</label>

                    </div>

                    <div>

                        <label className="block text-sm font-medium mb-2">
                            Target Completion Date
                        </label>

                        <input
                            type="date"
                            className="w-full border border-gray-200 rounded-lg p-2"
                            value={targetDate}
                            onChange={(e) =>
                                setTargetDate(e.target.value)
                            }
                        />

                    </div>

                    <div className="md:col-span-2">

                        <label className="block text-sm font-medium mb-2">
                            Review Remarks
                        </label>

                        <textarea
                            rows={4}
                            className="w-full border border-gray-200 rounded-lg p-3"
                            value={remarks}
                            onChange={(e) =>
                                setRemarks(e.target.value)
                            }
                        />

                    </div>

                </div>

                <div className="mt-6 flex justify-end">

                    <button
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        onClick={() =>
                            onSave?.({
                                item_id: item.id,
                                review_status: reviewStatus,
                                review_rating: rating,
                                review_remarks: remarks,
                                critical_finding: criticalFinding,
                                rectification_required: rectificationRequired,
                                target_date: targetDate,
                            })
                        }
                    >
                        {isReviewed ? "Update Review" : "Save Review"}
                    </button>

                </div>

            </div>

        </div>
    );
};