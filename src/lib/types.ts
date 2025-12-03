export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size: number;
  path: string;
  upload_date?: string;
}

export interface DirectoryData {
  contents: Record<string, FileItem>;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}
