import React from "react";
import { InspectionItemCard } from "./InspectionItemCard";

interface Props {
    room: any;
    inspectionReportId: number;
    responses: Record<number, any>;
    onSaveItem: (payload: any) => Promise<void>;
    mode?: "inspection" | "review";
    onReviewSave?: (payload: any) => Promise<void>;
}

export const InspectionWorkspace: React.FC<Props> = ({
    room,
    inspectionReportId,
     responses,
    onSaveItem,
    mode = "inspection",
    onReviewSave,
}) => {

    if (!room) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Select a room
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto bg-gray-100 p-6">

            <div className="mb-6">

                <h1 className="text-2xl font-bold">
                    {room.name}
                </h1>

                {room.description && (
                    <p className="text-gray-500 mt-1">
                        {room.description}
                    </p>
                )}

            </div>

            <div className="space-y-8">

                {room.sections.map((section: any) => (

                    <div
                        key={section.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200"
                    >

                        <div className="px-5 py-4 border-b border-gray-200">

                            <h2 className="font-semibold text-md">
                                {section.name}
                            </h2>

                        </div>

                        <div className="p-5 grid lg:grid-cols-1 gap-5">
                            {section.items.map((item: any) => {

                                console.log("Workspace Item:", item);

                                return (
                                    <InspectionItemCard
                                        key={item.id}
                                        item={item}
                                        response={responses[item.id]}
                                        mode = {mode}
                                        onSave={async (payload) => {
                                            await onSaveItem({
                                                inspection_report: inspectionReportId,
                                                ...payload,
                                            });
                                        }}
                                        onReviewSave={onReviewSave}
                                    />
                                );
                            })}
                            {/* {section.items.map((item: any) => (
                                
                                <InspectionItemCard
                                    key={item.id}
                                    item={item}
                                    response={responses[item.id]}
                                    onSave={async (payload) => {
                                        await onSaveItem({
                                            inspection_report: inspectionReportId,
                                            ...payload,
                                        });
                                    }}
                                />

                            ))} */}

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
};