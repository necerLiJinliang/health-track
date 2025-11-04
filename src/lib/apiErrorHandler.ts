// src/lib/apiErrorHandler.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = async (response: Response): Promise<never> => {
  const contentType = response.headers.get('content-type');
  let errorMessage = 'An unknown error occurred';
  let errorCode: string | undefined;

  if (contentType && contentType.includes('application/json')) {
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
      errorCode = errorData.code;
    } catch (e) {
      // 如果JSON解析失败，使用默认错误消息
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
  } else {
    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
  }

  throw new ApiError(response.status, errorMessage, errorCode);
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};