const { defineOnLoad } = require('chooksie')
const { DataTypes, Model, Sequelize } = require('sequelize')

// Reference: https://discordjs.guide/sequelize/#alpha-connection-information
const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: 'database.sqlite',
})

// We can expose the Tags model for use in our commands.
class Tag extends Model {}
exports.Tag = Tag

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

exports.chooksOnLoad = defineOnLoad(async () => {
  // Sync changes every time we make changes to the file.
  await sequelize.sync({
    // Optionally, we can choose to always clear the database during development.
    force: process.env.NODE_ENV !== 'production',
  })
})
