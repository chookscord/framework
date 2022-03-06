import kleur from 'kleur'
import { writeFile } from 'node:fs/promises'
import { run, stringify } from './utils.js'

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

export async function installDeps(installer: string, type: 'prod' | 'dev', ...deps: string[]): Promise<void> {
  const flag = type === 'dev' ? ' -D' : ''
  const depType = type === 'dev' ? 'dev dependencies' : 'dependencies'

  await run({
    message: `Installing ${depType}...`,
    success: `Installed ${depType}.`,
    error: `Failed to install ${depType}!`,
    exec: exec => exec(`${installer + flag} ${deps.join(' ')}`),
    onError: () => {
      console.error(`${kleur.yellow('ℹ')} Please add the following ${depType} manually!`)
      console.error(deps.map(dep => `- ${dep}`).join('\n'))
    },
  })
}

export async function initGit(): Promise<void> {
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

  await run({
    message: 'Initializing git repo...',
    success: 'Initialized git repo.',
    error: 'Failed to initialize git repo!',
    exec: async exec => {
      await exec('git init')
      await writeFile('.gitignore', gitignore)
    },
  })
}

export async function rebuildStore(): Promise<void> {
  await run({
    message: 'Doing some final cleanup...',
    success: 'Rebuilt PNPM store.',
    error: 'Failed to rebuild PNPM store!',
    exec: exec => exec('pnpm install'),
  })
}
