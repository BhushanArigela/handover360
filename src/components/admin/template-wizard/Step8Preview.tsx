import React, { useEffect, useState } from "react";
import {
    Building2,
    Home,
    Layers3,
    ListChecks,
    ChevronDown,
    ChevronRight,
    List,
    CheckCircle2,
    Warehouse, 
} from "lucide-react";

import { publishTemplate, getStructure } from "../../../api/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import type { TemplateStructure, Template } from "./types";

interface Props {
    template: Template;
    onBack: () => void;
    onPublish: () => void;
}

export default function Step8Preview({
    template,
    onBack,
    onPublish,
}: Props) {

    const [structure, setStructure] =
        useState<TemplateStructure | null>(null);

    const [publishing, setPublishing] =
        useState(false);

    const [expanded, setExpanded] =
        useState<Record<string, boolean>>({});

    useEffect(() => {
        getStructure(template.id)
            .then((data) => {
                console.log("STRUCTURE", data);
                setStructure(data);
            })
            .catch(console.error);
    }, [template.id]);

    if (!structure) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    Loading Preview...
                </div>
            </DashboardLayout>
        );
    }

    const totalFloors = structure.floors.length;

    const totalRooms =
        structure.floors.reduce(
            (s, f) => s + f.rooms.length,
            0
        );

    const totalSections =
        structure.floors.reduce(
            (s, f) =>
                s +
                f.rooms.reduce(
                    (r, room) =>
                        r + room.sections.length,
                    0
                ),
            0
        );

    const totalItems =
        structure.floors.reduce(
            (s, f) =>
                s +
                f.rooms.reduce(
                    (r, room) =>
                        r +
                        room.sections.reduce(
                            (a, sec) =>
                                a + sec.items.length,
                            0
                        ),
                    0
                ),
            0
        );

    const toggle = (key: string) =>
        setExpanded(prev => ({
            ...prev,
            [key]: !prev[key],
        }));

    const handlePublish = async () => {

        setPublishing(true);

        try {

            await publishTemplate(
                template.id
            );

            onPublish();

        } finally {

            setPublishing(false);

        }

    };

    return (


            <div className="space-y-6">

                <div>

                    <h2 className="text-2xl font-bold">
                        Template Preview
                    </h2>

                    <p className="text-gray-500">
                        Review the complete inspection template before publishing.
                    </p>

                </div>

                {/* Template Information */}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

                    <h3 className="font-semibold text-lg mb-4">
                        Template Information
                    </h3>

                    <div className="grid grid-cols-2 gap-5">

                        <div>

                            <div className="text-gray-500 text-sm">
                                Template Name
                            </div>

                            <div className="font-medium">
                                {structure.name}
                            </div>

                        </div>

                        <div>

                            <div className="text-gray-500 text-sm">
                                Property Type
                            </div>

                            <div className="font-medium capitalize">
                              {structure.property_type
                        ?.split("_")
                        .map(
                        (word: string) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                                
                            </div>

                        </div>

                        <div className="col-span-2">

                            <div className="text-gray-500 text-sm">
                                Description
                            </div>

                            <div>
                                {structure.description || "-"}
                            </div>

                        </div>

                    </div>

                </div>

                {/* Statistics */}

                <div className="grid grid-cols-4 gap-5 ">

                    <StatCard
                        icon={<Building2 size={24} />}
                        title="Floors"
                        value={totalFloors}
                    />

                    <StatCard
                        icon={<Home size={24} />}
                        title="Rooms"
                        value={totalRooms}
                    />

                    <StatCard
                        icon={<Layers3 size={24} />}
                        title="Sections"
                        value={totalSections}
                    />

                    <StatCard
                        icon={<ListChecks size={24} />}
                        title="Items"
                        value={totalItems}
                    />

                </div>

                {/* Structure */}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

                    <div className="border-b border-gray-200 px-6 py-4 font-semibold">
                        Inspection Structure
                    </div>

                    <div className="p-6 space-y-5">


                        {structure.floors.map(floor => (

                            <div className="flex bg-gray-50 flex-col rounded-xl p-5 justify-start items-start gap-4" key={floor.id}>
                                <div className="flex items-center justify-between w-full gap-4">
                                    <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <Building2 size={22}/>
                                    </div>
                                    {floor.name}
                                </div>
                                <button
                                    onClick={() => toggle(`floor-${floor.id}`)}
                                    className="flex items-center gap-2 font-semibold"
                                >
                                    {expanded[`floor-${floor.id}`]
                                        ? <ChevronDown size={18} />
                                        : <ChevronRight size={18} />
                                    }


                                </button>
                                </div>
                                {expanded[`floor-${floor.id}`] && (

                                    <div className="bg-blue-50 w-full rounded-xl border border-blue-100 p-5 space-y-3">

                                        {floor.rooms.map(room => (

                                            <div className="flex rounded-xl p-0 justify-start items-start gap-4" key={room.id}>
                                                <div className="flex  flex-col w-full gap-4">
                                                    <div className="flex items-center justify-between w-full gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                                                                <Warehouse size={22}/>
                                                            </div>
                                                            <span className="font-medium">
                                                                {room.name}
                                                            </span>
                                                        </div>

                                                    <div>
                                                <button
                                                    onClick={() =>
                                                        toggle(`room-${room.id}`)
                                                    }
                                                    className="flex items-center gap-2 text-md"
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        {/* <span className="font-medium">
                                                            {room.name}
                                                        </span> */}

                                                        <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                                                            {room.sections.length} Section{room.sections.length !== 1 ? "s" : ""}
                                                        </span>
                                                    </div>
                                                    {expanded[`room-${room.id}`]
                                                        ? <ChevronDown size={16} />
                                                        : <ChevronRight size={16} />
                                                    }

                                                </button>
                                                </div>
                                                </div>
                                                {room.description && (
                                                    <div className="ml-6 mt-2 mb-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                                                        <div className="text-xs font-semibold text-gray-500 uppercase">
                                                            Description
                                                        </div>

                                                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                                            {room.description}
                                                        </div>
                                                    </div>
                                                )}    
                                                {expanded[`room-${room.id}`] && (

                                                    <div className="bg-white w-full rounded-xl border border-gray-200 p-5 space-y-3">

                                                        {room.sections.map((section) => (
                                                            <div className="p-3 border-b border-gray-100" key={section.id}>

                                                                <button
                                                                    onClick={() => toggle(`section-${section.id}`)}
                                                                    className="flex items-center justify-between gap-2 w-full text-left"
                                                                ><div className="font-medium text-blue-700 flex gap-2">
                                                                        <List size={22}/> {section.name}
                                                                    </div>
                                                                    <div className="font-medium flex gap-2">
                                                                         <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">
                                                                        {section.items.length} Item{section.items.length !== 1 ? "s" : ""}
                                                                    </span>
                                                                    {expanded[`section-${section.id}`] ? (
                                                                        <ChevronDown size={14} />
                                                                    ) : (
                                                                        <ChevronRight size={14} />
                                                                    )}

                                                                    {/* <span className="font-medium">
                                                                        {section.name}
                                                                    </span>

                                                                    <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">
                                                                        {section.items.length} Item{section.items.length !== 1 ? "s" : ""}
                                                                    </span> */}
                                                                    </div>
                                                                </button>

                                                                {expanded[`section-${section.id}`] && (

                                                                    <div className="ml-8 mt-2 space-y-1">

                                                                        {section.items.length === 0 ? (
                                                                            <div className="text-sm text-gray-400 italic">
                                                                                No inspection items
                                                                            </div>
                                                                        ) : (
                                                                            section.items.map((item) => (
                                                                                <div
                                                                                    key={item.id}
                                                                                    className="flex items-center gap-2 text-gray-700"
                                                                                >
                                                                                    <CheckCircle2
                                                                                        size={14}
                                                                                        className="text-emerald-600"
                                                                                    />

                                                                                    <span>{item.name}</span>
                                                                                </div>
                                                                            ))
                                                                        )}

                                                                    </div>

                                                                )}

                                                            </div>
                                                        ))}

                                                    </div>

                                                )}

                                            </div></div>

                                        ))}

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                </div>

                <div className="flex justify-between">

                    <button
                        onClick={onBack}
                        className="px-5 py-2 border border-gray-100 bg-red-500 text-white rounded-lg hover:bg-red-300"
                    >
                        ← Previous
                    </button>

                    <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="bg-emerald-600 text-white rounded-lg px-8 py-2"
                    >
                        {publishing
                            ? "Publishing..."
                            : "Publish Template"}
                    </button>

                </div>

            </div>


    );

}

function StatCard({
    icon,
    title,
    value,
}: {
    icon: React.ReactNode;
    title: string;
    value: number;
}) {
    return (

        <div className="bg-white rounded-xl  shadow-sm p-5">

            <div className="flex justify-between items-center">

                <div>

                    <div className="text-gray-500 text-sm">
                        {title}
                    </div>

                    <div className="text-3xl font-bold">
                        {value}
                    </div>

                </div>

                <div className="text-emerald-600">
                    {icon}
                </div>

            </div>

        </div>

    );
}