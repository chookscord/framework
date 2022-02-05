const command = process.argv.slice(2)[0]

if (command === 'build') {
  const build = require('../build')
  void build()
} else {
  const error = new Error('Invalid command.')
  console.error(error)
  process.exit(1)
}