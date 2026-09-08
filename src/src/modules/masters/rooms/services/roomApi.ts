import axios from "@/services/axios";

import { Room, RoomForm } from "../types/room";

const API = "/api/v1/masters/rooms/";

export const getRooms = async (params?: any) => {
    const response = await axios.get(API, {
        params,
    });

    return response.data;
};

export const getRoom = async (id: string) => {
    const response = await axios.get(
        `${API}${id}/`
    );

    return response.data;
};

export const createRoom = async (
    data: RoomForm
) => {
    const response = await axios.post(
        API,
        data
    );

    return response.data;
};

export const updateRoom = async (
    id: string,
    data: RoomForm
) => {
    const response = await axios.put(
        `${API}${id}/`,
        data
    );

    return response.data;
};

export const deleteRoom = async (
    id: string
) => {
    const response = await axios.delete(
        `${API}${id}/`
    );

    return response.data;
};

export const activateRoom = async (
    id: string
) => {
    const response = await axios.post(
        `${API}${id}/activate/`
    );

    return response.data;
};

export const deactivateRoom = async (
    id: string
) => {
    const response = await axios.post(
        `${API}${id}/deactivate/`
    );

    return response.data;
};

export const bulkActivateRooms = async (
    ids: string[]
) => {
    const response = await axios.post(
        `${API}bulk_activate/`,
        {
            ids,
        }
    );

    return response.data;
};

export const bulkDeactivateRooms = async (
    ids: string[]
) => {
    const response = await axios.post(
        `${API}bulk_deactivate/`,
        {
            ids,
        }
    );

    return response.data;
};

export const bulkDeleteRooms = async (
    ids: string[]
) => {
    const response = await axios.post(
        `${API}bulk_delete/`,
        {
            ids,
        }
    );

    return response.data;
};