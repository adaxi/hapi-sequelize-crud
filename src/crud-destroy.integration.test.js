/* eslint-env jest */

const { setupServer, setupModels, stopServer } = require('../test/integration-setup.js')()

describe('Test destroy', () => {
  const STATUS_OK = 200
  const STATUS_NOT_FOUND = 404
  const STATUS_BAD_REQUEST = 400

  let server
  let instances
  let sequelize
  beforeEach(async () => {
    server = await setupServer()
    sequelize = server.plugins['hapi-sequelizejs'].db.sequelize
    instances = await setupModels()
  })

  afterEach(() => {
    stopServer()
  })

  test('destroy where /player?name=Baseball', async () => {
    const { models: { Player } } = sequelize
    const { player1, player2 } = instances
    const url = `/player?name=${player1.name}`
    const method = 'DELETE'

    const presentPlayer = await Player.findByPk(player1.id)
    expect(presentPlayer).toBeTruthy()

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBe(player1.id)

    const deletedPlayer = await Player.findByPk(player1.id)
    expect(deletedPlayer).toBeNull()
    const stillTherePlayer = await Player.findByPk(player2.id)
    expect(stillTherePlayer).toBeTruthy()
  })

  test('destroyAll where /players?name=Baseball', async () => {
    const { models: { Player } } = sequelize
    const { player1, player2 } = instances
    const url = `/players?name=${player1.name}`
    const method = 'DELETE'

    const presentPlayer = await Player.findByPk(player1.id)
    expect(presentPlayer).toBeTruthy()

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBe(player1.id)

    const deletedPlayer = await Player.findByPk(player1.id)
    expect(deletedPlayer).toBeNull()
    const stillTherePlayer = await Player.findByPk(player2.id)
    expect(stillTherePlayer).toBeTruthy()
  })

  test('destroyAll /players', async () => {
    const { models: { Player } } = sequelize
    const { player1, player2 } = instances
    const url = '/players'
    const method = 'DELETE'

    const presentPlayers = await Player.findAll()
    const playerIds = presentPlayers.map(({ id }) => id)
    expect(playerIds).toContain(player1.id)
    expect(playerIds).toContain(player2.id)

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    const resultPlayerIds = result.map(({ id }) => id)
    expect(resultPlayerIds).toContain(player1.id)
    expect(resultPlayerIds).toContain(player2.id)

    const deletedPlayers = await Player.findAll()
    expect(deletedPlayers.length).toBe(0)
  })

  test('destroy not found /player/10', async () => {
    const { models: { Player } } = sequelize
    const { player1, player2 } = instances
    // this doesn't exist in our fixtures
    const url = '/player/10'
    const method = 'DELETE'

    const presentPlayers = await Player.findAll()
    const playerIds = presentPlayers.map(({ id }) => id)
    expect(playerIds).toContain(player1.id)
    expect(playerIds).toContain(player2.id)

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_NOT_FOUND)

    const nonDeletedPlayers = await Player.findAll()
    expect(nonDeletedPlayers.length).toBe(presentPlayers.length)
  })

  test('destroyAll not found /players?name=no', async () => {
    const { models: { Player } } = sequelize
    const { player1, player2 } = instances
    // this doesn't exist in our fixtures
    const url = '/players?name=no'
    const method = 'DELETE'

    const presentPlayers = await Player.findAll()
    const playerIds = presentPlayers.map(({ id }) => id)
    expect(playerIds).toContain(player1.id)
    expect(playerIds).toContain(player2.id)

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_NOT_FOUND)

    const nonDeletedPlayers = await Player.findAll()
    expect(nonDeletedPlayers.length).toBe(presentPlayers.length)
  })

  test('not found /notamodel', async () => {
    const url = '/notamodel'
    const method = 'DELETE'

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_NOT_FOUND)
  })

  test('destroyScope /players/returnsOne', async () => {
    const { models: { Player } } = sequelize
    const { player1, player2 } = instances
    // this doesn't exist in our fixtures
    const url = '/players/returnsOne'
    const method = 'DELETE'

    const presentPlayers = await Player.findAll()
    const playerIds = presentPlayers.map(({ id }) => id)
    expect(playerIds).toContain(player1.id)
    expect(playerIds).toContain(player2.id)

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBe(player1.id)

    const nonDeletedPlayers = await Player.findAll()
    expect(nonDeletedPlayers.length).toBe(presentPlayers.length - 1)
  })

  test('destroyScope /players/returnsNone', async () => {
    const { models: { Player } } = sequelize
    const { player1, player2 } = instances
    // this doesn't exist in our fixtures
    const url = '/players/returnsNone'
    const method = 'DELETE'

    const presentPlayers = await Player.findAll()
    const playerIds = presentPlayers.map(({ id }) => id)
    expect(playerIds).toContain(player1.id)
    expect(playerIds).toContain(player2.id)

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_NOT_FOUND)

    const nonDeletedPlayers = await Player.findAll()
    const nonDeletedPlayerIds = nonDeletedPlayers.map(({ id }) => id)
    expect(nonDeletedPlayerIds).toContain(player1.id)
    expect(nonDeletedPlayerIds).toContain(player2.id)
  })

  test('destroyScope invalid scope /players/invalid', async () => {
    const { models: { Player } } = sequelize
    const { player1, player2 } = instances
    // this doesn't exist in our fixtures
    const url = '/players/invalid'
    const method = 'DELETE'

    const presentPlayers = await Player.findAll()
    const playerIds = presentPlayers.map(({ id }) => id)
    expect(playerIds).toContain(player1.id)
    expect(playerIds).toContain(player2.id)

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_BAD_REQUEST)

    const nonDeletedPlayers = await Player.findAll()
    const nonDeletedPlayerIds = nonDeletedPlayers.map(({ id }) => id)
    expect(nonDeletedPlayerIds).toContain(player1.id)
    expect(nonDeletedPlayerIds).toContain(player2.id)
  })
})
