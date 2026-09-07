import React from "react";
import {
    X,
    CheckCircle2,
    AlertTriangle,
    Camera,
    Video,
    ChevronDown,
    ChevronRight, Building2
} from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    template: any;
    responses: Record<number, any>;
}

export const InspectionPreviewModal: React.FC<Props> = ({
    open,
    onClose,
    template,
    responses,
}) => {
    if (!open) return null;
    const [openSections, setOpenSections] = React.useState<Record<number, boolean>>({});
    const [openItems, setOpenItems] = React.useState<Record<number, boolean>>({});
    const toggleSection = (sectionId: number) => {
        setOpenSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };
    const toggleItem = (itemId: number) => {
        setOpenItems((prev) => ({
            ...prev,
            [itemId]: !prev[itemId],
        }));
    };
    const getSeverityClass = (severity?: string) => {
        switch (severity) {
            case "critical":
                return "bg-red-100 text-red-700";
            case "high":
                return "bg-orange-100 text-orange-700";
            case "medium":
                return "bg-yellow-100 text-yellow-700";
            case "low":
                return "bg-green-100 text-green-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">

            <div className="bg-white w-[95%] max-w-7xl rounded-xl shadow-xl max-h-[92vh] overflow-hidden">

                {/* Header */}

                <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">

                    <h2 className="text-2xl font-bold">
                        Inspection Preview
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded hover:bg-gray-100"
                    >
                        <X size={24} />
                    </button>

                </div>

                <div className="overflow-y-auto p-6 max-h-[75vh]">

                    {template?.floors?.map((floor: any) => (

                        <div
                            key={floor.id}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-2 ">
                                <div className="w-12 h-12 rounded-xl bg-blue-200 text-blue-600 flex items-center justify-center">
                                    <Building2 size={20} />
                                </div>
                            <h2 className="text-xl font-bold  pb-0 text-blue-700">

                                {floor.name}

                            </h2>
                           </div> 
                            {floor.rooms?.map((room: any) => (

                                <div
                                    key={room.id}
                                    className="mt-6"
                                >

                                    <h3 className="text-xl font-semibold text-gray-800">

                                        {room.name}

                                    </h3>

                                    {room.sections?.map((section: any) => (

                                        <div
                                            key={section.id}
                                            className="mt-5 bg-gray-50 rounded-xl p-5 border border-gray-200"
                                        >

                                            <button
                                                type="button"
                                                onClick={() => toggleSection(section.id)}
                                                className="w-full flex items-center justify-between mb-0"
                                            >
                                                <h4 className="font-semibold text-md text-gray-700">
                                                        {section.name}
                                                    </h4>
                                        
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500">
                                                    {section.items.length} Item(s)
                                                </span>
                                                <span>
                                                    {openSections[section.id] ? (
                                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5 text-gray-500" />
                                                    )}

                                                    
                                                </span>
                                            </div>
                                            </button>
                                            {openSections[section.id] && (
                                            <div className="space-y-5 mt-4">

                                                {section.items?.map((item: any) => {

                                                    const response =
                                                        responses[item.id];

                                                    return (

                                                        <div
                                                            key={item.id}
                                                            className="bg-white border border-gray-200 rounded-lg p-4"
                                                        >

                                                            <div className="flex justify-between">

                                                                

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleItem(item.id)}
                                                                        className="w-full flex items-center justify-between"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            

                                                                            <CheckCircle2
                                                                                size={18}
                                                                                className={
                                                                                    response
                                                                                        ? "text-green-600"
                                                                                        : "text-gray-300"
                                                                                }
                                                                            />

                                                                            <span className="font-semibold">
                                                                                {item.name}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">

                                                    

                                                                        {response?.severity && (
                                                                            <span
                                                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityClass(
                                                                                    response.severity
                                                                                )}`}
                                                                            >
                                                                                {response.severity.toUpperCase()}
                                                                            </span>
                                                                        )}
                                                                        <div className="flex items-center gap-2">
                                                                                {openItems[item.id] ? (
                                                                                    <ChevronDown size={18} />
                                                                                ) : (
                                                                                    <ChevronRight size={18} />
                                                                                )}

                                                                                

                                                                                
                                                                            </div>
                                                                           </div>
                                                                    </button>

                                                                    {item.description && (

                                                                        <div className="text-sm text-gray-500 mt-1">

                                                                            {item.description}

                                                                        </div>

                                                                    )}

                                                            </div>

                                                            {openItems[item.id] && (
                                                            <>    
                                                            <div className="grid grid-cols-3 gap-4 mt-5">

                                                                <div>

                                                                    <div className="text-sm text-gray-500">

                                                                        Status

                                                                    </div>

                                                                    <div className="font-medium text-green-600 capitalize">

                                                                        {response?.status
                                                                            ?.replace(/_/g, " ")
                                                                            ?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || "-"}

                                                                    </div>

                                                                </div>

                                                                <div>

                                                                    <div className="font-medium">

                                                                        Severity

                                                                    </div>

                                                                    <div className="font-medium text-green-600 capitalize">

                                                                        {response?.severity
                                                                            ?.replace(/_/g, " ")
                                                                            ?.replace(/\b\w/g, (c: any) => c.toUpperCase()) || "-"}

                                                                    </div>

                                                                </div>                                                           

                                                                <div>

                                                                    <div className="text-sm text-gray-500">

                                                                        Observation

                                                                    </div>

                                                                    <div className="mt-1 whitespace-pre-wrap">

                                                                        {response?.observation || "-"}

                                                                    </div>

                                                                </div>

                                                                <div >

                                                                    <div className="text-sm text-gray-500">

                                                                        Rectification

                                                                    </div>

                                                                    <div className="mt-1 whitespace-pre-wrap">

                                                                        {response?.rectification || "-"}

                                                                    </div>

                                                                </div>

                                                                {response?.photos?.length > 0 && (

                                                                    <div>

                                                                        <div className="flex items-center gap-2 font-semibold mb-3">

                                                                            <Camera size={18} />

                                                                            Photos

                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-4">

                                                                            {response.photos.map(
                                                                                (
                                                                                    photo: { id: number; file: string },
                                                                                    index: number
                                                                                ) => (

                                                                                    <img
                                                                                        key={photo.id}
                                                                                        className="cursor-pointer rounded-lg border h-30 w-full object-cover"
                                                                                        src={`${import.meta.env.VITE_URL}${photo.file}`}
                                                                                        onClick={() => window.open(`${import.meta.env.VITE_URL}${photo.file}`, "_blank")}
                                                                                        alt=""
                                                                                        
                                                                                    />

                                                                                )
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                )}

                                                                {response?.videos?.length > 0 && (

                                                                    <div >

                                                                        <div className="flex items-center gap-2 font-semibold mb-3">

                                                                            <Video size={18} />

                                                                            Videos

                                                                        </div>

                                                                        <div className="grid grid-cols-1 gap-5">

                                                                            {response.videos.map(
                                                                                (
                                                                                    video: { id: number; file: string },
                                                                                    index: number
                                                                                ) => (

                                                                                    <video
                                                                                        key={video.id}
                                                                                        controls
                                                                                        className="rounded-lg border border-gray-200 w-full"
                                                                                    >
                                                                                        <source
                                                                                            src={`${import.meta.env.VITE_URL}${video.file}`}
                                                                                        />
                                                                                    </video>

                                                                                )
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                )}

                                                                {!response && (

                                                                    <div className="mt-5 flex items-center gap-2 text-red-600">

                                                                        <AlertTriangle size={18} />

                                                                        Inspection Pending

                                                                    </div>

                                                                )}

                                                            </div>
                                                            </>
)}
                                                     </div>
                                                    );
                                                })}

                                            </div>
                                            )}
                                        </div>

                                    ))}

                                </div>

                            ))}

                        </div>

                    ))}

                </div>

                <div className="border-t border-gray-200 p-4 flex justify-end">

                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
};