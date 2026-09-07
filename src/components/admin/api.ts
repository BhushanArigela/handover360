import { Template, TemplateStructure, Floor, Room, Section, Item } from "./template-wizard/types";

const BASE = "/api";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
}

export const api = {
  // ==========================
  // ROOM LIBRARY
  // ==========================

  getRoomLibrary(): Promise<Room[]> {
    return request<Room[]>("/library/rooms");
  },

  addRoomToLibrary(name: string): Promise<Room> {
    return request<Room>("/library/rooms", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  // ==========================
  // SECTION LIBRARY
  // ==========================

  getSectionLibrary(): Promise<Section[]> {
    return request<Section[]>("/library/sections");
  },

  addSectionToLibrary(name: string): Promise<Section> {
    return request<Section>("/library/sections", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  // ==========================
  // TEMPLATES
  // ==========================

  createTemplate(
    payload: Partial<Template>
  ): Promise<Template> {
    return request<Template>("/templates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getTemplate(id: number): Promise<Template> {
    return request<Template>(`/templates/${id}`);
  },

  publishTemplate(id: number): Promise<void> {
    return request<void>(`/templates/${id}/publish`, {
      method: "POST",
    });
  },

  getStructure(id: number): Promise<TemplateStructure> {
    return request<TemplateStructure>(
        `/templates/${id}/structure`
    );
},

  // ==========================
  // FLOORS
  // ==========================

  generateFloors(
    templateId: number,
    count: number
  ): Promise<Floor[]> {
    return request<Floor[]>(
      `/templates/${templateId}/floors/generate`,
      {
        method: "POST",
        body: JSON.stringify({ count }),
      }
    );
  },

  listFloors(templateId: number): Promise<Floor[]> {
    return request<Floor[]>(
      `/templates/${templateId}/floors`
    );
  },

  deleteFloor(floorId: number): Promise<void> {
    return request<void>(`/floors/${floorId}`, {
      method: "DELETE",
    });
  },

  // ==========================
  // ROOMS
  // ==========================

  addRoomToFloor(
    floorId: number,
    payload: Partial<Room>
  ): Promise<Room> {
    return request<Room>(`/floors/${floorId}/rooms`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listRoomsForFloor(floorId: number): Promise<Room[]> {
    return request<Room[]>(`/floors/${floorId}/rooms`);
  },

  updateRoom(
    roomId: number,
    payload: Partial<Room>
  ): Promise<Room> {
    return request<Room>(`/rooms/${roomId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteRoom(roomId: number): Promise<void> {
    return request<void>(`/rooms/${roomId}`, {
      method: "DELETE",
    });
  },

  // ==========================
  // SECTIONS
  // ==========================

  addSectionToRoom(
    roomId: number,
    payload: Partial<Section>
  ): Promise<Section> {
    return request<Section>(`/rooms/${roomId}/sections`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listSectionsForRoom(roomId: number): Promise<Section[]> {
    return request<Section[]>(
      `/rooms/${roomId}/sections`
    );
  },

  deleteSection(sectionId: number): Promise<void> {
    return request<void>(`/sections/${sectionId}`, {
      method: "DELETE",
    });
  },

  // ==========================
  // ITEMS
  // ==========================

  addItemToSection(
    sectionId: number,
    payload: Partial<Item>
  ): Promise<Item> {
    return request<Item>(`/sections/${sectionId}/items`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  seedDefaultItems(sectionId: number): Promise<Item[]> {
    return request<Item[]>(
      `/sections/${sectionId}/items/seed-defaults`,
      {
        method: "POST",
      }
    );
  },

  listItemsForSection(
    sectionId: number
  ): Promise<Item[]> {
    return request<Item[]>(
      `/sections/${sectionId}/items`
    );
  },

  deleteItem(itemId: number): Promise<void> {
    return request<void>(`/items/${itemId}`, {
      method: "DELETE",
    });
  },

  // ==========================
  // INSPECTION
  // ==========================

  getFlatItems(
    templateId: number
  ): Promise<Item[]> {
    return request<Item[]>(
      `/templates/${templateId}/items/flat`
    );
  },

  submitInspectionEntry(
    templateId: number,
    payload: unknown
  ): Promise<void> {
    return request<void>(
      `/templates/${templateId}/inspections`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};