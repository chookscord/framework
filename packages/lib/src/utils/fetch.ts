import _fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type FetchParams = [url: RequestInfo, init?: RequestInit];

export type WrappedRequest<T = unknown> = PromiseLike<Response> & { json: () => Promise<T> };
export type WrappedFetch = <T = unknown>(...args: FetchParams) => WrappedRequest<T>;
export type FetchUtil = WrappedFetch & Record<Lowercase<Method>, WrappedFetch>;

function wrapResponse<T>(request: Promise<Response>): WrappedRequest<T> {
  return {
    async json() {
      const res = await request;
      return res.json();
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
