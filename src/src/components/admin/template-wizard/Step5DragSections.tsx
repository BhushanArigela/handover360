import React, { useEffect, useState } from "react";
import { Plus, } from "lucide-react";
import {  getSectionLibrary, addSectionToRoom, deleteSection, addSectionToLibrary, listSectionsForRoom } from "../../../api/api";
import type { Room, Section, SectionLibrary } from "./types";
import {  error } from "../../../utils/toast";

interface Step5DragSectionsProps {
    rooms: Room[];
    sectionsByRoom: Record<number, Section[]>;
    setSectionsByRoom: React.Dispatch<
        React.SetStateAction<Record<number, Section[]>>
    >;
    onBack: () => void;
    onNext: () => void;
}

const Step5DragSections: React.FC<Step5DragSectionsProps> = ({
  rooms,
  sectionsByRoom,
  setSectionsByRoom,
  onBack,
  onNext,
}) => {
  
  const [library, setLibrary] = useState<SectionLibrary[]>([]);
  const [search, setSearch] = useState<string>("");
  const [customSectionName, setCustomSectionName] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  useEffect(() => {

    if (!rooms.length) return;

    if (
        selectedRoomId === null ||
        !rooms.some(r => r.id === selectedRoomId)
    ) {
        setSelectedRoomId(rooms[0].id);
    }

}, [rooms]);

useEffect(() => {

    if (
        selectedRoomId === null ||
        sectionsByRoom[selectedRoomId]
    ) {
        return;
    }

    listSectionsForRoom(selectedRoomId).then((sections) => {

        setSectionsByRoom(prev => ({
            ...prev,
            [selectedRoomId]: sections,
        }));

    });

}, [selectedRoomId]);

  useEffect(() => {
    getSectionLibrary()
      .then(setLibrary)
      .catch(console.error);
  }, []);
 
  const addCustomSection = async () => {
    const name = customSectionName.trim();

    if (!name) return;

    const normalized = name.trim().toLowerCase();

    if (
        library.some(
            s => s.name.trim().toLowerCase() === normalized
        )
    ) {
        error("Section already exists in the master.");
        return;
    }

    await addSectionToLibrary(name);

    await getSectionLibrary().then(setLibrary);

    setCustomSectionName("");
};
 

  const assignSection = async (
    roomId: number,
    sectionName: string
) : Promise<void> => {

    const existing = sectionsByRoom[roomId] || [];

    const normalized = sectionName.trim().toLowerCase();

    if (
        existing.some(
            s => s.name.trim().toLowerCase() === normalized
        )
    ) {
        error("Section already exists in this room.");
        return;
    }

    try {
        const created = await addSectionToRoom(roomId, {
            name: sectionName,
            order: existing.length,
        });

            setSectionsByRoom(prev => ({
                ...prev,
                [roomId]: [
                    ...(prev[roomId] || []),
                    created,
                ],
            }));
        } catch (err: any) {
            error(err.detail || "Section already exists in this room.");
        }
    };

  const removeSection = async (
        roomId: number,
        sectionId: number
    ): Promise<void> => {

        await deleteSection(sectionId);

        setSectionsByRoom(prev => ({

            ...prev,

            [roomId]: (prev[roomId] || []).filter(
                section => section.id !== sectionId
            )

        }));

    };

 const filtered = library.filter((section) =>
  section.name.toLowerCase().includes(search.toLowerCase())
);
const totalAssigned = Object.values(
    sectionsByRoom
).reduce(
    (sum, sections) => sum + sections.length,
    0
);
  return (
    
      <div className="space-y-6">

    {/* Header */}
    <div>
      <h2 className="text-2xl font-bold">
        Step 5 - Configure Sections
      </h2>

      <p className="text-gray-500 mt-1">
        Assign inspection sections to each room.
      </p>
    </div>
    {/* Stepper */}

        <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-emerald-200 text-gray-500  flex items-center justify-center ">
                1
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-emerald-200 text-gray-500 flex items-center justify-center ">
                2
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-emerald-200 text-gray-500 flex items-center justify-center ">
                3
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-emerald-200 text-gray-500 flex items-center justify-center">
                4
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                5
            </div>
            <div className="h-1 flex-1 bg-gray-200 rounded" />
            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                6
            </div>
          </div>
    <div className="mb-4">

    <label className="block text-sm font-medium mb-2">
        Assign To Room
    </label>

     <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        value={selectedRoomId ?? ""}
        onChange={(e)=>  setSelectedRoomId(Number(e.target.value))}
    >

        {rooms.map((room)=>(

            <option key={room.id}  value={room.id}
            >
                {room.floorCode} - {room.name}
            </option>

        ))}

    </select>

</div>

    <div className="grid grid-cols-12 gap-6">

      {/* Section Library */}

      <div className="col-span-4 bg-white rounded-xl border border-gray-300 p-5 shadow-sm">
        <div className="mb-4">

          <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Search Section..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
          />

      </div>

        <div className="border-b px-5 py-4">
          <h3 className="font-semibold">
            Available Sections
          </h3>
        </div>

        <div className="py-5 space-y-3">

          {filtered.map((section) => (

            <div
              key={section.id}
              className="flex justify-between items-center border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50"
            >

              <span className="font-medium">
                {section.name}
              </span>

              <button
                className="text-emerald-600 hover:text-emerald-700"
                onClick={() => {
                   if (selectedRoomId == null) {
                    error("Please select a room first.");
                    return;
                    }

                        assignSection(selectedRoomId, section.name);}}
              >
                <Plus size={18}/>
              </button>

            </div>
            
          ))}

        </div>
         <div className="mt-6 flex gap-2">

            <input
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Custom Section"
                value={customSectionName}
                onChange={(e)=>setCustomSectionName(e.target.value)}
            />

            <button
                onClick={addCustomSection}
                className="bg-emerald-600 text-white rounded-lg px-4"
            >
                Add
            </button>

        </div> 
      </div>

      {/* Assigned */}

      <div className="col-span-8 space-y-5">

        <div className="col-span-8 space-y-5">
          {rooms
          // .filter(room => room.id === selectedRoomId)
          .map(room=>{

          const assigned = sectionsByRoom[room.id] || [];

          return(

              <div
                  key={room.id}
                  className="bg-white rounded-xl border border-gray-300"
              >

                  <div className="border-b border-gray-300 px-5 py-3 flex justify-between">

                      <div className="font-semibold">
                          {room.floorCode} - {room.name}
                      </div>

                      <span className="text-sm text-gray-500">
                          {assigned.length} Section(s)
                      </span>

                  </div>

                  <div className="p-5 flex flex-wrap gap-3">

                      {assigned.length===0 &&

                          <div className="text-gray-400">
                              No sections assigned
                          </div>

                      }

                      {assigned.map(section=>(

                          <div
                              key={section.id}
                              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2"
                          >

                              {section.name}

                              <button
                                  className="text-red-500"
                                  onClick={()=>
                                      removeSection(
                                          room.id,
                                          section.id
                                      )
                                  }
                              >
                                  ×
                              </button>

                          </div>

                      ))}

                  </div>

              </div>

          )

      })}
        </div>

      </div>

    </div>

    {/* Footer */}

    <div className="flex justify-between">

      <button
        onClick={onBack}
        className="px-5 py-2 border border-gray-100 bg-red-500 text-white rounded-lg hover:bg-red-300"
      >
        ← Previous
      </button>

      <button
        onClick={onNext}
        disabled={totalAssigned===0}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-300"
      >
        Continue →
      </button>

    </div>

  </div>
  );
};

export default Step5DragSections;