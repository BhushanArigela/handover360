import React, { useEffect, useState } from "react";
import { Search, Eye, Pencil, Copy, Trash2, Rocket,Building2, X } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { listTemplates, deleteTemplate, publishTemplate, unpublishTemplate, getStructure, duplicateTemplate } from "../../../api/api";
import { useApp } from "../../../context/AppContext";
import { success, error, confirm } from "../../../utils/toast";



export default function TemplateList() {

  const { navigate, } = useApp();

  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const data = await listTemplates();
    setTemplates(data);
  };

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
        const ok = await confirm(
              "Delete Template?",
              "This will permanently delete the template along with all its sections and items."
          );
    
          if (!ok) return;

    try {

        await deleteTemplate(id);

        setTemplates((prev) =>
            prev.filter((template) => template.id !== id)
        );

    } catch (err: any) {

        console.error(err);
        error(err || "Unable to delete template.");
    }

};

const handlePreview = async (id: number) => {
    try {
        const data = await getStructure(id);

        setPreviewTemplate(data);
        setShowPreview(true);

    } catch (err) {
        console.error(err);
    }
};

const handlePublish = async (id: number) => {
    try {
        const updated = await publishTemplate(id);

        setTemplates((prev) =>
            prev.map((template) =>
                template.id === id ? updated : template
            )
        );
        success("Template published successfully.");
    } catch (err: any) {
        console.error(err);
        error(
            err.detail ||
            err.message ||
            "Failed to publish template."
        );
    }
};

const handleUnpublish = async (id: number) => {
    try {
        const updated = await unpublishTemplate(id);

        setTemplates((prev) =>
            prev.map((template) =>
                template.id === id ? updated : template
            )
        );
        success("Template unpublished successfully.");
    } catch (err: any) {
        console.error(err);
        error(
            err.detail ||
            err.message ||
            "Failed to unpublish template."
        );
    }
};

const handleEdit = async (id: number) => {
    try {
        const data = await getStructure(id);

        navigate("admin-template-wizard", {
            template: data,
            editMode: true,
        });

    } catch (err) {
        console.error(err);
        error("Unable to load template.");
    }
};

