const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  navigate?: (page: string) => void
) {
  const token = localStorage.getItem("token");

  // Preserve any headers passed by the caller
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  // Only set JSON content type if the body is NOT FormData
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.clear();
    navigate?.("login");
    throw new Error("Session expired");
  }

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
        const data = await response.json();

        message =
            data.message ||
            data.detail ||
            (typeof data === "string" ? data : JSON.stringify(data));
    } catch {
        message = await response.text();
    }

    throw new Error(message);
}

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  return await response.blob();
}