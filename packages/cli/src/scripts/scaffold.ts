/* eslint-disable complexity */
import { existsSync, readdirSync } from 'fs';
import { createSpinner } from 'nanospinner';
import { exec } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import pc from 'picocolors';
import pkgNameRegex from 'package-name-regex';
import prompts from 'prompts';

type Ext = 'js' | 'ts';
type Mod = `${'c' | 'm'}${Ext}`;

const INSTALL_COMMANDS = {
  npm: 'npm i',
  yarn: 'yarn add',
};

const COMMANDS = {
  npm: ['npm run', 'npm'],
  yarn: ['yarn', 'yarn'],
};

const DEPENDENCIES = [
  // 'chooksie',
  'discord.js',
].join(' ');

function isEmpty(dir: string) {
  return !existsSync(dir) || !readdirSync(dir).length;
}

function spin(message: string) {
  return createSpinner().start({ text: message });
}

function execCommand(command: string) {
  return new Promise((res, rej) => {
    exec(command, error => {
      const resolve = error ? rej : res;
      resolve(error);
    });
  });
}

async function traverse(
  src: string,
  dest: string,
  options: {
    dir?: (newSrc: string, newDest: string) => Promise<unknown> | unknown;
    file?: (newSrc: string, newDest: string) => Promise<unknown> | unknown;
  } = {},
) {
  await fs.mkdir(dest, { recursive: true });
  for await (const dirent of await fs.opendir(src)) {
    const newSrc = path.join(src, dirent.name);
    const newDest = path.join(dest, dirent.name);

    if (dirent.isDirectory()) {
      await traverse(newSrc, newDest, options);
      await options.dir?.(newSrc, newDest);
    } else {
      await options.file?.(newSrc, newDest);
    }
  }
}

function copyTemplate(
  src: string,
  dest: string,
  output: (filePath: string) => string | null,
) {
  return traverse(src, dest, {
    file: (newSrc, newDest) => {
      const target = output(newDest);
      if (target) {
        fs.copyFile(newSrc, target);
      }
    },
  });
}

function mvDir(src: string, dest: string) {
  return traverse(src, dest, {
    dir: newSrc => fs.rm(newSrc, { recursive: true }),
    file: async (newSrc, newDest) => {
      await fs.copyFile(newSrc, newDest);
      await fs.rm(newSrc);
    },
  });
}

async function writePackageJson(filePath: string, projectName: string, isModule: boolean) {
  await fs.writeFile(filePath, JSON.stringify({
    name: projectName,
    version: '0.1.0',
    license: 'MIT',
    type: isModule ? 'module' : undefined,
    scripts: {
      dev: 'chooks',
      build: 'chooks build',
      register: 'chooks register',
      start: 'node dist',
    },
  }, null, 2));
}

function prompt(initPath: string) {
  const isNameValid = initPath && pkgNameRegex.test(initPath);

  return prompts([
    {
      type: 'text',
      name: 'name',
      message: `Enter ${pc.cyan('project name')}:`,
      initial: isNameValid ? initPath : 'chooksie-bot',
      validate: (value: string) => pkgNameRegex.test(value) || 'Invalid package.json name!',
    },
    {
      type: initPath && isEmpty(initPath) ? null : 'text',
      name: 'dirname',
      message: `Enter ${pc.yellow('directory')}:`,
      initial: prev => prev,
      validate: (dir: string) => isEmpty(dir) || 'Directory is not empty!',
    },
    {
      type: 'select',
      name: 'language',
      message: `Select a ${pc.cyan('language')}:`,
      choices: [
        {
          title: pc.cyan('TypeScript'),
          value: 'ts',
        },
        {
          title: pc.yellow('JavaScript'),
          value: 'js',
        },
      ],
    },
    {
      type: 'select',
      name: 'module',
      message: `Select ${pc.yellow('module type')}:`,
      choices: [
        {
          title: pc.yellow('CommonJS'),
          description: 'require, module.exports',
          value: 'c',
        },
        {
          title: pc.cyan('ES Module'),
          description: 'import, export',
          value: 'm',
        },
      ],
    },
    {
      type: 'confirm',
      name: 'credentials',
      message: `Enter your ${pc.cyan('bot credentials')} now?`,
    },
    {
      type: (prev: boolean) => prev ? 'invisible' : null,
      name: 'token',
      message: `${pc.yellow('Bot token')}:`,
      validate: (token: string) => token.length === 59,
    },
    {
      type: (prev: string | boolean) => typeof prev === 'string' ? 'text' : null,
      name: 'id',
      message: `${pc.cyan('Application ID')}:`,
      validate: (id: string) => !isNaN(id as never) && id.length === 18,
    },
    {
      type: 'text',
      name: 'guild',
      message: `Discord ${pc.yellow('Server ID')} for testing (optional):`,
      validate: (id: string) => id === '' || !isNaN(id as never) && id.length === 18,
    },
    {
      type: 'select',
      name: 'manager',
      message: `Select ${pc.cyan('package manager')}:`,
      choices: [
        {
          title: pc.cyan('yarn'),
          value: 'yarn',
        },
        {
          title: pc.red('npm'),
          value: 'npm',
        },
      ],
    },
    {
      type: 'confirm',
      name: 'vc',
      message: `Create a new ${pc.yellow('git')} repository?`,
      initial: true,
    },
  ], {
    onCancel: () => {
      console.error(pc.red('error'), 'Cancelled.');
      process.exit(1);
    },
  });
}

