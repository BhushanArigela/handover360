import React, { useState, useEffect } from "react";
import { updateRoom, deleteRoom as deleteRoomApi} from "../../../api/api";
import type { Floor, Room } from "./types";
import { confirm, error, success } from "../../../utils/toast";

interface Step4ManageRoomsFloorProps {
  floors: Floor[];
  roomsByFloor: Record<number, Room[]>;
  setRoomsByFloor: React.Dispatch<
    React.SetStateAction<Record<number, Room[]>>
  >;
  selectedRoomId: number | null;
  setSelectedRoomId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  onBack: () => void;
  onNext: () => void;
}

const Step4ManageRoomsFloor: React.FC<Step4ManageRoomsFloorProps> = ({
  floors,
  roomsByFloor,
  setRoomsByFloor,
  selectedRoomId,
  setSelectedRoomId,
  onBack,
  onNext,
}) => {
  useEffect(() => {

    if (!selectedRoomId) return;

    const exists = Object.values(roomsByFloor)
        .flat()
        .some(room => room.id === selectedRoomId);

    if (!exists) {
        setSelectedRoomId(null);
        setDescDraft("");
    }

}, [roomsByFloor]);
  const [descDraft, setDescDraft] = useState<string>("");
  
  const selectedRoom =
    Object.values(roomsByFloor)
      .flat()
      .find((room) => room.id === selectedRoomId) || null;

  useEffect(() => {
    if (selectedRoom) {
        setDescDraft(selectedRoom.description || "");
    } else {
        setDescDraft("");
    }
}, [selectedRoom]);

  const selectedFloor =
    floors.find((floor) =>
      (roomsByFloor[floor.id] || []).some(
        (room) => room.id === selectedRoomId
      )
    ) || null;

  const selectRoom = (room: Room): void => {
    setSelectedRoomId(room.id);
  };

  const saveDescription = async (): Promise<void> => {
    if (!selectedRoom || !selectedFloor) return;

    
    try {
        const updated = await updateRoom(selectedRoom.id, {
            description: descDraft,
        });

        setRoomsByFloor((prev) => ({
            ...prev,
            [selectedFloor.id]: prev[selectedFloor.id].map((room) =>
                room.id === updated.id ? updated : room
            ),
        }));
        success("Room updated successfully.");
    } catch (err) {
        error("Unable to update room.");
    }
  };

  const handleDeleteRoom = async (): Promise<void> => {

      if (!selectedRoom || !selectedFloor) return;

      const ok = await confirm(
          "Delete Room?",
          "This will permanently delete the room along with all its sections and items."
      );

      if (!ok) return;

      const roomId = selectedRoom.id;
      const floorId = selectedFloor.id;

      try {

          await deleteRoomApi(roomId);

          setRoomsByFloor((prev) => ({
              ...prev,
              [floorId]: prev[floorId].filter(
                  (room) => room.id !== roomId
              ),
          }));

          setSelectedRoomId(null);
          setDescDraft("");

      } catch (err:any) {
          error(err);
      }
  };

  const handleBack = async () => {

    if (
        selectedRoom &&
        descDraft !== (selectedRoom.description || "")
    ) {

        const ok = await confirm(
            "Discard Changes?",
            "Your description changes have not been saved."
        );

        if (!ok) return;
    }

    onBack();
};
  return (
    
      <div className="space-y-6">

    {/* Header */}

    <div>
      <h2 className="text-2xl font-bold">
        Step 4 - Room Details
      </h2>

      <p className="text-gray-500 mt-1">
        Review and update room information before adding sections.
      </p>
    </div>
    {/* Stepper */}

        <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-emerald-200 text-gray-500 flex items-center justify-center ">
                1
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-emerald-200 text-gray-500 flex items-center justify-center">
                2
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-emerald-200 text-gray-500 flex items-center justify-center">
                3
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
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
    <div className="grid grid-cols-12 gap-6">

      {/* Left */}

      <div className="col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm">

        <div className="border-b px-5 py-4">
          <h3 className="font-semibold">
            Rooms
          </h3>
        </div>

        <div className="p-5 space-y-3">

          {floors.map((floor) => (

            <div key={floor.id}>

              <div className="text-xs font-semibold uppercase text-gray-500 mb-2">
                {floor.name}
              </div>

              {(roomsByFloor[floor.id] || []).length === 0 && (
                <div className="text-sm text-gray-400 pl-2">
                  No rooms
                </div>
              )}

              {(roomsByFloor[floor.id] || []).map((room) => (

                <div
                  key={room.id}
                  onClick={() => selectRoom(room)}
                  className={`cursor-pointer rounded-lg px-4 py-3 mb-2 transition
                  ${
                    selectedRoomId === room.id
                      ? "bg-emerald-50 border border-emerald-500"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >

                  <div className="font-medium">
                    {room.name}
                  </div>

                </div>

              ))}

            </div>

          ))}

        </div>

      </div>

      {/* Right */}

      <div className="col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm">

        {!selectedRoom ? (

          <div className="h-full flex items-center justify-center text-gray-400 py-32">
            Select a room to edit.
          </div>

        ) : (

          <div className="p-6">

            <div className="flex justify-between items-center mb-8">

              <h3 className="text-lg font-semibold">
                Room Details
              </h3>

              <button
                onClick={handleDeleteRoom}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Room
              </button>

            </div>

            <div className="space-y-6">

              <div>

                <label className="block text-sm font-medium mb-2">
                  Room Name
                </label>

                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100"
                  value={selectedRoom.name}
                  disabled
                />

              </div>

              <div>

                <label className="block text-sm font-medium mb-2">
                  Floor
                </label>

                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100"
                  value={`${selectedFloor?.name} (${selectedFloor?.code})`}
                  disabled
                />

              </div>

              <div>

                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <textarea
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={descDraft}
                  onChange={(e) =>
                    setDescDraft(e.target.value)
                  }
                  
                />

              </div>
                 <button
                  onClick={saveDescription}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                  Save Description
              </button> 
            </div>

          </div>

        )}

      </div>

    </div>

    <div className="flex justify-between">

      <button
        onClick={handleBack}
        className="px-5 py-2 border border-gray-100 bg-red-500 text-white rounded-lg hover:bg-red-300"
      >
        ← Previous
      </button>

      <button
        onClick={onNext}
        disabled={!selectedRoom}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-300"
      >
        Continue →
      </button>

    </div>

  </div>
  );
};

export default Step4ManageRoomsFloor;