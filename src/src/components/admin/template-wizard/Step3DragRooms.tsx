import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getRoomLibrary, addRoomToFloor, deleteRoom, addRoomToLibrary } from "../../../api/api";
import type { Floor, Room, RoomLibrary } from "./types";
import { confirm, error } from "../../../utils/toast";

interface Step3DragRoomsProps {
  floors: Floor[];
  roomsByFloor: Record<number, Room[]>;
  setRoomsByFloor: React.Dispatch<
    React.SetStateAction<Record<number, Room[]>>
  >;
  onBack: () => void;
  onNext: () => void;
}

const Step3DragRooms: React.FC<Step3DragRoomsProps> = ({
  floors,
  roomsByFloor,
  setRoomsByFloor,
  onBack,
  onNext,
}) => {
  const [library, setLibrary] = useState<RoomLibrary[]>([]);
  const [search, setSearch] = useState<string>("");
//   const [dragRoomName, setDragRoomName] = useState<string | null>(null);
//   const [overFloor, setOverFloor] = useState<number | null>(null);
  const [customRoomName, setCustomRoomName] = useState<string>("");
  const [ selectedFloorId, setSelectedFloorId] = useState<number>(
    floors[0]?.id || 0
  ); 
 
    useEffect(() => {
        getRoomLibrary()
            .then(setLibrary)
            .catch(console.error);
        }, []);
    useEffect(() => {
        if (!floors.length) {
            setSelectedFloorId(0);
            return;
        }

        const exists = floors.some(f => f.id === selectedFloorId);

        if (!exists) {
            setSelectedFloorId(floors[0].id);
        }
    }, [floors]);
  

  const assignRoom = async (
    floorId: number,
    roomName: string
  ): Promise<void> => {

    const existing = roomsByFloor[floorId] || [];

    const normalized = roomName.trim().toLowerCase();
    if (
        existing.some(
            room => room.name.trim().toLowerCase() === normalized
        )
    ) {
        return;
    }

    try {
        const created = await addRoomToFloor(floorId, {
            name: roomName,
            description: "",
            order: existing.length,
        });

        setRoomsByFloor(prev => ({
            ...prev,
            [floorId]: [...existing, created],
        }));
    } catch (err: any) {
        error(err.detail || "Room already exists on this floor.");
    }
  };

  const removeRoom = async (
    floorId: number,
    roomId: number
    ) => {
        try {
            console.log("Deleting room:", {
                floorId,
                roomId,
                rooms: roomsByFloor[floorId]
            });
            await deleteRoom(roomId);

            setRoomsByFloor((prev) => ({
                ...prev,
                [floorId]: (prev[floorId] || []).filter(
                    (room) => room.id !== roomId
                ),
            }));

        } catch (err) {
            console.error(err);
        }
    };

  const addCustomRoom = async (): Promise<void> => {
    
    const name = customRoomName.trim();
    if (!name) return;

    const normalized = name.toLowerCase();
    if (
        library.some(
            room => room.name.trim().toLowerCase() === normalized
        )
    ) {
        error("Room already exists in the master library.");
        return;
    }
    const created = await addRoomToLibrary(name);

    setLibrary((prev) => [...prev, created]);

    setCustomRoomName("");
  };
 const handleBack = async () => {

    if (totalAssigned > 0) {

        const ok = await confirm(
            "Go Back?",
            "Changing floors may remove the assigned rooms."
        );

        if (!ok) return;
    }

    onBack();
};
 const assignedRooms = Object.values(roomsByFloor)
    .flat()
    .map((room) => ({
        id: room.id,
        name: room.name,
    }));

    const mergedLibrary = [
    ...library,
    ...assignedRooms.filter(
        (assigned) =>
        !library.some((lib) => lib.name === assigned.name)
    ),
    ];

    const filtered = mergedLibrary.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
    );

  const totalAssigned = Object.values(roomsByFloor).reduce(
    (sum, rooms) => sum + rooms.length,
    0
  );

  return (
    
      <div className="space-y-6">

    {/* Header */}

    <div>
        <h2 className="text-2xl font-bold">
            Step 3 - Assign Rooms
        </h2>

        <p className="text-gray-500">
            Assign rooms to each floor.
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

            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
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
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        Assign To Floor
      </label>

      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        value={selectedFloorId}
        onChange={(e) => setSelectedFloorId(Number(e.target.value))}
      >
        {floors.map((floor) => (
          <option key={floor.id} value={floor.id}>
            {floor.name}
          </option>
        ))}
      </select>
    </div>

    <div className="grid grid-cols-12 gap-6">

        {/* Left */}

        <div className="col-span-4 bg-white rounded-xl border border-gray-300 p-5">

            <div className="mb-4">

                <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="Search Room..."
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                />

            </div>

            <div className="space-y-2">

                {filtered.map(room=>(

                    <div
                        key={room.name}
                        className="flex justify-between items-center border border-gray-300 rounded-lg px-3 py-3 hover:bg-gray-50"
                    >

                        <span>{room.name}</span>

                        <button
                            className="text-emerald-600 font-semibold"
                            onClick={()=>{
                                if(floors.length){
                                    // assignRoom(floors[0].id,room.name)
                                    assignRoom(selectedFloorId, room.name)
                                }
                            }}
                        >
                            <Plus size={18}/>
                        </button>

                    </div>

                ))}

            </div>

            <div className="mt-6 flex gap-2">

                <input
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Custom room"
                    value={customRoomName}
                    onChange={(e)=>setCustomRoomName(e.target.value)}
                />

                <button
                    onClick={addCustomRoom}
                    className="bg-emerald-600 text-white rounded-lg px-4"
                >
                    Add
                </button>

            </div>

        </div>

        {/* Right */}

        <div className="col-span-8 space-y-5">

            {floors.map(floor=>{

                const assigned=roomsByFloor[floor.id]||[]

                return(

                    <div
                        key={floor.id}
                        className="bg-white rounded-xl border border-gray-300"
                    >

                        <div className="border-b border-gray-300 px-5 py-3 flex justify-between">

                            <div className="font-semibold">
                                {floor.name}
                            </div>

                            <span className="text-sm text-gray-500">
                                {assigned.length} Room(s)
                            </span>

                        </div>

                        <div className="p-5 flex flex-wrap gap-3">

                            {assigned.length===0 &&

                                <div className="text-gray-400">
                                    No rooms assigned
                                </div>

                            }

                            {assigned.map(room=>(

                                <div
                                    key={room.id}
                                    className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2"
                                >

                                    {room.name}

                                    <button
                                        className="text-red-500"
                                        onClick={()=>removeRoom(floor.id,room.id)}
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

    <div className="border-t border-gray-300 px-6 py-4 flex justify-between">

        <button
            onClick={handleBack}
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

export default Step3DragRooms;