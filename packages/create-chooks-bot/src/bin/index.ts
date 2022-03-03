#! /usr/bin/env node
import kleur from 'kleur'
import { createSpinner } from 'nanospinner'
import { readdirSync } from 'node:fs'
import { cp } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pkgNameRegex from 'package-name-regex'
import prompts from 'prompts'
import { initGit, installDeps, rebuildStore, writeEnv, writeHoist, writePackageJson, writeTsconfig } from '../scripts.js'
import { mv, toTmp } from '../utils.js'

type PackageManager = 'npm' | 'yarn' | 'pnpm'

interface Result {
  name: string
  dirname?: string
  flavor: 'ts' | 'esm' | 'cjs'
  token: string
  server: string
  manager: PackageManager
  git: boolean
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const templates = join(__dirname, '..', '..', 'templates')
const isLocal = 'CHOOKSIE_CLI' in process.env

const INSTALL_SCRIPTS: Record<PackageManager, string> = {
  npm: 'npm i',
  yarn: 'yarn add',
  pnpm: 'pnpm add',
}

// If "chooks init" is run, shift input
const args = process.argv.slice(2)
const initPath = args[0] !== 'init'
  ? args[0]?.toLowerCase()
  : args[1]?.toLowerCase()

const onCancel = () => {
  console.info(`${kleur.red('✖')} Cancelled!`)
  process.exit(1)
}

function isEmpty(path: string) {
  try {
    return readdirSync(path).length === 0
  } catch {
    return true
  }
}

const canInitPathBeName = initPath && pkgNameRegex.test(initPath)
const response: Result = await prompts([
  {
    name: 'name',
    message: `${kleur.cyan('Enter project name')}:`,
    type: 'text',
    initial: canInitPathBeName ? initPath : 'chooksie-bot',
    validate: (value: string) => pkgNameRegex.test(value) || 'Invalid package.json name!',
  },
  {
    name: 'dirname',
    message: `${kleur.cyan('Enter directory')}:`,
    type: initPath && isEmpty(initPath) ? null : 'text',
    initial: (prev: string) => prev,
    validate: (dir: string) => isEmpty(dir) || 'Directory is not empty!',
  },
  {
    name: 'flavor',
    message: `${kleur.green('JavaScript Flavor')}:`,
    type: 'select',
    choices: [
      {
        title: kleur.cyan('TypeScript'),
        description: 'Recommended!',
        value: 'ts',
      },
      {
        title: kleur.green('ES Modules'),
        description: 'import, export',
        value: 'esm',
      },
      {
        title: kleur.yellow('CommonJS'),
        description: 'require, module.exports',
        value: 'cjs',
      },
    ],
  },
  {
    name: 'token',
    message: `${kleur.red('Bot Token')} (${kleur.dim('Optional.')})`,
    type: 'password',
  },
  {
    name: 'server',
    message: kleur.green('Dev Discord Server ID:'),
    type: 'text',
    validate: (id: string) => id.length === 18 && !Number.isNaN(id) || 'Invalid Server ID!',
  },
  {
    name: 'manager',
    message: kleur.green('Package Manager'),
    type: 'select',
    choices: [
      {
        title: kleur.red('NPM'),
        value: 'npm',
      },
      {
        title: kleur.cyan('Yarn'),
        value: 'yarn',
      },
      {
        title: kleur.yellow('PNPM'),
        value: 'pnpm',
      },
    ],
  },
  {
    name: 'git',
    message: 'Enable Git?',
    type: 'confirm',
    initial: 'y',
  },
], { onCancel })

const projectName = response.name
const projectDir = resolve(response.dirname ?? projectName)
const template = join(templates, response.flavor)
const token = response.token
const guildId = response.server
const pkgmanager = response.manager
const useGit = response.git

const closeTmp = await toTmp()
const tmpdir = process.cwd()
process.on('exit', closeTmp)

async function copyTemplate() {
  await cp(template, tmpdir, { recursive: true })
}

async function initTemplate() {
  const spinner = createSpinner('Initializing template...').start()
  const jobs: Promise<unknown>[] = []

  jobs.push(writeEnv(token, guildId))
  jobs.push(writePackageJson(projectName))
  jobs.push(copyTemplate())

  if (response.flavor === 'ts')
    jobs.push(writeTsconfig())

  if (response.manager === 'pnpm') {
    jobs.push(writeHoist())
  }

  try {
    await Promise.all(jobs)
    spinner.success({ text: 'Template initialized.' })
  } catch {
    spinner.error({ text: 'Failed to initialize template!' })
    process.exit(1)
  }
}

await initTemplate()

if (useGit)
  await initGit()

const installer = INSTALL_SCRIPTS[pkgmanager]
await installDeps(installer, 'prod', 'discord.js', 'chooksie')

// If user didn't use "chooks init", add the cli as dev dep
if (!isLocal)
  await installDeps(installer, 'dev', '@chookscord/cli')

await mv(tmpdir, projectDir)

if (pkgmanager === 'pnpm') {
  process.chdir(projectDir)
  await rebuildStore()
}
