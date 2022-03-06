import { defineOnLoad } from 'chooksie'
import { fetch } from 'chooksie/fetch'

export const chooksOnLoad = defineOnLoad(async ctx => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  const posts = await res.json()

  for (const post of posts) {
    ctx.logger.info(`Got post ID ${post.id}`)
  }
})
