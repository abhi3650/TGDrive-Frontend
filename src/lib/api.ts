import axios from "axios";

// Access the backend URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create an axios instance for cleaner calls
const api = axios.create({
  baseURL: API_URL,
});

// --- AUTHENTICATION ---
export const checkPassword = async (password: string) => {
  return api.post("/api/checkPassword", { pass: password });
};

// --- DIRECTORY & NAVIGATION ---
export const getDirectory = async (path: string, password: string) => {
  return api.post("/api/getDirectory", { path, password });
};

// --- FILE MANAGEMENT (Create, Rename, Delete) ---
export const createNewFolder = async (path: string, name: string, password: string) => {
  return api.post("/api/createNewFolder", { path, name, password });
};

export const renameFileFolder = async (path: string, name: string, password: string) => {
  return api.post("/api/renameFileFolder", { path, name, password });
};

export const deleteFileFolder = async (path: string, password: string) => {
  return api.post("/api/deleteFileFolder", { path, password });
};

// --- REMOTE URL UPLOAD ---
export const startRemoteUpload = async (url: string, path: string, password: string) => {
  // Attempt to extract filename from URL, fallback to generic name if failed
  // The backend can often detect the real name later, but this is required for the init request
  let filename = "downloaded_file";
  try {
      const urlObj = new URL(url);
      const extracted = urlObj.pathname.split('/').pop();
      if (extracted) filename = extracted;
  } catch (e) {
      // invalid url format, use default
  }

  return api.post("/api/startFileDownloadFromUrl", { 
    url, 
    path, 
    filename, 
    password,
    singleThreaded: false 
  });
};

// --- HELPER UTILITIES ---
export const getFileDownloadUrl = (path: string, id: string) => {
  // Construct the direct stream/download link
  return `${API_URL}/file?path=${path}${id}`;
};

export default api;
