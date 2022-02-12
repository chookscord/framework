import type { Event, MessageCommand, SlashCommand, SlashSubcommand, UserCommand } from 'chooksie'
import { timer, walk } from 'chooksie/internals'
import type { ClientEvents } from 'discord.js'
import type { Dirent } from 'fs'
import { cp, readdir } from 'fs/promises'
import { join } from 'path'
import type { SourceMap } from '../lib'
import { compile, mapSourceFile, resolveConfigFile, write } from '../lib'
import { validateEvent, validateMessageCommand, validateSlashCommand, validateSlashSubcommand, validateUserCommand } from '../lib/validation'

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

async function validateModule(file: SourceMap) {
  const mod = (await import(file.target) as { default: unknown }).default

  if (file.type === 'command') {
    await validateSlashCommand(mod as SlashCommand)
    return
  }

  if (file.type === 'subcommand') {
    await validateSlashSubcommand(mod as SlashSubcommand)
    return
  }

  if (file.type === 'user') {
    await validateUserCommand(mod as UserCommand)
    return
  }

  if (file.type === 'message') {
    await validateMessageCommand(mod as MessageCommand)
    return
  }

  if (file.type === 'event') {
    await validateEvent(mod as Event<keyof ClientEvents>)
    return
  }
}

async function transform(file: SourceMap) {
  const output = await compile(file)
  await write(file, output.code)

  if (file.type !== 'config' && file.type !== 'script') {
    await validateModule(file)
  }
}

async function copyEntrypoint() {
  await cp(join(__dirname, './build-target.js'), join(outDir, 'index.js'))
}

async function compileConfigFile(files: Dirent[]) {
  const config = await resolveConfigFile({ root, outDir }, files)
  await transform(config)
}

async function build(): Promise<void> {
  console.info('Starting production build...')
  const measure = timer()
  const rootFiles = await readdir(root, { withFileTypes: true })

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

  const jobCopy = copyEntrypoint()
  const jobConfig = compileConfigFile(rootFiles)

  const res = await Promise.all([...jobList, jobConfig, jobCopy])
  const elapsed = measure()

  console.info(`Wrote ${res.flat().length} files to ${outDir}`)
  console.info(`Time Took: ${elapsed}`)

  process.exit(0)
}

export = build
