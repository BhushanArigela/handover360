import { apiRequest } from "./api";
import { API_URL } from '../config/env';


/**
 * Load complete inspection hierarchy
 * (Property → Floors → Rooms → Sections → Items)
 */
export const getInspection = (enquiryId: string) => {
    return apiRequest(`/inspection/${enquiryId}/`);
};

/**
 * Save a single inspection item
 */
export const saveInspectionItem = (
    data: {
        enquiry_id: string;
        item_id: number;

        observation: string;
        rectification: string;

        severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

        status: "pending" | "completed";
    }
) => {

    return apiRequest("/inspection/item/", {
        method: "POST",
        body: JSON.stringify(data),
    });

};

/**
 * Save complete inspection as draft
 */
export const saveDraft = (payload: any) => {

    return apiRequest(
        "/inspection/save-draft/",
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );

};

/**
 * Upload multiple images
 */
export const uploadImages = (
    enquiryId: string,
    itemId: number,
    files: File[]
) => {

    const formData = new FormData();

    formData.append(
        "enquiry_id",
        enquiryId
    );

    formData.append(
        "item_id",
        itemId.toString()
    );

    files.forEach(file => {

        formData.append(
            "files",
            file
        );

    });

    return fetch(
        `${API_URL}/inspection/upload-images/`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
            body: formData,
        }
    );

};

/**
 * Submit final inspection
 */
export const submitInspection = (
    payload: any
) => {

    return apiRequest(
        "/inspection/submit/",
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );

};

/**
 * Load saved draft
 */
export const getDraft = (
    enquiryId: string
) => {

    return apiRequest(
        `/inspection/draft/${enquiryId}/`
    );

};

/**
 * Delete uploaded image
 */
export const deleteInspectionImage = (
    imageId: number
) => {

    return apiRequest(
        `/inspection/images/${imageId}/`,
        {
            method: "DELETE",
        }
    );

};