import { walk } from 'chooksie/internals'
import { cp, readdir } from 'fs/promises'
import { join } from 'path'
import { compile, write } from './lib/compile'
import type { SourceMap } from './lib/sourcemap'
import { mapSourceFile } from './lib/sourcemap'
import { resolveConfigFile } from './server/resolve-config'

const root = process.cwd()
const outDir = join(root, 'dist')

const toSourceMap = mapSourceFile({
  root,
  outDir,
})

const ignored = [
  'dist',
  'node_modules',
  '.chooks',
]

async function transform(file: SourceMap) {
  const output = await compile(file)
  await write(file, output.code)
}

function time() {
  const start = process.hrtime()
  return () => {
    const [secs, nsecs] = process.hrtime(start)
    const msecs = Math.floor(nsecs / 1e6)
    return secs > 0 ? `${secs}.${msecs}s` : `${msecs}ms`
  }
}

async function build(): Promise<void> {
  console.info('Starting production build...')
  const measure = time()
  const rootFiles = await readdir(root, { withFileTypes: true })
  const config = await resolveConfigFile({ root, outDir }, rootFiles)

  // @todo: module validation
  const jobList = rootFiles
    .filter(file => file.isDirectory() && !ignored.includes(file.name))
    .map(async dir => {
      const filePath = join(root, dir.name)

      const files = walk(filePath, { ignore: file => !/\.(m|c)?js|(?<!\.d)\.(m|c)?ts/.test(file.name) })
      const jobs: Promise<unknown>[] = []

      for await (const file of files) {
        const map = toSourceMap(file.path)
        jobs.push(transform(map))
      }

      return Promise.all(jobs)
    })

  await transform(config)
  await cp(join(__dirname, './build-target.js'), join(outDir, 'index.js'))
  const res = await Promise.all(jobList)
  const elapsed = measure()

  console.info(`Wrote %d files to ${outDir}`, res.flat().length + 2)
  console.info('Time Took: %s', elapsed)
}

export = build
