import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

// --- FILE MANAGEMENT ---
export const createNewFolder = async (path: string, name: string, password: string) => {
  return api.post("/api/createNewFolder", { path, name, password });
};

export const renameFileFolder = async (path: string, name: string, password: string) => {
  return api.post("/api/renameFileFolder", { path, name, password });
};

export const deleteFileFolder = async (path: string, password: string) => {
  return api.post("/api/deleteFileFolder", { path, password });
};

// --- REMOTE URL UPLOAD (FIXED) ---
export const startRemoteUpload = async (url: string, path: string, password: string) => {
  let filename = ""; // Default to empty string (Backend will Auto-Detect)

  try {
      const decodedUrl = decodeURIComponent(url);
      const urlObj = new URL(decodedUrl);
      const extracted = urlObj.pathname.split('/').pop();
      
      // Only use the name from URL if it has an extension (e.g. video.mp4)
      if (extracted && extracted.includes('.')) {
          filename = extracted;
      }
  } catch (e) {
      // If URL parsing fails, stick to empty string
  }

  return api.post("/api/startFileDownloadFromUrl", { 
    url, 
    path, 
    filename, // Sends "" if unknown
    password,
    singleThreaded: false 
  });
};

// --- PROGRESS TRACKING ---
export const getFileDownloadProgress = async (id: string, password: string) => {
  return api.post("/api/getFileDownloadProgress", { id, password });
};

export const getTelegramUploadProgress = async (id: string, password: string) => {
  return api.post("/api/getUploadProgress", { id, password });
};

// --- HELPER UTILITIES ---
export const getFileDownloadUrl = (path: string, id: string) => {
  return `${API_URL}/file?path=${path}${id}`;
};

export default api;
