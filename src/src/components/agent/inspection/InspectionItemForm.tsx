import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiRequest } from "../../../api/api";
import { BASE_URL } from '../../../config/env';

import {
    Camera,
    Video,
    Save,

} from "lucide-react";

interface Props {
    item: any;
    response?: any;
    onSave: (payload: any) => void;
}

export const InspectionItemForm: React.FC<Props> = ({
    item,
    response,
    onSave,
}) => {
    
    const [status, setStatus] = useState(response?.status || "");
    const [severity, setSeverity] = useState(response?.severity || "");
    const [observation, setObservation] = useState(
        response?.observation || ""
    );
    const [rectification, setRectification] = useState(
        response?.rectification || ""
    );

    const [photos, setPhotos] = useState<File[]>([]);
    const [videos, setVideos] = useState<File[]>([]);

    // Already uploaded on server
    const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);
    const [uploadedVideos, setUploadedVideos] = useState<any[]>([]);

    useEffect(() => {
        setPhotos([]);
        setVideos([]);

        setUploadedPhotos(response?.photos || []);
        setUploadedVideos(response?.videos || []);

        setStatus(response?.status ?? "");
        setSeverity(response?.severity ?? "");
        setObservation(response?.observation ?? "");
        setRectification(response?.rectification ?? "");
    }, [response]);
    const handlePhotoUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        if (!e.target.files) return;

        setPhotos([
            ...photos,
            ...Array.from(e.target.files),
        ]);

    };

    const handleVideoUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        if (!e.target.files) return;

        setVideos([
            ...videos,
            ...Array.from(e.target.files),
        ]);

    };

    const handleSave = async () => {
        
        try {
        await onSave({
            item_id: item.id,
            status,
            severity,
            observation,
            rectification,
            photos,
            videos,
        });

        // Optional success message
        toast.success("Item saved successfully");

        } catch (err) {
            console.error(err);
        }

    };

    const deletePhoto = async (id:number) => {

        await apiRequest(
            `/inspection/media/${id}/`,
            {
                method:"DELETE"
            }
        );

        setUploadedPhotos(prev =>
            prev.filter(p => p.id !== id)
        );

        toast.success("Photo deleted");
    };

    const deleteVideo = async (id:number) => {

        await apiRequest(
            `/inspection/media/${id}/`,
            {
                method:"DELETE"
            }
        );

        setUploadedVideos(prev =>
            prev.filter(v => v.id !== id)
        );

        toast.success("Video deleted");
    };

    return (

        <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6">

            {/* Status */}

            <div>

                <label className="font-medium">
                    Inspection Status
                </label>

                <select
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value)
                    }
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 mt-2"
                >

                    <option value="">
                        Select Status
                    </option>

                    <option value="good">
                        Good
                    </option>

                    <option value="minor_issue">
                        Minor Issue
                    </option>

                    <option value="major_issue">
                        Major Issue
                    </option>

                    <option value="not_applicable">
                        Not Applicable
                    </option>

                </select>

            </div>

            {/* Severity */}

            <div>

                <label className="font-medium">
                    Severity
                </label>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">

                    {[
                        { label: "Low", value: "low" },
                        { label: "Medium", value: "medium" },
                        { label: "High", value: "high" },
                        { label: "Critical", value: "critical" },
                    ].map((level) => (

                        <button
                            key={level.value}
                            type="button"
                            onClick={() => setSeverity(level.value)}
                            className={`border bg-blue-200  border-gray-200 rounded-lg py-3 ${
                                severity === level.value
                                    ? "bg-orange-600 text-white"
                                    : ""
                            }`}
                        >
                            {level.label}
                        </button>

                    ))}

                </div>

            </div>

            {/* Observation */}

            <div>

                <label className="font-medium">
                    Observation
                </label>

                <textarea
                    rows={4}
                    value={observation}
                    onChange={(e) =>
                        setObservation(e.target.value)
                    }
                    className="w-full bg-white border border-gray-200 rounded-lg mt-2 p-3"
                />

            </div>

            {/* Rectification */}

            <div>

                <label className="font-medium">
                    Rectification Required
                </label>

                <textarea
                    rows={3}
                    value={rectification}
                    onChange={(e) =>
                        setRectification(e.target.value)
                    }
                    className="w-full bg-white border border-gray-200 rounded-lg mt-2 p-3"
                />

            </div>

            {/* Uploads */}

            <div className="grid md:grid-cols-2 gap-5">

                <div>

                    <label className="flex items-center gap-2 font-medium">

                        <Camera size={18} />

                        Photos

                    </label>

                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="w-full bg-white border border-gray-200 rounded-lg p-3 mt-2"
                        onChange={handlePhotoUpload}
                    />
                    {uploadedPhotos.length > 0 && (
                        
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {uploadedPhotos.map((photo:any) => (
                                
                                <div
                                    key={photo.id}
                                    className="relative group"
                                > 
                                    <img
                                        src={`${BASE_URL}${photo.file}`}
                                        alt=""
                                        className="w-full h-28 object-cover rounded-lg border-gray-300 border"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => deletePhoto(photo.id)}
                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                </div>

                <div>

                    <label className="flex items-center gap-2 font-medium">

                        <Video size={18} />

                        Videos

                    </label>

                    <input
                        type="file"
                        multiple
                        accept="video/*"
                        className="w-full bg-white border border-gray-200 rounded-lg p-3 mt-2"
                        onChange={handleVideoUpload}
                    />
                    {uploadedVideos.length > 0 && (
                        <div className="space-y-3 mt-4">
                            {uploadedVideos.map((video:any) => (
                                <div
                                    key={video.id}
                                    className="relative border border-gray-300 rounded-lg p-2"
                                >
                                    <video
                                        controls
                                        className="w-full rounded"
                                    >
                                        <source
                                            src={`${BASE_URL}${video.file}`}
                                        />
                                    </video>

                                    <button
                                        type="button"
                                        onClick={() => deleteVideo(video.id)}
                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Score */}

            {/* <div className="flex justify-between items-center bg-blue-50 rounded-lg border p-4">

                <div className="flex items-center gap-2">

                    <AlertTriangle
                        size={18}
                        className="text-blue-600"
                    />

                    Inspection Score

                </div>

                <div className="font-bold text-xl">

                    {item.score ?? 0}

                </div>

            </div> */}

            {/* Footer */}

            <div className="flex justify-end">

                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-600 text-white rounded-lg px-6 py-3 hover:bg-green-700"
                >

                    <Save size={18} />

                    Save Item

                </button>

            </div>

        </div>

    );

};