import type { DefaultThemeOptions } from 'vuepress-vite'
import { defineUserConfig } from 'vuepress-vite'

// eslint-disable-next-line @typescript-eslint/no-shadow
const link = (text: string, link: string) => ({ text, link })

export default defineUserConfig<DefaultThemeOptions>({
  lang: 'en-US',
  title: 'Chooksie',
  description: 'Fast Discord.JS Framework',
  head: [
    ['meta', { property: 'theme-color', content: '#3aa675' }],
  ],
  themeConfig: {
    contributors: false,
    repo: 'chookscord/framework',
    docsDir: 'docs/guide',
    sidebar: [
      {
        text: 'Home',
        children: [
          link('Introduction', '/introduction/'),
          link('Getting Started', '/getting-started/'),
          link('Configuration', '/configuration/'),
        ],
      },
      {
        text: 'Features',
        children: [
          link('Using the CLI Tool', '/features/cli-tool/'),
          link('Slash Commands', '/features/slash-commands/'),
          link('Slash Subcommands', '/features/slash-subcommands/'),
          link('User Commands', '/features/user-commands/'),
          link('Message Commands', '/features/message-commands/'),
          link('Event Listeners', '/features/event-listeners/'),
          link('Autocompletes', '/features/autocompletes/'),
        ],
      },
      {
        text: 'Advanced',
        children: [
          link('Setup Method', '/advanced/setup/'),
          link('External Scripts', '/advanced/scripts/'),
          link('Database and Servers', '/advanced/database-servers/'),
          link('Usage with TypeScript', '/advanced/typescript/'),
        ],
      },
    ],
  },
})
