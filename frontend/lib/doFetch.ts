import { useRouter } from 'next/router';
import { useGlobalLoader } from '@/store/useGlobalLoader';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface doFetchOptions<T> extends Omit<RequestInit, 'method' | 'body'> {
  method?: HttpMethod;
  body?: T;
  requiresAuth?: boolean;
  isFormData?: boolean;
}

export const doFetch = async <T = unknown, R = unknown>(
  url: string,
  options: doFetchOptions<T> = {},
  retry = true
): Promise<R> => {
  const {
    method = 'GET',
    body,
    requiresAuth = true,
    isFormData = false,
    headers = {},
    ...rest
  } = options;

  const { startLoading, stopLoading } = useGlobalLoader.getState(); // ✅ add this

  const finalHeaders: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...headers,
  };

  const requestInit: RequestInit = {
    method,
    headers: finalHeaders,
    credentials: 'include',
    ...rest,
  };

  if (method !== 'GET' && body !== undefined) {
    requestInit.body = isFormData ? (body as BodyInit) : JSON.stringify(body);
  }

  startLoading(); 
  try {
    const response = await fetch(url, requestInit);

    if (response.status === 401 && retry && requiresAuth) {
      try {
        await fetch(`${API_URL}/api/users/refresh-token`, {
          method: 'POST',
          credentials: 'include',
        });

        return doFetch<T, R>(url, options, false);
      } catch (_err) {
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/useAuthStore');
          await useAuthStore.getState().logout();

          const router = (await import('next/router')).default;
          router.push('/?login=true');
        }
        throw new Error('Session expired. Please log in again.');
      }
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error('Failed to parse server response.');
    }

    if (!response.ok) {
      const message =
        (data as Record<string, string>)?.error ||
        (data as Record<string, string>)?.message ||
        `Request failed with status ${response.status}`;
      const error = new Error(message) as Error & { response?: { data: unknown } };
      error.response = { data };
      throw error;
    }

    return data as R;
  } finally {
    stopLoading(); 
  }
};

export const fetchApi = {
  get: async <TResponse = unknown>(
    url: string,
    options?: Omit<RequestInit, 'method' | 'body'> & { requiresAuth?: boolean;isFormData?: boolean }
  ): Promise<TResponse> =>
    doFetch<never, TResponse>(`${API_URL}/${url}`, {
      ...options,
      method: 'GET',
      credentials: 'include',
    }),

  post: async <TBody = unknown, TResponse = unknown>(
    url: string,
    body: TBody,
    toBackend: boolean = true,
    options?: Omit<RequestInit, 'method' | 'body'> & { requiresAuth?: boolean;isFormData?: boolean }
  ): Promise<TResponse> =>
    doFetch<TBody, TResponse>(`${toBackend ? API_URL : ''}/${url}`, {
      ...options,
      method: 'POST',
      body,
      credentials: 'include',
    }),

  put: async <TBody = unknown, TResponse = unknown>(
    url: string,
    body: TBody,
    toBackend: boolean = true,
    options?: Omit<RequestInit, 'method' | 'body'> & { requiresAuth?: boolean;isFormData?: boolean }
  ): Promise<TResponse> =>
    doFetch<TBody, TResponse>(`${toBackend ? API_URL : ''}/${url}`, {
      ...options,
      method: 'PUT',
      body,
      credentials: 'include',
    }),

  patch: async <TBody = unknown, TResponse = unknown>(
    url: string,
    body: TBody,
    toBackend: boolean = true,
    options?: Omit<RequestInit, 'method' | 'body'> & { requiresAuth?: boolean;isFormData?: boolean }
  ): Promise<TResponse> =>
    doFetch<TBody, TResponse>(`${toBackend ? API_URL : ''}/${url}`, {
      ...options,
      method: 'PATCH',
      body,
      credentials: 'include',
    }),

  delete: async <TBody = unknown, TResponse = unknown>(
    url: string,
    body: TBody,
    toBackend: boolean = true,
    options?: Omit<RequestInit, 'method' | 'body'> & { requiresAuth?: boolean ;isFormData?: boolean }
  ): Promise<TResponse> =>
    doFetch<TBody, TResponse>(`${toBackend ? API_URL : ''}/${url}`, {
      ...options,
      method: 'DELETE',
      body,
      credentials: 'include',
    }),
};
