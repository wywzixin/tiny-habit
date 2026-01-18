import { apiClient, ApiResponse } from './client';

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
  url: string;
  filename: string;
  originalFilename: string;
  size: string;
  contentType: string;
}

/**
 * 上传文件
 * POST /api/file/upload
 */
export const uploadFile = async (file: {
  uri: string;
  type: string;
  name: string;
}): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file as any);

  const response = await apiClient.post<ApiResponse<FileUploadResponse>>(
    '/api/file/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

/**
 * 删除文件
 * DELETE /api/file/delete
 */
export const deleteFile = async (filename: string): Promise<void> => {
  await apiClient.delete<ApiResponse<null>>('/api/file/delete', {
    params: { filename },
  });
};
