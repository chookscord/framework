const { defineOption, defineSlashSubcommand, defineSubcommand } = require('chooksie')
const { Op } = require('sequelize')

function db() {
  // Only expose the Tag model from our database
  const { Tag } = require('../db')
  return Tag
}

// Reference: https://discordjs.guide/sequelize/#delta-adding-a-tag
const addTag = defineSubcommand({
  name: 'add',
  description: 'Add a tag.',
  type: 'SUB_COMMAND',
  setup: db,
  async execute(ctx) {
    const tagName = ctx.interaction.options.getString('name', true)
    const tagDescription = ctx.interaction.options.getString('description', true)

    try {
      // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
      const tag = await this.create({
        name: tagName,
        description: tagDescription,
        username: ctx.interaction.user.username,
      })

      await ctx.interaction.reply(`Tag ${tag.name} added.`)
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        await ctx.interaction.reply('That tag already exists.')
        return
      }

      await ctx.interaction.reply('Something went wrong with adding a tag.')
    }
  },
  options: [
    {
      name: 'name',
      description: 'Name of the tag.',
      type: 'STRING',
      required: true,
    },
    {
      name: 'description',
      description: 'Description of the tag.',
      type: 'STRING',
      required: true,
    },
  ],
})

// Reference: https://discordjs.guide/sequelize/#epsilon-fetching-a-tag
const fetchTag = defineSubcommand({
  name: 'fetch',
  description: 'Fetch a tag.',
  type: 'SUB_COMMAND',
  setup: db,
  async execute(ctx) {
    const tagName = ctx.interaction.options.getString('name', true)

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const tag = await this.findOne({ where: { name: tagName } })

    if (tag) {
      // equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
      await tag.increment('usageCount')

      await ctx.interaction.reply(tag.get('description'))
      return
    }

    await ctx.interaction.reply(`Could not find tag: ${tagName}`)
  },
  options: [
    defineOption({
      name: 'name',
      description: 'The name of the tag.',
      type: 'STRING',
      required: true,
      setup: db,
      async autocomplete(ctx) {
        const tagName = ctx.interaction.options.getFocused()
        // equivalent to: SELECT * FROM tags WHERE name LIKE '%tagName%'
        const tags = await this.findAll({ where: { name: { [Op.like]: `%${tagName}%` } } })

        // Map similar tags we found into something Discord can use
        const tagList = tags.map(tag => ({
          name: `${tag.name} - ${tag.description}`,
          value: tag.name,
        }))

        await ctx.interaction.respond(tagList)
      },
    }),
  ],
})

module.exports = defineSlashSubcommand({
  name: 'tag',
  description: 'Manage tags.',
  options: [
    addTag,
    fetchTag,
  ],
})
