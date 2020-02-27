/* eslint-env jest */

const { setupServer, setupModels, stopServer } = require('../test/integration-setup.js')()

describe('Test where', () => {
  const STATUS_OK = 200
  const STATUS_NOT_FOUND = 404

  let server
  let instances
  let sequelize

  beforeEach(async () => {
    const { server: _server, sequelize: _sequelize } = await setupServer()
    server = _server
    sequelize = _sequelize
    instances = await setupModels(sequelize)
  })

  afterEach(() => stopServer(server))

  test('single result /team?name=Baseball', async () => {
    const { team1 } = instances
    const url = `/team?name=${team1.name}`
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBe(team1.id)
    expect(result.name).toBe(team1.name)
  })

  test('no results /team?name=Baseball&id=2', async () => {
    const { team1 } = instances
    // this doesn't exist in our fixtures
    const url = `/team?name=${team1.name}&id=2`
    const method = 'GET'

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_NOT_FOUND)
  })

  test('single result from list query /teams?name=Baseball', async () => {
    const { team1 } = instances
    const url = `/teams?name=${team1.name}`
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result[0].id).toBe(team1.id)
    expect(result[0].name).toBe(team1.name)
    expect(result.length).toBe(1)
  })

  test('multiple results from list query /players?teamId=1', async () => {
    const { team1, player1, player2 } = instances
    const url = `/players?teamId=${team1.id}`
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    const playerIds = result.map(({ id }) => id)
    expect(playerIds).toContain(player1.id)
    expect(playerIds).toContain(player2.id)
  })
})
