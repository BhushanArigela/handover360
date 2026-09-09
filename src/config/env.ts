const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_URL;

if (!API_URL) {
    throw new Error("VITE_API_URL is not defined");
}

if (!BASE_URL) {
    throw new Error("VITE_URL is not defined");
}

const getMediaUrl = (path: string) => {
    if (!path) {
        return "";
    }

    // If Django already returns a complete URL
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    // Django returns something like:
    // /handover360/backend/media/photos/test.jpg
    if (path.startsWith("/")) {
        return `${window.location.origin}${path}`;
    }

    return `${window.location.origin}/${path}`;
};

export {
    API_URL,
    BASE_URL,
    getMediaUrl,
};