import type { Response, RequestInfo, RequestInit, ControlledAsyncIterable } from 'undici'
import { fetch as _fetch } from 'undici'

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type FetchParams = [url: RequestInfo, init?: RequestInit]

export type WrappedRequest<T = unknown> =
Pick<Response, 'text' | 'blob' | 'arrayBuffer'> &
PromiseLike<Response> & {
  json: () => Promise<T>
  body: Promise<ControlledAsyncIterable | null>
}

export type WrappedFetch = <T = unknown>(...args: FetchParams) => WrappedRequest<T>
export type FetchUtil = WrappedFetch & Record<Lowercase<Method>, WrappedFetch>

function wrapResponse<T>(response: Promise<Response>): WrappedRequest<T> {
  const body = <Body extends 'json' | 'blob' | 'text' | 'arrayBuffer'>(key: Body) => {
    return response.then(res => res[key]()) as ReturnType<Response[Body]>
  }
  return {
    json: () => body('json') as Promise<T>,
    blob: () => body('blob'),
    text: () => body('text'),
    arrayBuffer: () => body('arrayBuffer'),
    get body() {
      return response.then(res => res.body)
    },
    then: (onfulfilled, onrejected) => response
      .then(onfulfilled)
      .catch(onrejected),
  }
}

function wrapFetch(method: Method): WrappedFetch {
  return (url, init = {}) => {
    const response = _fetch(url, { ...init, method })
    return wrapResponse(response)
  }
}

export const fetch: FetchUtil = (() => {
  const fetchUtil: FetchUtil = (...args) => {
    return wrapResponse(_fetch(...args))
  }

  fetchUtil.get = wrapFetch('GET')
  fetchUtil.post = wrapFetch('POST')
  fetchUtil.put = wrapFetch('PUT')
  fetchUtil.patch = wrapFetch('PATCH')
  fetchUtil.delete = wrapFetch('DELETE')

  return fetchUtil
})()

export default fetch
