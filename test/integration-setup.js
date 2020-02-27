/* eslint-env jest */

const Qs = require('qs')
const Path = require('path')
const Sequelize = require('sequelize')
const Portfinder = require('portfinder')
const { Server } = require('@hapi/hapi')

const modelsPath = Path.join(__dirname, 'fixtures', 'models')
const modelsGlob = Path.join(modelsPath, '**', '*.js')
const dbName = 'db'

// these are what's in the fixtures dir
const modelNames = [
  { Singular: 'City', singular: 'city', Plural: 'Cities', plural: 'cities' },
  { Singular: 'Team', singular: 'team', Plural: 'Teams', plural: 'teams' },
  { Singular: 'Player', singular: 'player', Plural: 'Players', plural: 'players' }
]

module.exports = () => {
  const setupServer = async () => {
    const sequelize = new Sequelize({ dialect: 'sqlite', logging: false })

    const server = new Server({
      host: '0.0.0.0',
      port: await Portfinder.getPortPromise(),
      query: {
        parser: (query) => Qs.parse(query)
      }
    })

    await server.register([
      {
        plugin: require('hapi-sequelizejs'),
        options: {
          name: dbName,
          models: [modelsGlob],
          sequelize,
          sync: true,
          forceSync: true
        }
      },
      {
        plugin: require('../src/index.js'),
        options: {
          name: dbName
        }
      }
    ])

    return { server, sequelize }
  }

  const setupModels = async (sequelize) => {
    const { Player, Team, City } = sequelize.models
    const city1 = await City.create({ name: 'Healdsburg' })
    const team1 = await Team.create({ name: 'Baseballs', cityId: city1.id })
    const team2 = await Team.create({ name: 'Footballs', cityId: city1.id })
    const player1 = await Player.create({ name: 'Cat', teamId: team1.id, active: true })
    const player2 = await Player.create({ name: 'Pinot', teamId: team1.id })
    const player3 = await Player.create({ name: 'Syrah', teamId: team2.id })
    return { city1, team1, team2, player1, player2, player3 }
  }

  // kill the server so that we can exit and don't leak memory
  const stopServer = (server) => server.stop()

  return { setupServer, setupModels, stopServer, modelNames }
}
