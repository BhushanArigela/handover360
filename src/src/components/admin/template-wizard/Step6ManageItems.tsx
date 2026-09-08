import React, { useEffect, useState } from "react";
import { Plus, } from "lucide-react";
import { getItemLibrary, addItemToLibrary, addItemToSection, listItemsForSection, deleteItem, listSectionsForRoom } from "../../../api/api";
import type { Room, Section, Item, ItemLibrary } from "./types";

interface Step6ManageItemsProps {
  rooms: Room[];
  sections: Section[];
  itemsBySection: Record<number, Item[]>;
  setItemsBySection: React.Dispatch<
    React.SetStateAction<Record<number, Item[]>>
  >;
  onBack: () => void;
  onNext: () => void;
}

const Step6ManageItems: React.FC<Step6ManageItemsProps> = ({
  rooms,
  sections,
  itemsBySection,
  setItemsBySection,
  onBack,
  onNext,
}) => {
  
const [library, setLibrary] = useState<ItemLibrary[]>([]);
const [search, setSearch] = useState("");
const [customItemName, setCustomItemName] = useState("");
const [selectedSectionId, setSelectedSectionId] = useState(0);
const [selectedRoomId, setSelectedRoomId] = useState(
    rooms[0]?.id || 0
);
useEffect(() => {

    if (
        rooms.length &&
        selectedRoomId === 0
    ) {

        setSelectedRoomId(
            rooms[0].id
        );

    }

}, [rooms]);

const [roomSections, setRoomSections] = useState<Section[]>([]);
useEffect(() => {

    if (!selectedRoomId) return;

    listSectionsForRoom(selectedRoomId)
        .then((data) => {

            setRoomSections(data);

            if (data.length > 0) {
                setSelectedSectionId(data[0].id);
            } else {
                setSelectedSectionId(0);
            }

        })
        .catch(console.error);

}, [selectedRoomId]);

const filtered = library.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
);

  useEffect(() => {
    getItemLibrary()
        .then(setLibrary)
        .catch(console.error);
}, []);

