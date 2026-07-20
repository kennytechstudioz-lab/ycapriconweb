const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
}

/**
 * A central, typed API client wrapper to make standardized backend network requests.
 * Handles automatic content-type mappings for regular JSON objects and FormData elements.
 *
 * @param endpoint The route endpoint (e.g. "/api/users/register" or full external URL)
 * @param options HTTP options containing method, headers, and request body elements
 */
export async function apiCall<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  // 1. Format targeted URL endpoint
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  const fetchOptions: RequestInit = {
    method,
    headers: { ...headers },
  };

  // 2. Format request payload
  if (body !== undefined) {
    if (body instanceof FormData) {
      // Let fetch set the boundary and content type automatically for multipart uploads
      fetchOptions.body = body;
    } else {
      // Stringify standard JSON request objects
      (fetchOptions.headers as Record<string, string>)["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(body);
    }
  }

  // 3. Dispatch HTTP request
  const response = await fetch(url, fetchOptions);

  // 4. Parse content-type response mapping
  let responseData: any;
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  // 5. Throw formatted error if response is not ok (e.g. status 400 or 500)
  if (!response.ok) {
    const errorMessage = responseData?.error || responseData || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return responseData as T;
}
