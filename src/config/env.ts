const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_URL;

if (!API_URL) {
    throw new Error("VITE_API_URL is not defined");
}

if (!BASE_URL) {
    throw new Error("VITE_URL is not defined");
}

const MEDIA_URL = `${BASE_URL}/media`;

const getMediaUrl = (path: string) => {
    if (!path) return "";

    // Absolute URL
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    // Remove leading slash
    path = path.replace(/^\/+/, "");

    // If Django returns:
    // handover360/backend/media/inspection_media/09-09.png
    // or
    // handover360/media/inspection_media/09-09.png
    const mediaIndex = path.indexOf("media/");

    if (mediaIndex !== -1) {
        path = path.substring(mediaIndex + "media/".length);
    }

    return `${MEDIA_URL}/${path}`;
};

export {
    API_URL,
    BASE_URL,
    getMediaUrl,
};