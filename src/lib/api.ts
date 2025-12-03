import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

export const checkPassword = async (password: string) => {
  return api.post("/api/checkPassword", { pass: password });
};

export const getDirectory = async (path: string, password: string) => {
  return api.post("/api/getDirectory", { path, password });
};

export const getFileDownloadUrl = (path: string, id: string) => {
  return `${API_URL}/file?path=${path}${id}`;
};

export default api;