const handleCopy = async (id: number) => {
    try {
       const data = await duplicateTemplate(id);

        success("Template copied successfully.");

        loadTemplates();
    } catch (err: any) {
        error(
            err.detail ||
            "Unable to duplicate template."
        );
    }
};

  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div className="flex justify-between items-center">

          <div>

            <h1 className="text-3xl font-bold">
              Inspection Templates
            </h1>

            <p className="text-gray-500">
              Create and manage inspection templates
            </p>

          </div>

          <button
            onClick={() => navigate("admin-template-wizard")}
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg"
          >
            + Create Template
          </button>

        </div>

        <div className="bg-white rounded-xl  p-5">

          <div className="flex gap-4 mb-5">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                placeholder="Search template..."
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2"
              />

            </div>

          </div>

          <table className="w-full text-sm">

            <thead>

              <tr className="border-b border-gray-100 bg-gray-50">

                <th className="py-3">Template</th>

                <th>Property</th>

                <th>Floors</th>

                <th>Rooms</th>

                <th>Status</th>

                <th className="text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {filtered.map((t) => (

                <tr
                  key={t.id}
                  className="hover:bg-gray-50"
                >

                  <td className="p-4 font-mono text-xs">

                    <div className="font-semibold">
                      {t.name}
                    </div>

                    <div className="text-sm text-gray-500">
                      {t.description}
                    </div>

                  </td>

                  <td className="p-4">
                    {t.property_type
                        ?.split("_")
                        .map(
                        (word: string) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                  </td>

                  <td className="p-4">
                    {t.floor_count}
                  </td>

                  <td className="p-4">
                    {t.room_count}
                  </td>

                  <td className="p-4">

                    {t.published ? (

                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">

                        Published

                      </span>

                    ) : (

                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">

                        Draft

                      </span>

                    )}

                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-3">

                      <button
                        title="Preview"
                        onClick={() => handlePreview(t.id)}
                        className="text-blue-600 cursor-pointer hover:text-blue-800"
                    >
                        <Eye size={18}/>
                    </button>

                      <button
                          title="Edit"
                          onClick={() => handleEdit(t.id)}
                          className="text-emerald-600 cursor-pointer hover:text-emerald-800"
                      >
                          <Pencil size={18} />
                      </button>

                      <button 
                      title="Duplicate"
                      onClick={() => handleCopy(t.id)}
                       className="text-indigo-600 cursor-pointer hover:text-indigo-800"
                      >
                        <Copy size={18}/>
                      </button>

                      {!t.published ? (
                        <button
                            title="Publish"
                            onClick={() => handlePublish(t.id)}
                        >
                            <Rocket size={18} />
                        </button>
                    ) : (
                        <button
                            title="Unpublish"
                            onClick={() => handleUnpublish(t.id)}
                        >
                            📤
                        </button>
                    )}

                      <button
                        title="Delete"
                        className="text-red-500 cursor-pointer hover:text-red-700"
                        onClick={() => handleDelete(t.id)}
                      >
                        <Trash2 size={18}/>
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
      {
showPreview && previewTemplate && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl shadow-xl w-[900px] max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center border-b border-gray-200 p-5">

            <div>

                <h2 className="text-xl font-bold">
                    {previewTemplate.name}
                </h2>

                <div className="text-sm text-gray-500">
                    {previewTemplate.property_type
                        ?.split("_")
                        .map(
                        (word: string) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    
                </div>

            </div>

            <button
                onClick={() => setShowPreview(false)}
            >
                <X size={22}/>
            </button>

        </div>

        <div className="p-6 space-y-6 overflow-hidden">

            {previewTemplate.floors.map((floor:any)=>(

                <div
                    key={floor.id}
                    className="border bg-gray-50 border-gray-200 rounded-2xl p-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Building2 size={22}/>
                        </div>
                        <h3 className="font-bold text-lg m-0">
                            {floor.name}
                        </h3>
                    </div>
                    {floor.rooms.map((room:any)=>(

                        <div className="relative pl-16 py-3"
                            key={room.id}
                        >
                            {/* Main Vertical Line */}
                            <div className="absolute left-7 top-0 bottom-0 w-px border-l-2 border-dashed border-indigo-200"></div>
                                <div className="relative mb-0">
                                    <div className="absolute left-[-35px] top-5 w-8 border-t-2 border-dashed border-indigo-200"></div>

                                    <div className="absolute left-[-39px] top-3 w-3 h-3 rounded-full border-2 border-indigo-500 bg-white"></div>

                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-md bg-green-100 text-green-600 flex items-center justify-center">
                                        <Building2 size={18}/>
                                    </div>
                                    <div className="font-semibold text-emerald-700">
                                        {room.name}
                                    </div>
                                </div>
                            </div>
                            {room.sections.map((section:any)=>(

                                <div
                                    key={section.id}
                                    className="relative ml-5 pl-0 pt-7"
                                >   <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dashed border-indigo-200"></div>

                                    <div className="relative mb-0 pl-7">

                                      <div className="absolute left-[-1px] top-5 w-8 border-t-2 border-dashed border-indigo-200"></div>

                                      <div className="absolute left-[-6px] top-3 w-3 h-3 rounded-full border-2 border-indigo-500 bg-white"></div>
                                      <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Building2 size={16}/>
                                        </div>
                                        <div className="font-medium">
                                             {section.name}
                                        </div>
                                    </div>
                                    <ul className="ml-6 list-disc text-gray-600 mt-1">

                                        {section.items.map((item:any)=>(

                                            <li key={item.id}>
                                                {item.name}
                                            </li>

                                        ))}

                                    </ul>
                                </div>
                                </div>

                            ))}

                        </div>

                    ))}

                </div>

            ))}

        </div>

    </div>

</div>

)}        
    </DashboardLayout>
    
  );
  
}