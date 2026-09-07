export interface Room {

    id: string;

    code: string;

    name: string;

    category: RoomCategory;

    icon: string;

    description: string;

    sort_order: number;

    is_active: boolean;

    status: string;

    created_by: string;

    updated_by: string;

    created_at: string;

    updated_at: string;

}

export interface RoomForm {

    name: string;

    category: RoomCategory;

    icon: string;

    description: string;

    sort_order: number;

    is_active: boolean;

}

export interface RoomStatistics {

    total: number;

    residential: number;

    commercial: number;

    inactive: number;

}

export type RoomCategory =

    | "residential"

    | "commercial"

    | "common"

    | "utility"

    | "outdoor"

    | "other";