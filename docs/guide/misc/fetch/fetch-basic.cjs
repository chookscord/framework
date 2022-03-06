const { defineOnLoad } = require('chooksie')
const { fetch } = require('chooksie/fetch')

exports.chooksOnLoad = defineOnLoad(async ctx => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  const posts = await res.json()

  for (const post of posts) {
    ctx.logger.info(`Got post ID ${post.id}`)
  }
})
