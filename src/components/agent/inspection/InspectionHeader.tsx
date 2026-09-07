import {
    ArrowLeft,
    Save,
    Eye,
    Send,
    Home,
    User,
    Building2,
} from "lucide-react";

interface Props {
    property: {
        enquiryNumber: string;
        propertyAddress: string;
        propertyType: string;
        clientName: string;
    };

    progress: number;
    completedItems: number;
    totalItems: number;
    mode?: "inspection" | "review";
    onBack: () => void;

    onSaveDraft: () => void;

    onPreview: () => void;

    onSubmit: () => void;
}

export function InspectionHeader({
    property,
    progress,
    completedItems,
    totalItems,
    mode = "inspection",
    onBack,
    onSaveDraft,
    onPreview,
    onSubmit,
}: Props) {
    return (
        <div className="">

            <div className="bg-white border-b border-gray-200 px-6 py-4 mb-5 rounded-xl flex items-center justify-between">

                <div className="flex items-center gap-4">

                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>

                        <div className="text-xs text-gray-500">
                            {property.enquiryNumber}
                        </div>

                        <h1 className="text-xl font-bold">
                            {mode === "review"
                                ? "Technical Auditor Review"
                                : "Property Inspection"}
                        </h1>

                    </div>

                </div>

                <div className="flex gap-3">

                    <button
                        onClick={onSaveDraft}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200"
                    >
                        <Save size={18} />
                        {mode === "review"
                            ? "Save Review Draft"
                            : "Save Draft"}
                    </button>

                    <button
                        onClick={onPreview}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200"
                    >
                        <Eye size={18} />
                        {mode === "review"
                        ? "Review Preview"
                        : "Preview"}
                    </button>

                    <button
                        onClick={onSubmit}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white"
                    >
                        <Send size={18} />
                        {mode === "review"
                        ? "Submit Review"
                        : "Submit"}
                    </button>

                </div>

            </div>

            <div className="bg-white border-b w-full border-gray-200 px-5 py-5 mb-5 rounded-xl ">

                <div className="grid grid-cols-4 gap-5">

                    <div className="bg-orange-50 rounded-xl p-4">

                        <div className="flex items-center gap-2 ">
                            <div className="w-12 h-12 rounded-xl bg-orange-200 text-orange-600 flex items-center justify-center">
                                <Home size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-xl"> {property.propertyAddress}</h3>
                                <p className="text-sm text-gray-500">Property</p>
                            </div>
                        </div>



                    </div>

                    <div className="bg-red-50 rounded-xl p-4">

                        <div className="flex items-center gap-3 ">
                            <div className="w-12 h-12 rounded-xl bg-red-300 text-red-600 flex items-center justify-center">
                                <Building2 size={20} />
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-xl">{property.propertyType}</h3>
                                <p className="text-sm text-gray-500">Type</p>
                            </div>
                        </div>



                    </div>

                    <div className="bg-indigo-50 rounded-xl p-4">

                        <div className="flex items-center gap-2 ">
                            <div className="w-12 h-12 rounded-xl bg-indigo-300 text-indigo-600 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-xl">{property.clientName}</h3>
                                <p className="text-sm text-gray-500">Client</p>
                            </div>
                        </div>



                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">

                        <div className="flex justify-between">

                            <span className="text-gray-500">
                                Progress
                            </span>

                            <span className="font-semibold">

                                {completedItems}/{totalItems}

                            </span>

                        </div>

                        <div className="mt-3 h-2 rounded-full bg-gray-200">

                            <div
                                className="h-2 rounded-full bg-blue-600 transition-all"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />

                        </div>

                        <div className="text-right mt-2 text-sm font-semibold text-blue-600">

                            {progress}%

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}