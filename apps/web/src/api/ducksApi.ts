export interface DuckResponse {
  id: number;
  color: 'Red' | 'Green' | 'Yellow' | 'Black';
  size: 'XLarge' | 'Large' | 'Medium' | 'Small' | 'XSmall';
  price: number;
  quantity: number;
  version: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch<Record<string, unknown>>(() => ({}));
    throw { code: body.code ?? 'API_ERROR', message: body.message ?? `HTTP ${response.status}`, details: body.details } as ApiError;
  }
  if (response.status === 204) return {} as T;
  return response.json() as T;
};

export const ducksApi = {
  list: async (params?: { sort?: string; order?: 'asc' | 'desc' }) => {
    const url = new URL('/api/v1/ducks', window.location.origin);
    if (params?.sort) url.searchParams.set('sort', params.sort);
    if (params?.order) url.searchParams.set('order', params.order);
    return handleResponse<DuckResponse[]>(await fetch(url.href));
  },
  create: async (data: { color: string; size: string; price: number; quantity: number }) => {
    return handleResponse<DuckResponse>(
      await fetch('/api/v1/ducks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    );
  },
  update: async (id: number, data: { price: number; quantity: number; version: number }) => {
    return handleResponse<DuckResponse>(
      await fetch(`/api/v1/ducks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    );
  },
  delete: async (id: number) => {
    await handleResponse<void>(await fetch(`/api/v1/ducks/${id}`, { method: 'DELETE' }));
  },
};