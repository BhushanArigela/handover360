export interface Template {
  id: number;
  name: string;
  property_type: string;
  description?: string;
  created_by?: string;
  published?: boolean;
}

export interface Item {
  id: number;
  name: string;
  description?: string;
  is_custom?: boolean;
  order?: number;
}

export interface Section {
  id: number;
  room: number;
  name: string;
  description?: string;
  order?: number;
  items: Item[];
}

export interface Room {
  id: number;
  name: string;
  description?: string;
  order?: number;
  floorName?: string;
  floorCode?: string;
  sections: Section[];
}

export interface Floor {
  id: number;
  name: string;
  code: string;
  floor_number?: number;
  floor_name?: string;
  template_id?: number;
  rooms: Room[];
}

export interface RoomLibrary {
  id?: number;
  name: string;
}

export interface SectionLibrary {
  id?: number;
  name: string;
}

export interface ItemLibrary {
  id?: number;
  name: string;
}

export interface TemplateStructure extends Template {
  floors: Floor[];
}

export interface FlatInspectionItem {
  item_id: number;
  item_name: string;
  room: string;
  section: string;
}

export interface InspectionEntry {
  item_id: number;
  specification: string;
  observation: string;
  rectification: string;
  severity: "Low" | "Medium" | "High";
}