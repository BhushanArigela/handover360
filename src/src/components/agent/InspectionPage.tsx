import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { InspectionHeader } from "./inspection/InspectionHeader";
import { InspectionSidebar } from "./inspection/InspectionSidebar";
import { InspectionWorkspace } from "./inspection/InspectionWorkspace";
import { InspectionPreviewModal  } from "./inspection/InspectionPreviewModal";
import { apiRequest } from "../../api/api";
import { DashboardLayout } from '../layout/DashboardLayout';
// import { toast } from "react-toastify";
import { error, success, confirm  } from "../../utils/toast";

export const InspectionPage: React.FC = () => {
    const { navigate, pageParams } = useApp();
    const enquiry = pageParams?.enquiry;
    const [loading, setLoading] = useState(true);
    const [template, setTemplate] = useState<any>(null);
    const [selectedFloor, setSelectedFloor] =  useState<number | null>(null);
    const [inspectionReportId, setInspectionReportId] = useState<number | null>(null);
    const [responses, setResponses] = useState<Record<number, any>>({});
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
    
    const templateId = enquiry?.template_id;

    const startInspection = async () => {
         console.log("startInspection() called");

        try {
            const result = await apiRequest(
                "/inspection/start/",
                {
                    method: "POST",
                    body: JSON.stringify({
                        enquiry_id: enquiry.enquiry_id,
                        template_id: enquiry.template_id,
                    }),
                }
            );
            console.log("FULL RESPONSE:", result);
            console.log("inspection_id:", result?.inspection_id);

            setInspectionReportId(result?.inspection_id ?? null);
            return result.inspection_id;
        } catch (err) {
            console.error("Unable to start inspection", err);
        }
    };

    const loadTemplate = async () => {
        try {
            const data = await apiRequest(
                `/masters/templates/${templateId}/structure/`
            );

            console.log("Template Structure", data);

            setTemplate(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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

    useEffect(() => {


        if (!templateId || !enquiry?.template_id) {
            console.log("Returned from useEffect");
            return;
        }

        console.log("Calling initializeInspection");

        const initializeInspection = async () => {

            console.log("Inside initializeInspection");

            const reportId = await startInspection();
            await loadTemplate();
            await loadResponses(reportId);
        };

        initializeInspection();

    }, [enquiry]);

    useEffect(() => {

        if (!template?.floors?.length) return;

        const floor = template.floors[0];

        if (floor.rooms.length > 0) {

            setSelectedFloor(floor.id);

            setSelectedRoom(floor.rooms[0].id);

        }

    }, [template]);
    
    

    const selectedRoomData =
    template?.floors
        ?.flatMap((floor: any) => floor.rooms)
        ?.find((room: any) => room.id === selectedRoom);


    if (loading) {
        return (
            <div className="p-10 text-center">
                Loading inspection...
            </div>
        );
    }

    if (!template) {
        return (
            <div className="p-10 text-center text-red-500">
                Unable to load inspection template.
            </div>
        );
    }

    // Calculate progress
    const totalItems =
        template.floors?.reduce(
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

    const completedItems = Object.values(responses).filter(
        (r: any) => r?.status
    ).length;

    const handleSaveItem = async (payload: any) => {

        // console.log(payload);

        const formData = new FormData();

        formData.append(
            "inspection_report",
            payload.inspection_report
        );

        formData.append(
            "item",
            payload.item_id
        );

        formData.append(
            "status",
            payload.status
        );

        formData.append(
            "severity",
            payload.severity
        );

        formData.append(
            "observation",
            payload.observation
        );

        formData.append(
            "rectification",
            payload.rectification
        );

        payload.photos.forEach((file: File) => {
            formData.append("photos", file);
        });

        payload.videos.forEach((file: File) => {
            formData.append("videos", file);
        });

        await apiRequest(
            "/inspection/item/save/",
            {
                method: "POST",
                body: formData,
            }
        );
        
        // Immediately update local state
        setResponses((prev) => ({
            ...prev,
            [payload.item_id]: {
                ...(prev[payload.item_id] || {}),
                item: payload.item_id,
                status: payload.status,
                severity: payload.severity,
                observation: payload.observation,
                rectification: payload.rectification,
                photos: prev[payload.item_id]?.photos || [],
                videos: prev[payload.item_id]?.videos || [],
            },
        }));
        if (inspectionReportId) {
            await loadResponses(inspectionReportId);
        }

    };    
    const progress =
        totalItems > 0
            ? Math.round((completedItems / totalItems) * 100)
            : 0;
    
    const saveDraft = async () => {

       if (!inspectionReportId) {
        error("Inspection not started.");
        return;
    }

        try {

            await apiRequest(
                `/inspection/${inspectionReportId}/save-draft/`,
                {
                    method: "POST",
                }
            );

            success("Draft saved successfully.");

        } catch (err) {

            console.error(err);

            error("Unable to save draft.");

        }
    };
    const handlePreview = async () =>{
        if (!inspectionReportId) {
            error("Inspection has not been started.");
            return;
        }

        // Refresh latest responses before preview
        await loadResponses(inspectionReportId);

        setPreviewOpen(true);
    };
    const handleSubmit = async () => {

        if (!inspectionReportId) {
            error("Inspection has not been started.");
            return;
        }

        if (completedItems < totalItems) {

            error(
                `Please complete all inspection items before submitting.\n\nCompleted ${completedItems} of ${totalItems}.`
            );

            return;
        }

        const ok = await confirm(
            "Submit Review?",
            "Are you sure you want to submit this inspection?\n\nOnce submitted, it can no longer be edited."
        );

        if (!ok) return;

        try {

            await apiRequest(
                `/inspection/${inspectionReportId}/submit/`,
                {
                    method: "POST",
                }
            );

            success("Inspection submitted successfully.");

            navigate("agent-dashboard");

        } catch (error:any) {

            console.error(error);

            error("Unable to submit inspection.");

        }
    };
    return (
        <DashboardLayout>
        <div className="min-h-screen bg-gray-100">

            <InspectionHeader
                mode="inspection"
                property={{
                    enquiryNumber: enquiry?.enquiry_number || "",
                    propertyAddress: enquiry?.propertyAddress || "",
                    propertyType: enquiry?.propertyType || "",
                    clientName: enquiry?.clientName || "",
                }}
                progress={progress}
                completedItems={completedItems}
                totalItems={totalItems}
                onBack={() => navigate("agent-dashboard")}
                onSaveDraft={saveDraft}
                onPreview={handlePreview}
                onSubmit={handleSubmit}
            />
            <InspectionPreviewModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                template={template}
                responses={responses}
            />
            <div className="flex bg-white p-5 rounded-xl h-[calc(100vh-180px)]">

                <InspectionSidebar
                    floors={template.floors}
                    selectedFloor={selectedFloor}
                    selectedRoom={selectedRoom}
                    onSelectRoom={(floorId, roomId) => {

                        setSelectedFloor(floorId);

                        setSelectedRoom(roomId);

                    }}
                />

               {inspectionReportId && (
                    <InspectionWorkspace
                        room={selectedRoomData}
                        inspectionReportId={inspectionReportId}
                        responses={responses}
                        onSaveItem={handleSaveItem}
                    />
                )}

            </div>
            
            
            {/* <div className="p-6">

                <h2 className="text-xl font-bold mb-4">
                    {template.name}
                </h2>

                <pre className="bg-white rounded-lg p-4 overflow-auto text-sm">
                    {JSON.stringify(template, null, 2)}
                </pre>

            </div> */}

        </div>
        </DashboardLayout>
    );
};