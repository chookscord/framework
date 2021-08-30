import _fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type FetchParams = [url: RequestInfo, init?: RequestInit];

export interface ErrorResponse {
  ok: 0;
  status: number;
  error: Error;
}

export interface SuccessResponse<T> {
  ok: 1;
  status: number;
  data: T;
}

export type WrappedFetch = <T = unknown>(
  url: RequestInfo,
  init?: Omit<RequestInit, 'method'>
) => Promise<ErrorResponse | SuccessResponse<T>>;

export type FetchUtil =
  ((...args: FetchParams) => Promise<Response>) &
  Record<Lowercase<Method>, WrappedFetch>;

const createErrorResponse = (
  status: number,
  error: Error,
): ErrorResponse => {
  return { ok: 0, status, error };
};

const createSuccessResponse = <T>(
  status: number,
  data: T,
): SuccessResponse<T> => {
  return { ok: 1, status, data };
};

export const fetch: FetchUtil = (url, init = {}) => {
  return _fetch(url, init);
};

const createFetchWrapper = (method: Method): WrappedFetch => {
  return async (url, init = {}) => {
    const response = await _fetch(url, {
      ...init,
      method,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        ...init?.headers,
      },
    });

    if (response.status < 200 && response.status >= 400) {
      return createErrorResponse(
        response.status,
        new Error(`${response.status} ${response.statusText}`),
      );
    }

    try {
      const data = await response.json();
      return createSuccessResponse(response.status, data);
    } catch {
      return createErrorResponse(
        response.status,
        new Error('Failed to convert response data! Are you sure you\'re fetching JSON? If not then manually use ctx.fetch().'),
      );
    }
  };
};

fetch.get = createFetchWrapper('GET');
fetch.post = createFetchWrapper('POST');
fetch.put = createFetchWrapper('PUT');
fetch.patch = createFetchWrapper('PATCH');
fetch.delete = createFetchWrapper('DELETE');
