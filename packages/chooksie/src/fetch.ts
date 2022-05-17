import type { ControlledAsyncIterable, RequestInfo, RequestInit, Response } from 'undici'

type Fetch = (...args: FetchParams) => Promise<Response>
declare const fetch: Fetch

let _fetch = fetch
if (typeof _fetch === 'undefined') {
  const undici = require(process.env.CHOOKSIE_UNDICI_PATH ?? 'undici') as typeof import('undici')
  _fetch = undici.fetch
}

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

const fetchUtil: FetchUtil = (() => {
  const util: FetchUtil = (...args) => {
    return wrapResponse(_fetch(...args))
  }

  util.get = wrapFetch('GET')
  util.post = wrapFetch('POST')
  util.put = wrapFetch('PUT')
  util.patch = wrapFetch('PATCH')
  util.delete = wrapFetch('DELETE')

  return util
})()

export { fetchUtil as fetch }
export default fetchUtil
