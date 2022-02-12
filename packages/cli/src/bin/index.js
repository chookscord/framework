const command = process.argv.slice(2)[0]

if (!command) {
  const createServer = require('../server')
  void createServer()
} else if (command === 'build') {
  const build = require('../build')
  void build()
} else if (command === 'register') {
  const register = require('../register')
  void register()
} else {
  const error = new Error('Invalid command.')
  console.error(error)
  process.exit(1)
}