const addCustomItem = async () => {

    const name = customItemName.trim();

    if (!name) return;
    if (
        library.some(
            i => i.name.toLowerCase() === name.toLowerCase()
        )
    ) {
        return;
    }
    const created = await addItemToLibrary(name);

    setLibrary(prev => [...prev, created]);
    await getItemLibrary().then(setLibrary);
    setCustomItemName("");
};

  const assignItem = async (
    sectionId: number,
    itemName: string
) => {
    if (!sectionId) return;
    const existing = itemsBySection[sectionId] || [];

    if (
        existing.some(i => i.name === itemName)
    ) {
        return;
    }

    const created = await addItemToSection(
        sectionId,
        {
            name: itemName,
            order: existing.length,
        }
    );

    setItemsBySection(prev => ({
        ...prev,
        [sectionId]: [
            ...(prev[sectionId] || []),
            created,
        ],
    }));
};

  useEffect(() => {

    const loadItems = async (section: Section) => {

        const existing =
            await listItemsForSection(section.id);

        setItemsBySection(prev => ({
            ...prev,
            [section.id]: existing
        }));

    };
    // async function loadOrSeed(section: Section) {
    //   const existing = await listItemsForSection(section.id);

    //   if (existing.length === 0) {
    //     const seeded = await seedDefaultItems(section.id);

    //     setItemsBySection((prev) => ({
    //       ...prev,
    //       [section.id]: seeded,
    //     }));
    //   } else {
    //     setItemsBySection((prev) => ({
    //       ...prev,
    //       [section.id]: existing,
    //     }));
    //   }
    // }

    roomSections.forEach(section => {

        if (!itemsBySection[section.id]) {
            loadItems(section);
        }

    });
  }, [roomSections, itemsBySection, setItemsBySection]);
 
  const removeItem = async (
    sectionId: number,
    itemId: number
) => {

    await deleteItem(itemId);

    setItemsBySection(prev => ({
        ...prev,
        [sectionId]: (
            prev[sectionId] || []
        ).filter(
            item => item.id !== itemId
        )
    }));
};

 const totalAssigned = Object.values(itemsBySection).reduce(
    (sum, items) => sum + items.length,
    0
); 

  return (
    <div className="space-y-6">
      
      {/* Header */}
    <div>
      <h2 className="text-2xl font-bold">
        Step 6 - Configure Section Items
      </h2>

      <p className="text-gray-500 mt-1">
        Assign inspection section items to each section.
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

            <div className="w-9 h-9 rounded-full bg-emerald-200 text-gray-500 flex items-center justify-center">
                5
            </div>
            <div className="h-1 flex-1 bg-gray-200 rounded" />
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                6
            </div>
          </div> 
    <div className="mb-4">
      <div className="grid grid-cols-12 gap-6">
        {/* Sections */}
        <div className="col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm">

          <div className="border-b px-5 py-4">
              <h3 className="font-semibold">
                  Available Items
              </h3>
          </div>

        <div className="p-5">

        <input
            className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-4"
            placeholder="Search Item..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
        />

         <label className="block text-sm font-medium mb-2">
              Select Room
          </label>

          <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              value={selectedRoomId}
              onChange={(e)=>
                  setSelectedRoomId(Number(e.target.value))
              }
          >

              {rooms.map(room=>(

                  <option
                      key={room.id}
                      value={room.id}
                  >
                      {room.floorCode} -{room.name}
                  </option>

              ))}

          </select> 
        <label className="block text-sm font-medium mb-2">
            Assign To Section
        </label>

        <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4"
            value={selectedSectionId}
            onChange={(e)=>
                setSelectedSectionId(Number(e.target.value))
            }
        >

            {roomSections.map(section=>(

                <option
                    key={section.id}
                    value={section.id}
                >
                    {section.name}
                </option>

            ))}

        </select>

        <div className="space-y-2">

            {filtered.map(item=>(

                <div
                    key={item.id}
                    className="flex justify-between items-center border border-gray-200 rounded-lg px-3 py-3 hover:bg-gray-50"
                >

                    <span>{item.name}</span>

                    <button
                        className="text-emerald-600"
                        onClick={()=>
                            assignItem(
                                selectedSectionId,
                                item.name
                            )
                        }
                    >
                        <Plus size={18}/>
                    </button>

                </div>

            ))}

        </div>

        <div className="mt-6 flex gap-2">

            <input
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Custom Item"
                value={customItemName}
                onChange={(e)=>
                    setCustomItemName(e.target.value)
                }
            />

            <button
                onClick={addCustomItem}
                className="bg-emerald-600 text-white rounded-lg px-4"
            >
                Add
            </button>

        </div>

    </div>

</div>
        

        {/* Items */}
        
        <div className="col-span-8 space-y-5">

          {roomSections.map(section=>{

              const assigned =
                  itemsBySection[section.id] || [];

              return(

                  <div
                      key={section.id}
                      className="bg-white rounded-xl border border-gray-200"
                  >

                      <div className="border-b border-gray-200 px-5 py-3 flex justify-between">

                          <div className="font-semibold">
                              {section.name}
                          </div>

                          <span className="text-sm text-gray-500">
                              {assigned.length} Item(s)
                          </span>

                      </div>

                      <div className="p-5 flex flex-wrap gap-3">

                          {assigned.length===0 &&

                              <div className="text-gray-400">
                                  No items assigned
                              </div>

                          }

                          {assigned.map(item=>(

                              <div
                                  key={item.id}
                                  className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2"
                              >

                                  {item.name}

                                  <button
                                      className="text-red-500"
                                      onClick={()=>
                                          removeItem(
                                              section.id,
                                              item.id
                                          )
                                      }
                                  >
                                      ×
                                  </button>

                              </div>

                          ))}

                      </div>

                  </div>

              );

          })}

      </div>
      </div>

      <div className="flex justify-between">

      <button
        onClick={onBack}
        className="px-5 py-2 mt-5 border border-gray-100 bg-red-500 text-white rounded-lg hover:bg-red-300">
        ← Previous
      </button>

      <button
        onClick={onNext}
        disabled={totalAssigned===0}
        className="px-6 py-2 mt-5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-300">
        Continue →
      </button>
</div>
    </div>
    </div>
  );
};

export default Step6ManageItems;