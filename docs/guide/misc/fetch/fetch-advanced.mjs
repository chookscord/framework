import { defineOnLoad } from 'chooksie'
import { fetch } from 'chooksie/fetch'

export const chooksOnLoad = defineOnLoad(async ctx => {
  // Send a GET request and convert response to JSON
  const posts = await fetch('https://jsonplaceholder.typicode.com/posts').json()
  ctx.logger.info(`Got ${posts.length} posts.`)

  // Send a POST request and access the Response object
  const res = await fetch.post('https://jsonplaceholder.typicode.com/posts', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'foo',
      body: 'bar',
      userId: 1,
    }),
  })

  ctx.logger.info(`API responded with status ${res.status}.`)

  // Send a PATCH request and convert response to JSON
  const patched = await fetch
    .patch('https://jsonplaceholder.typicode.com/posts/1', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'foo' }),
    })
    .json()

  ctx.logger.info(`Updated post ID ${patched.id}`)
})
