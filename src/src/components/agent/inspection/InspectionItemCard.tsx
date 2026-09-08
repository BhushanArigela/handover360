import React, { useState } from "react";
import {
    ChevronDown, AlertTriangle,
    ChevronUp,
    CheckCircle2,
    Circle,
} from "lucide-react";
import { InspectionItemForm } from "./InspectionItemForm";
import { InspectionReviewForm } from "./InspectionReviewForm";

interface Props {
    item: any;
    response?: any;
    onSave?: (payload: any) => void;
    mode?: "inspection" | "review";

    onReviewSave?: (payload: any) => void;
}

export const InspectionItemCard: React.FC<Props> = ({
    item,
    response,
    onSave,
    mode = "inspection",
    onReviewSave,
}) => {
    const [expanded, setExpanded] = useState(false);

    const completed = 
        mode === "review"
        ? !!(
            response?.review_status &&
            response?.review_rating
        )
        : !!response?.status;
        
console.log({
    item: item.name,
    response,
});
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Header */}

            <div className="flex justify-between items-center p-5">

                <div className="flex gap-3">

                    {completed ? (
                        <CheckCircle2
                            className="text-green-600 mt-1"
                            size={20}
                        />
                    ) : (
                        <Circle
                            className="text-gray-400 mt-1"
                            size={20}
                        />
                    )}

                    <div>

                        <h3 className="font-semibold text-md">
                            {item.name}
                        </h3>
                        
                        {response?.severity && (
                        <span
                            className={`px-2 py-1 rounded text-xs font-medium
                            ${
                                response.severity === "critical"
                                    ? "bg-red-100 text-red-700"
                                : response.severity === "high"
                                    ? "bg-orange-100 text-orange-700"
                                : response.severity === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                        >
                            {response.severity.toUpperCase()}
                        </span>
                    )}
                        {item.description && (
                            <p className="text-sm text-gray-500 mt-1">
                                {item.description}
                            </p>
                        )}

                        {item.score !== undefined && (
                            <div className="mt-2 inline-flex bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                Score : {item.score}
                            </div>
                        )}

                    </div>

                </div>

                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                    {expanded ? (
                        <>
                            Hide
                            <ChevronUp size={18} />
                        </>
                    ) : (
                        <>
                            {mode === "review" ? completed ? "Edit Review" : "Review Item" :completed ? "Edit Inspection" : "Start Inspection"}
                            <ChevronDown size={18} />
                        </>
                    )}
                </button>

            </div>

            {expanded && (
                mode === "inspection" ? (
                    <InspectionItemForm
                        item={item}
                        response={response}
                        onSave={async (payload) => {
                            try {
                                await onSave?.(payload);
                                setExpanded(false);
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                    />
                ) : (
                    <InspectionReviewForm
                        item={item}
                        response={response}
                        onSave={(payload) => {
                            onReviewSave?.(payload);
                            setExpanded(false);
                        }}
                    />
                )
            )}

        </div>
    );
};