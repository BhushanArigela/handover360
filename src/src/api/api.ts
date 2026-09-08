import { API_URL } from "../config/env";

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
) {

    const token = localStorage.getItem("token");

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Token ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {

        let errorData: any = {};

        try {
            errorData = await response.json();
        } catch {
            errorData = {
                detail: "Something went wrong.",
            };
        }

        throw errorData;
    }
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }

    return response.json();

}

export function listTemplates() {
    return apiRequest("/masters/templates/");
}

export function createTemplate(data: {
    name: string;
    property_type: string;
    description: string;
}) {
    return apiRequest("/masters/templates/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateTemplate(
    id: number,
    payload: any
) {
    return apiRequest(`/masters/templates/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}


export function generateFloors(
    templateId: number,
    count: number
) {
    return apiRequest(
        `/masters/templates/${templateId}/generate-floors/`,
        {
            method: "POST",
            body: JSON.stringify({
                count,
            }),
        }
    );
}

export function getRoomLibrary() {
    return apiRequest("/masters/room-library/");
}

export function addRoomToFloor(
    floorId: number,
    data: {
        name: string;
        description?: string;
        order: number;
    }
) {
    return apiRequest(
        `/masters/floors/${floorId}/rooms/`,
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );
}

export function updateRoom(
    roomId: number,
    data: {
        description: string;
    }
) {
    return apiRequest(`/masters/rooms/${roomId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function deleteRoom(roomId: number) {
    return apiRequest(
        `/masters/rooms/${roomId}/`,
        {
            method: "DELETE",
        }
    );
}

export function addRoomToLibrary(name: string) {
    return apiRequest("/masters/room-library/", {
        method: "POST",
        body: JSON.stringify({ name }),
    });
}

export function getSectionLibrary() {
    return apiRequest("/masters/section-library/");
}

export function addSectionToLibrary(name: string) {
    return apiRequest("/masters/section-library/", {
        method: "POST",
        body: JSON.stringify({
            name,
        }),
    });
}

export function getSectionsForRoom(roomId: number) {
    return apiRequest(`/masters/rooms/${roomId}/sections/`);
}

export function addSectionToRoom(
    roomId: number,
    data: {
        name: string;
        order: number;
    }
) {
    return apiRequest(
        `/masters/rooms/${roomId}/sections/`,
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );
}

export function deleteSection(sectionId: number) {
    return apiRequest(
        `/masters/sections/${sectionId}/`,
        {
            method: "DELETE",
        }
    );
}

export function listItemsForSection(sectionId: number) {
    return apiRequest(
        `/masters/sections/${sectionId}/items/`
    );
}

export function seedDefaultItems(sectionId: number) {
    return apiRequest(
        `/masters/sections/${sectionId}/seed-items/`,
        {
            method: "POST",
        }
    );
}

export function deleteItem(itemId: number) {
    return apiRequest(
        `/masters/items/${itemId}/`,
        {
            method: "DELETE",
        }
    );
}

export function deleteTemplate(templateId: number) {
    return apiRequest(
        `/masters/templates/${templateId}/`,
        {
            method: "DELETE",
        }
    );
}

export function publishTemplate(templateId: number) {
    return apiRequest(
        `/masters/templates/${templateId}/publish/`,
        {
            method: "POST",
        }
    );
}

export function unpublishTemplate(templateId: number) {
    return apiRequest(
        `/masters/templates/${templateId}/unpublish/`,
        {
            method: "POST",
        }
    );
}

export function listSectionMasters() {
    return apiRequest("/masters/section-library/");
}

export function createSectionMaster(data: {
    name: string;
    description: string;
}) {
    return apiRequest("/masters/section-library/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateSectionMaster(
    id: number,
    data: {
        name: string;
        description: string;
    }
) {
    return apiRequest(
        `/masters/section-library/${id}/`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        }
    );
}

export function deleteSectionMaster(id: number) {
    return apiRequest(
        `/masters/section-library/${id}/`,
        {
            method: "DELETE",
        }
    );
}

export function updateSection(
    sectionId: number,
    data: {
        name?: string;
        description?: string;
        order?: number;
    }
) {
    return apiRequest(`/masters/sections/${sectionId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function getItemLibrary() {
    return apiRequest("/masters/item-library/");
}

export function addItemToLibrary(name: string) {
    return apiRequest("/masters/item-library/", {
        method: "POST",
        body: JSON.stringify({
            name,
        }),
    });
}

export function updateItemLibrary(
    id: number,
    data: {
        name: string;
        description?: string;
    }
) {
    return apiRequest(`/masters/item-library/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function deleteItemLibrary(id: number) {
    return apiRequest(`/masters/item-library/${id}/`, {
        method: "DELETE",
    });
}

export function listSectionsForRoom(roomId: number) {
    return apiRequest(`/masters/rooms/${roomId}/sections/`);
}

export function addItemToSection(
    sectionId: number,
    data: {
        name: string;
        description?: string;
        is_custom?: boolean;
        order: number;
    }
) {
    return apiRequest(`/masters/sections/${sectionId}/items/add/`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}


export function updateItem(
    itemId: number,
    data: {
        name?: string;
        description?: string;
        order?: number;
    }
) {
    return apiRequest(`/masters/items/${itemId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function getStructure(templateId: number) {
    return apiRequest(
        `/masters/templates/${templateId}/structure/`
    );
}

export function saveReviewDraft(inspectionReportId: number) {
    return apiRequest(
        `/inspection/${inspectionReportId}/review/save-draft/`,
        {
            method: "POST",
        }
    );
}

export function previewReview(inspectionReportId: number) {
    return apiRequest(
        `/inspection/${inspectionReportId}/review/preview/`,
        {
            method: "GET",
        }
    );
}

export function submitReview(inspectionReportId: number) {
    return apiRequest(
        `/inspection/review/submit/`,
        {
            method: "POST",
            body: JSON.stringify({
                inspection_report: inspectionReportId,
            }),
        }
    );
}

export function duplicateTemplate(id: number){
    return apiRequest(`/masters/templates/${id}/duplicate/`, {
        method: "POST",
    });
}