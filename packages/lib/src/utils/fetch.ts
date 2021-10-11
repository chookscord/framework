import _fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type FetchParams = [url: RequestInfo, init?: RequestInit];

export type WrappedRequest<T = unknown> =
Pick<Response, 'text' | 'blob' | 'arrayBuffer'> &
PromiseLike<Response> & {
  json: () => Promise<T>;
  body: Promise<NodeJS.ReadableStream | null>;
};

export type WrappedFetch = <T = unknown>(...args: FetchParams) => WrappedRequest<T>;
export type FetchUtil = WrappedFetch & Record<Lowercase<Method>, WrappedFetch>;

function wrapResponse<T>(request: Promise<Response>): WrappedRequest<T> {
  const execute = <Body extends 'json' | 'blob' | 'text' | 'arrayBuffer'>(key: Body) => {
    return request.then(res => res[key]()) as ReturnType<Response[Body]>;
  };

  return {
    json: () => execute('json') as Promise<T>,
    blob: () => execute('blob'),
    text: () => execute('text'),
    arrayBuffer: () => execute('arrayBuffer'),
    get body() {
      return request.then(res => res.body);
    },
    then(onfulfilled, onrejected) {
      return request
        .then(onfulfilled)
        .catch(onrejected);
    },
  };
}

function wrapFetch(method: Method): WrappedFetch {
  return (url, init = {}) => wrapResponse(_fetch(url, {
    ...init,
    method,
  }));
}

export const fetch: FetchUtil = (() => {
  const fetchUtil: FetchUtil = (...args) => {
    return wrapResponse(_fetch(...args));
  };

  fetchUtil.get = wrapFetch('GET');
  fetchUtil.post = wrapFetch('POST');
  fetchUtil.put = wrapFetch('PUT');
  fetchUtil.patch = wrapFetch('PATCH');
  fetchUtil.delete = wrapFetch('DELETE');

  return fetchUtil;
})();
