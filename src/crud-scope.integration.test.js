/* eslint-env jest */

const { setupServer, setupModels, stopServer } = require('../test/integration-setup.js')()

describe('Test scope', () => {
  const STATUS_OK = 200
  const STATUS_NOT_FOUND = 404
  const STATUS_BAD_REQUEST = 400

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

  test('/players/returnsOne', async () => {
    const { player1 } = instances
    const url = '/players/returnsOne'
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.length).toBe(1)
    expect(result[0].id).toBe(player1.id)
  })

  test('/players/returnsNone', async () => {
    const url = '/players/returnsNone'
    const method = 'GET'

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_NOT_FOUND)
  })

  test('invalid scope /players/invalid', async () => {
    // this doesn't exist in our fixtures
    const url = '/players/invalid'
    const method = 'GET'

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_BAD_REQUEST)
  })
})
