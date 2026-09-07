import React, { useEffect,useState } from "react";
import { createTemplate, updateTemplate, } from "../../../api/api";
import type { Template } from "./types";
import { success, error } from "../../../utils/toast";

interface Step1CreateTemplateProps {
    template?: Template | null;
    onCreated: (template: Template) => void;
    onNext: () => void;
    onCancel: () => void;    
}

const Step1CreateTemplate: React.FC<Step1CreateTemplateProps> = ({
    template,
    onCreated,
    onNext,
    onCancel,
}) => {
    
    const [name, setName] = useState("");
    const [propertyType, setPropertyType] = useState("");
    const [description, setDescription] = useState("");

    const [saving, setSaving] = useState(false);
    
    useEffect(() => {
        if (template) {
            setName(template.name || "");
            setPropertyType(template.property_type || "");
            setDescription(template.description || "");
        } else {
            setName("Inspection - Standard");
            setPropertyType("");
            setDescription("Standard inspection template with all common areas");
        }
    }, [template]);
    
  async function handleNext(): Promise<void> {

    
    if (!name.trim()) {
      error("Template name is required.");
      return;
    } 
    if (!propertyType.trim()) {
      error("Property type is required.");
      return;
    }

    setSaving(true);

    try {

        const payload = {
            name,
            property_type: propertyType,
            description,
        };

        let tmpl;

        if (template?.id) {

            tmpl = await updateTemplate(template.id, payload);

            success("Template updated successfully.");

        } else {

            tmpl = await createTemplate(payload);

            success("Template created successfully.");

        }

        onCreated(tmpl);

        onNext();

    } catch {

        error("Could not save template.");

    } finally {

        setSaving(false);

    }
  }


  return (
    // <DashboardLayout>
    <div className="space-y-6">

        {/* Header */}

        <div>
            <h2 className="text-2xl font-bold text-gray-900">
                Step 1 -Build Template 
            </h2>

            <p className="text-sm text-gray-500 mt-1">
                Create a new inspection template before adding
                floors, rooms, sections and inspection items.
            </p>
        </div>

        {/* Stepper */}

        <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                1
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                2
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                3
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                4
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                5
            </div>
            <div className="h-1 flex-1 bg-gray-200 rounded" />
            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                6
            </div>

        </div>

        {/* Card */}

        <div className="bg-white rounded-2xl border-gray-200 p-6">

            <h3 className="font-semibold text-lg mb-6">
                Basic Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                        Template Name *
                    </label>

                    <input
                        className="w-full border border-gray-300 p-3 rounded-xl"
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Property Type *
                    </label>

                    <select
                        className="w-full border border-gray-300 p-3 rounded-xl"
                        value={propertyType}
                        onChange={(e)=>setPropertyType(e.target.value)}
                    >
                    <option value="">Select Property Type</option>
                    <option value="residential_apartment">Residential Apartment</option>
                    <option value="independent_villa">Independent Villa</option>
                    <option value="independent_house">Independent House</option>
                    <option value="row_house">Row House</option>
                    <option value="commercial_building">Commercial Building</option>
                    <option value="industrial_structure">Industrial Structure</option>
                    <option value="other">Other</option>   
                    </select>
                </div>

                {/* <div>
                    <label className="block text-sm font-medium mb-2">
                        Created By
                    </label>

                    <input
                        className="w-full border rounded-xl px-4 py-3 bg-gray-100"
                        value="Admin User"
                        disabled
                    />
                </div> */}

                <div className="md:col-span-2">

                    <label className="block text-sm font-medium mb-2">
                        Description
                    </label>

                    <textarea
                        rows={4}
                        className="w-full border border-gray-300 p-3 rounded-xl"
                        value={description}
                        onChange={(e)=>setDescription(e.target.value)}
                    />

                </div>

            </div>

            

            <div className="flex justify-end gap-3 mt-8">

                <button onClick={onCancel}
                            className="px-5 py-2.5 border border-gray-200 text-white rounded-xl bg-red-500 hover:bg-red-300">
                    Cancel
                </button>

                <button
                    onClick={handleNext}
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500"
                >
                    {saving
                        ? "Saving..."
                        : "Save & Continue"}
                </button>

            </div>

        </div>

    </div>
);
};

export default Step1CreateTemplate;