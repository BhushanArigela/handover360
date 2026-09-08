import { RoomCategory } from "../types/room";

export const ROOM_CATEGORY_OPTIONS: {
    value: RoomCategory;
    label: string;
}[] = [
    {
        value: "residential",
        label: "Residential",
    },
    {
        value: "commercial",
        label: "Commercial",
    },
    {
        value: "common",
        label: "Common",
    },
    {
        value: "utility",
        label: "Utility",
    },
    {
        value: "outdoor",
        label: "Outdoor",
    },
    {
        value: "other",
        label: "Other",
    },
];

export const ROOM_STATUS_OPTIONS = [
    {
        value: "",
        label: "All",
    },
    {
        value: "true",
        label: "Active",
    },
    {
        value: "false",
        label: "Inactive",
    },
];

export const DEFAULT_ROOM_FORM = {
    name: "",
    category: "residential" as RoomCategory,
    icon: "",
    description: "",
    sort_order: 1,
    is_active: true,
};

export const ROOM_TABLE_COLUMNS = {
    CODE: "code",
    NAME: "name",
    CATEGORY: "category",
    STATUS: "is_active",
    SORT_ORDER: "sort_order",
    CREATED_AT: "created_at",
};