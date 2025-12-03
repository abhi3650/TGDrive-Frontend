import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// --- AUTHENTICATION ---
export const checkPassword = async (password: string) => {
  return api.post("/api/checkPassword", { pass: password });
};

// --- DIRECTORY (UPDATED) ---
export const getDirectory = async (path: string, password: string) => {
  // 👇 THIS LINE IS THE FIX: Adds a timestamp to force fresh data
  return api.post(`/api/getDirectory?t=${Date.now()}`, { path, password });
};

// --- REST OF THE FILE (Keep as is) ---
export const createNewFolder = async (path: string, name: string, password: string) => {
  return api.post("/api/createNewFolder", { path, name, password });
};

export const renameFileFolder = async (path: string, name: string, password: string) => {
  return api.post("/api/renameFileFolder", { path, name, password });
};

export const deleteFileFolder = async (path: string, password: string) => {
  return api.post("/api/deleteFileFolder", { path, password });
};

export const startRemoteUpload = async (url: string, path: string, password: string) => {
  let filename = ""; 
  try {
      const decodedUrl = decodeURIComponent(url);
      const urlObj = new URL(decodedUrl);
      const extracted = urlObj.pathname.split('/').pop();
      if (extracted && extracted.includes('.')) {
          filename = extracted;
      }
  } catch (e) {}

  return api.post("/api/startFileDownloadFromUrl", { 
    url, 
    path, 
    filename,
    password,
    singleThreaded: false 
  });
};

export const getFileDownloadProgress = async (id: string, password: string) => {
  return api.post("/api/getFileDownloadProgress", { id, password });
};

export const getTelegramUploadProgress = async (id: string, password: string) => {
  return api.post("/api/getUploadProgress", { id, password });
};

export const getFileDownloadUrl = (path: string, id: string) => {
  return `${API_URL}/file?path=${path}${id}`;
};

export default api;