export async function run(): Promise<void> {
  const initPath = process.argv[3]?.toLowerCase();

  const answer = await prompt(initPath);
  console.log();

  const projectName: string = answer.name;
  const projectRoot = path.resolve(answer.dirname as string ?? initPath);
  const manager: 'yarn' | 'npm' = answer.manager;

  const input = (...paths: string[]) => path.join(__dirname, '../../templates', ...paths);
  const to = (...paths: string[]) => path.join(projectRoot, ...paths);

  const lang: 'js' | 'ts' = answer.language;
  const mod: 'c' | 'm' = answer.module;
  const ext: Mod = `${mod}${lang}`;

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'chooksie-'));
  const tmp = (...paths: string[]) => path.join(tmpDir, ...paths);
  process.chdir(tmp());

  if (answer.vc) {
    const git = spin(`Initializing ${pc.green('git')}...`);
    try {
      await execCommand('git init');
      await fs.copyFile(input('_gitignore'), tmp('.gitignore'));
      git.success({ text: `${pc.green('Git')} initialized.` });
    } catch {
      git.error({ text: pc.red('Failed to initialize git repository!') });
    }
  }

  const [cmdRun, cmdStart] = COMMANDS[manager];
  let readme = await fs.readFile(input('README.md'), 'utf-8');
  let env = await fs.readFile(input('_env'), 'utf-8');

  readme = readme.replace(/\{project_name\}/g, projectName);
  readme = readme.replace(/\{manager_run\}/g, cmdRun);
  readme = readme.replace(/\{manager_start\}/g, cmdStart);
  readme = readme.replace(/\{lang\}/g, lang);

  if (answer.credentials) {
    env = env.replace('DISCORD_BOT_TOKEN=', `DISCORD_BOT_TOKEN=${answer.token}`);
    env = env.replace('DISCORD_APP_ID=', `DISCORD_APP_ID=${answer.id}`);
  }

  if (answer.guild) {
    env = env.replace('DISCORD_DEV_SERVER=', `DISCORD_DEV_SERVER=${answer.guild}`);
  }

  const prepare = spin(`Preparing ${pc.green('project')}...`);
  try {
    await fs.writeFile(tmp('README.md'), readme);
    await fs.writeFile(tmp('.env'), env);
    await copyTemplate(
      input(),
      tmp(),
      filePath => filePath.endsWith(`.${ext}`)
        ? filePath.replace(/\.[cm][tj]s$/, `.${lang}`)
        : null,
    );
    prepare.success({ text: `${pc.green('Project')} ready.` });
  } catch (error) {
    prepare.error({ text: pc.red('Could not setup project!') });
    if (error instanceof Error) {
      console.error(pc.red('error'), error.message);
    }
    process.exit(1);
  }

  const install = spin(`Installing ${pc.green('dependencies')}...`);
  try {
    await writePackageJson(tmp('package.json'), projectName, mod === 'm');
    await execCommand(`${INSTALL_COMMANDS[manager]} ${DEPENDENCIES}`);
    install.success({ text: `${pc.green('Dependencies')} installed.` });
  } catch (error) {
    install.error({ text: pc.red('Failed to install dependencies!') });
    if (error instanceof Error) {
      console.error(pc.red('error'), error.message);
    }
    process.exit(1);
  }

  await mvDir(tmp(), to());

  console.info();
  console.info(pc.green(`Created a new bot in ${to()}`));
  console.info();

  if (!answer.credentials) {
    console.info(`  To run your bot, remember to configure your ${pc.cyan('bot credentials')}!\n`);
  }

  if (!answer.guild) {
    console.info(`  To start your bot in ${pc.yellow('dev mode')}, make sure to add a dev server id in your config file!\n`);
  }

  console.info(`  For more info, check the generated ${pc.green('README.md')} file in the project's root.\n`);
}
