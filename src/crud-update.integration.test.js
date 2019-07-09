/* eslint-env jest */

const { setupServer, setupModels, stopServer } = require('../test/integration-setup.js')()

describe('Test update', () => {
  const STATUS_OK = 200
  const STATUS_NOT_FOUND = 404
  const STATUS_BAD_REQUEST = 400

  let server
  let instances
  beforeEach(async () => {
    server = await setupServer()
    instances = await setupModels()
  })

  afterEach(() => {
    stopServer()
  })

  test('where /player/1 {name: "Chard"}', async () => {
    const { player1 } = instances
    const url = `/player/${player1.id}`
    const method = 'PUT'
    const payload = { name: 'Chard' }

    const { result, statusCode } = await server.inject({ url, method, payload })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBe(player1.id)
    expect(result.name).toBe(payload.name)
  })

  test('not found /player/10 {name: "Chard"}', async () => {
    // this doesn't exist in our fixtures
    const url = '/player/10'
    const method = 'PUT'
    const payload = { name: 'Chard' }

    const { statusCode } = await server.inject({ url, method, payload })
    expect(statusCode).toBe(STATUS_NOT_FOUND)
  })

  test('no payload /player/1', async () => {
    const { player1 } = instances
    const url = `/player/${player1.id}`
    const method = 'PUT'

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_BAD_REQUEST)
  })

  test('not found /notamodel {name: "Chard"}', async () => {
    const url = '/notamodel'
    const method = 'PUT'
    const payload = { name: 'Chard' }

    const { statusCode } = await server.inject({ url, method, payload })
    expect(statusCode).toBe(STATUS_NOT_FOUND)
  })
})
