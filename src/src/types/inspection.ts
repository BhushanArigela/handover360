// src/types/Inspection.ts

export type Severity =
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

export type InspectionStatus =
    | "pending"
    | "completed";

export interface InspectionImage {
    id: number;
    url: string;
    file_name: string;
    uploaded_at: string;
}

export interface InspectionResponse {

    id?: number;

    item_id: number;

    observation: string;

    rectification: string;

    severity: Severity;

    status: InspectionStatus;

    images: InspectionImage[];
}

export interface InspectionItem {

    id: number;

    name: string;

    specification: string;

    description?: string;

    image_limit: number;

    mandatory: boolean;

    sequence: number;

    response?: InspectionResponse;
}

export interface InspectionSection {

    id: number;

    name: string;

    description?: string;

    sequence: number;

    items: InspectionItem[];
}

export interface InspectionRoom {

    id: number;

    name: string;

    description?: string;

    sequence: number;

    sections: InspectionSection[];
}

export interface InspectionFloor {

    id: number;

    name: string;

    sequence: number;

    rooms: InspectionRoom[];
}

export interface InspectionTemplate {

    id: number;

    name: string;

    property_type: string;

    floors: InspectionFloor[];
}

export interface InspectionProperty {

    enquiry_id: string;

    enquiry_number: string;

    property_address: string;

    property_type: string;

    city: string;

    pincode: string;

    construction_stage: string;

    client_name: string;

    status: string;
}

export interface InspectionData {

    enquiry: InspectionProperty;

    template: InspectionTemplate;
}

export interface SaveInspectionPayload {

    enquiry_id: string;

    item_id: number;

    observation: string;

    rectification: string;

    severity: Severity;

    status: InspectionStatus;
}

export interface DraftPayload {

    enquiry_id: string;

    overall_notes: string;

    responses: SaveInspectionPayload[];
}