import { defineOnLoad } from 'chooksie'
import type { CreationOptional } from 'sequelize'
import { DataTypes, Model, Sequelize } from 'sequelize'

// Reference: https://discordjs.guide/sequelize/#alpha-connection-information
const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: 'database.sqlite',
})

// We can expose the Tags model for use in our commands.
// Reference: https://sequelize.org/master/manual/typescript.html
export class Tag extends Model {
  declare public name: string
  declare public description: string
  declare public username: string
  declare public usageCount: CreationOptional<number>
}

// Reference: https://discordjs.guide/sequelize/#beta-creating-the-model
Tag.init({
  name: {
    type: DataTypes.STRING,
    unique: true,
  },
  description: DataTypes.TEXT,
  username: DataTypes.STRING,
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
}, { sequelize, modelName: 'tags' })

export const chooksOnLoad = defineOnLoad(async () => {
  // Sync changes every time we make changes to the file.
  await sequelize.sync({
    // Optionally, we can choose to always clear the database during development.
    force: process.env.NODE_ENV !== 'production',
  })
})
