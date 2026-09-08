import React from "react";
import {
    Building2,
    DoorOpen,
    CheckCircle2,
    Circle,
} from "lucide-react";

interface Props {
    floors: any[];
    selectedFloor: number | null;
    selectedRoom: number | null;
    onSelectRoom: (
        floorId: number,
        roomId: number
    ) => void;
}

export const InspectionSidebar: React.FC<Props> = ({
    floors,
    selectedFloor,
    selectedRoom,
    onSelectRoom,
}) => {
    return (
        <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">

            {floors.map((floor) => (

                <div
                    key={floor.id}
                    className="border-b border-gray-200"
                >

                    <div className="px-5 py-4 bg-blue-100 font-semibold flex items-center gap-2">

                        <Building2
                            size={18}
                            className="text-blue-600"
                        />

                        {floor.name}

                    </div>

                    {floor.rooms.length === 0 ? (

                        <div className="px-10 py-3 text-sm text-gray-400">
                            No Rooms
                        </div>

                    ) : (

                        floor.rooms.map((room: any) => {

                            const active =
                                selectedRoom === room.id;

                            return (

                                <button
                                    key={room.id}
                                    onClick={() =>
                                        onSelectRoom(
                                            floor.id,
                                            room.id
                                        )
                                    }
                                    className={`w-full px-5 py-3 flex items-center justify-between transition
                                    ${
                                        active
                                            ? "bg-blue-50 border-l-4 border-blue-600"
                                            : "hover:bg-gray-50"
                                    }`}
                                >

                                    <div className="flex items-center gap-3 text-sm capitalize">

                                        <DoorOpen
                                            size={18}
                                        />

                                        <span>

                                            {room.name}

                                        </span>

                                    </div>

                                    {active ? (

                                        <CheckCircle2
                                            className="text-blue-600"
                                            size={18}
                                        />

                                    ) : (

                                        <Circle
                                            size={16}
                                            className="text-gray-300"
                                        />

                                    )}

                                </button>

                            );

                        })

                    )}

                </div>

            ))}

        </div>
    );
};