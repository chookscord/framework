import { createSpinner } from 'nanospinner'
import { writeFile } from 'node:fs/promises'
import { run, stringify } from './utils.js'
import kleur from 'kleur'

export async function writePackageJson(projectName: string): Promise<void> {
  const scripts = {
    dev: 'chooks',
    start: 'node dist',
    build: 'chooks build',
    register: 'chooks register',
  }

  const packageJson = stringify({
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts,
  })

  await writeFile('package.json', packageJson)
}

export async function writeEnv(token: string, guildId: string): Promise<void> {
  const env = `
# This will be your env file. Everything here should be kept secret.
# DO NOT COMMIT THIS FILE TO GIT!
#
# Every value here would be available via process.env,
# like process.env.BOT_TOKEN

# Your Discord bot token.
# **DO NOT SHARE THIS TOKEN TO ANYONE!!!**
#
# If someone unauthorized got a hold of your token,
# renew it IMMEDIATELY at https://discord.com/developers/applications
BOT_TOKEN=${token}

# The server id where you will be doing tests for your bot.
# This is required for development.
DEV_SERVER=${guildId}

# Feel free to add more custom key value pairs here.
# MY_KEY=my value
`.trimStart()

  await writeFile('.env', env)
}

export async function writeTsconfig(): Promise<void> {
  const tsconfig = stringify({
    compilerOptions: {
      lib: ['ES6'],
      module: 'CommonJS',
      moduleResolution: 'Node',
      strict: true,
      noEmit: true,
    },
    exclude: [
      'dist',
      'node_modules',
      '.chooks',
    ],
  })

  await writeFile('tsconfig.json', tsconfig)
}

// Required to resolve dotenv/config
export async function writeHoist(): Promise<void> {
  const config = 'shamefully-hoist = true'
  await writeFile('.npmrc', config)
}

export async function installDeps(installer: string, type: 'prod' | 'dev', ...deps: string[]): Promise<void> {
  const flag = type === 'dev' ? ' -D' : ''
  const depType = type === 'dev' ? 'dev dependencies' : 'dependencies'
  const spinner = createSpinner(`Installing ${depType}...`).start()

  try {
    await run(`${installer + flag} ${deps.join(' ')}`)
    spinner.success({ text: `Installed ${depType}.` })
  } catch {
    spinner.error({ text: `Failed to install ${depType}!` })
    console.error(`${kleur.yellow('ℹ')} Please add the following ${depType} manually!`)
    console.error(deps.map(dep => `- ${dep}`).join('\n'))
  }
}

export async function initGit(): Promise<void> {
  const spinner = createSpinner('Initializing git repo...').start()
  const gitignore = `
node_modules/

# Output directory
dist/

# Cache directory
.chooks/

# dotenv environment variable files
.env
.env*.local
`.trimStart()

  try {
    await run('git init')
    await writeFile('.gitignore', gitignore)
    spinner.success({ text: 'Initialized git repo.' })
  } catch {
    spinner.error({ text: 'Failed to initialize git repo!' })
  }
}
