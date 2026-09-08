import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    activateRoom,
    bulkActivateRooms,
    bulkDeactivateRooms,
    bulkDeleteRooms,
    createRoom,
    deactivateRoom,
    deleteRoom,
    getRoom,
    getRooms,
    updateRoom,
} from "../services/roomApi";

import { RoomForm } from "../types/room";

const QUERY_KEY = ["room-master"];

export const useRooms = (params?: any) => {

    return useQuery({

        queryKey: [...QUERY_KEY, params],

        queryFn: () => getRooms(params),

        keepPreviousData: true,

    });

};

export const useRoom = (id: string) => {

    return useQuery({

        queryKey: [...QUERY_KEY, id],

        queryFn: () => getRoom(id),

        enabled: !!id,

    });

};

export const useCreateRoom = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (data: RoomForm) =>
            createRoom(data),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: QUERY_KEY,
            });

        },

    });

};

export const useUpdateRoom = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: RoomForm;
        }) => updateRoom(id, data),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: QUERY_KEY,
            });

        },

    });

};

export const useDeleteRoom = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (id: string) =>
            deleteRoom(id),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: QUERY_KEY,
            });

        },

    });

};

export const useActivateRoom = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (id: string) =>
            activateRoom(id),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: QUERY_KEY,
            });

        },

    });

};

export const useDeactivateRoom = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (id: string) =>
            deactivateRoom(id),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: QUERY_KEY,
            });

        },

    });

};

export const useBulkActivateRooms = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (ids: string[]) =>
            bulkActivateRooms(ids),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: QUERY_KEY,
            });

        },

    });

};

export const useBulkDeactivateRooms = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (ids: string[]) =>
            bulkDeactivateRooms(ids),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: QUERY_KEY,
            });

        },

    });

};

export const useBulkDeleteRooms = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (ids: string[]) =>
            bulkDeleteRooms(ids),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: QUERY_KEY,
            });

        },

    });

};