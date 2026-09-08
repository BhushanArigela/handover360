import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { DashboardLayout } from "../layout/DashboardLayout";
import { ReviewPreview } from "./ReviewPreview";

import { InspectionHeader } from "../agent/inspection/InspectionHeader";
import { InspectionSidebar } from "../agent/inspection/InspectionSidebar";
import { InspectionWorkspace } from "../agent/inspection/InspectionWorkspace";
import { apiRequest } from "../../api/api";
import { error, success, confirm  } from "../../utils/toast";

export const ReviewInspectionPage: React.FC = () => {
    const { pageParams, navigate } = useApp();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const enquiry = pageParams?.enquiry;
    const report = pageParams?.report;
    const template = pageParams?.template;

    const [responses, setResponses] = useState<Record<number, any>>(
        pageParams?.responses || {}
    );

    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

    useEffect(() => {
        if (!template?.floors?.length) return;

        const floor = template.floors[0];

        setSelectedFloor(floor.id);

        if (floor.rooms.length > 0) {
            setSelectedRoom(floor.rooms[0].id);
        }
    }, [template]);

    const selectedRoomData =
        template?.floors
            ?.flatMap((f: any) => f.rooms)
            ?.find((r: any) => r.id === selectedRoom);

    const totalItems =
        template?.floors?.reduce(
            (count: number, floor: any) =>
                count +
                floor.rooms.reduce(
                    (roomCount: number, room: any) =>
                        roomCount +
                        room.sections.reduce(
                            (sectionCount: number, section: any) =>
                                sectionCount + section.items.length,
                            0
                        ),
                    0
                ),
            0
        ) || 0;
console.log("Responses", responses);
    const reviewedItems = Object.values(responses).filter(
        (r: any) => r?.review_status
    ).length;

    const progress =
        totalItems === 0
            ? 0
            : Math.round((reviewedItems / totalItems) * 100);

    const handleReviewSave = async (payload: any) => {
   
        try {
            await apiRequest("/inspection/review/save/", {
                method: "POST",
                body: JSON.stringify({
                    inspection_report: report.id,
                    ...payload,
                }),
            });
            setResponses((prev) => ({
                ...prev,
                [payload.item_id]: {
                    ...(prev[payload.item_id] || {}),
                    review_status: payload.review_status,
                    review_rating: payload.review_rating,
                    review_remarks: payload.review_remarks,
                    critical_finding: payload.critical_finding,
                    rectification_required: payload.rectification_required,
                    target_date: payload.target_date,
                },
            }));
            
            success("Review saved");
        } catch (err:any) {
            console.error(err);
            error("Unable to save review");
        }
    };

    if (!template) {
        return (
            <DashboardLayout>
                <div className="p-10">Loading...</div>
            </DashboardLayout>
        );
    }

    const handleSaveReviewDraft = async () => {
        try {
            await apiRequest(
                `/inspection/review/${report.id}/save-draft/`,
                {
                    method: "POST",
                }
            );

            success("Review draft saved");
        } catch (err:any) {
            console.error(err);
            error("Unable to save review draft");
        }
    };

    const handlePreviewReview = async () => {
        try {
            const preview = await apiRequest(
                `/inspection/review/preview/${report.id}/`
            );

            setPreviewData(preview);

            setPreviewOpen(true);

        } catch (err:any) {
            console.error(err);
            error("Unable to preview report");
        }
    };

    const loadResponses = async (reportId: number) => {
    
        const data = await apiRequest(
            `/inspection/${reportId}/responses/`
        );
        // console.log("Responses API:", data);
        const map: Record<number, any> = {};

        data.forEach((r: any) => {
            map[r.item] = r;
        });

        // console.log("Response Map:", map);
        setResponses(map);
    };
    const handleSubmitReview = async () => {
        if (!report?.id) {
            error("Review has not been started.");
            return;
        }

        if (reviewedItems < totalItems) {
            error(
                `Please review all inspection items before submitting.\n\nReviewed ${reviewedItems} of ${totalItems}.`
            );
            return;
        }
        const ok = await confirm(
            "Submit Review?",
            "Are you sure you want to submit this review?\n\nOnce submitted, it can no longer be edited."
        );

        if (!ok) return;

        try {

            await apiRequest(
                "/inspection/review/submit/",
                {
                    method: "POST",
                    body: JSON.stringify({
                        inspection_report: report.id,
                    }),
                }
            );

            success("Review submitted");

            navigate("engineer-reviews");
            await loadResponses(report.id);
        } catch (err:any) {
            console.error(err);
            error("Unable to submit review");
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-100">

                <InspectionHeader
                    mode="review"
                    property={{
                        enquiryNumber: enquiry.enquiry_number,
                        propertyAddress: enquiry.propertyAddress,
                        propertyType: enquiry.propertyType,
                        clientName: enquiry.clientName,
                    }}
                    progress={progress}
                    completedItems={reviewedItems}
                    totalItems={totalItems}
                    onBack={() => navigate("engineer-reviews")}
                    onSaveDraft={handleSaveReviewDraft}
                    onPreview={handlePreviewReview}
                    onSubmit={handleSubmitReview}
                />
                 <ReviewPreview
                    open={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    preview={previewData}
                />
                <div className="flex h-[calc(100vh-180px)]">

                    <InspectionSidebar
                        floors={template.floors}
                        selectedFloor={selectedFloor}
                        selectedRoom={selectedRoom}
                        onSelectRoom={(floorId, roomId) => {
                            setSelectedFloor(floorId);
                            setSelectedRoom(roomId);
                        }}
                    />

                    <InspectionWorkspace
                        room={selectedRoomData}
                        inspectionReportId={report.inspection_id}
                        responses={responses}
                        mode="review"
                        onSaveItem={async () => {}}
                        onReviewSave={handleReviewSave}
                    />

                </div>

            </div>
        </DashboardLayout>
    );
};