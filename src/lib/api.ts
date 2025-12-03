import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// ... (Keep existing authentication and folder logic) ...

export const checkPassword = async (password: string) => {
  return api.post("/api/checkPassword", { pass: password });
};

export const getDirectory = async (path: string, password: string) => {
  return api.post("/api/getDirectory", { path, password });
};

export const createNewFolder = async (path: string, name: string, password: string) => {
  return api.post("/api/createNewFolder", { path, name, password });
};

export const renameFileFolder = async (path: string, name: string, password: string) => {
  return api.post("/api/renameFileFolder", { path, name, password });
};

export const deleteFileFolder = async (path: string, password: string) => {
  return api.post("/api/deleteFileFolder", { path, password });
};

// --- REMOTE UPLOAD ---

export const startRemoteUpload = async (url: string, path: string, password: string) => {
  let filename = "downloaded_file";
  try {
      const urlObj = new URL(url);
      const extracted = urlObj.pathname.split('/').pop();
      if (extracted) filename = extracted;
  } catch (e) {}

  return api.post("/api/startFileDownloadFromUrl", { 
    url, 
    path, 
    filename, 
    password,
    singleThreaded: false 
  });
};

// New: Check "Download from URL" progress (Stage 1)
export const getFileDownloadProgress = async (id: string, password: string) => {
  return api.post("/api/getFileDownloadProgress", { id, password });
};

// New: Check "Upload to Telegram" progress (Stage 2)
export const getTelegramUploadProgress = async (id: string, password: string) => {
  return api.post("/api/getUploadProgress", { id, password });
};

export const getFileDownloadUrl = (path: string, id: string) => {
  return `${API_URL}/file?path=${path}${id}`;
};

export default api;
