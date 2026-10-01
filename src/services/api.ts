// ==============================================================================
// Base API Client para CeCIP Paraná V1
// ==============================================================================

const API_BASE_URL = "";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const token = typeof window !== "undefined" ? localStorage.getItem("cecip_auth_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If body is FormData, delete Content-Type so the browser sets the boundary
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: response.statusText };
      }
      throw new ApiError(
        errorData.error || errorData.message || `Error en la solicitud (${response.status})`,
        response.status,
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Error en llamada API a ${endpoint}:`, error);
    throw new ApiError(error.message || "Error de red o conexión al servidor.", 500);
  }
}
