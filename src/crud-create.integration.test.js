/* eslint-env jest */

const { setupServer, setupModels, stopServer } = require('../test/integration-setup.js')()

describe('Test destroy', () => {
  const STATUS_OK = 200
  const STATUS_NOT_FOUND = 404
  const STATUS_BAD_REQUEST = 400

  let server
  let sequelize
  beforeEach(async () => {
    server = await setupServer()
    sequelize = server.plugins['hapi-sequelizejs'].db.sequelize
    await setupModels()
  })

  afterEach(() => {
    stopServer()
  })

  test('where /player {name: "Chard"}', async () => {
    const { models: { Player } } = sequelize
    const url = '/player'
    const method = 'POST'
    const payload = { name: 'Chard' }

    const notPresentPlayer = await Player.findOne({ where: payload })
    expect(notPresentPlayer).toBeNull()

    const { result, statusCode } = await server.inject({ url, method, payload })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBeTruthy()
    expect(result.name).toBe(payload.name)
  })

  test('not found /notamodel {name: "Chard"}', async () => {
    const url = '/notamodel'
    const method = 'POST'
    const payload = { name: 'Chard' }

    const { statusCode } = await server.inject({ url, method, payload })
    expect(statusCode).toBe(STATUS_NOT_FOUND)
  })

  test('no payload /player/1', async () => {
    const url = '/player'
    const method = 'POST'

    const response = await server.inject({ url, method })
    const { statusCode } = response
    expect(statusCode).toBe(STATUS_BAD_REQUEST)
  })
})
