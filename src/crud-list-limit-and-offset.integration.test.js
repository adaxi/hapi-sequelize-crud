/* eslint-env jest */

const { setupServer, setupModels, stopServer } = require('../test/integration-setup.js')()

describe('Test list limit and offset', () => {
  const STATUS_OK = 200
  const STATUS_NOT_FOUND = 404

  let server
  beforeEach(async () => {
    server = await setupServer()
    await setupModels()
  })

  afterEach(() => {
    stopServer()
  })

  test('/players?limit=2', async () => {
    const limit = 2
    const url = `/players?limit=${limit}`
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.length).toBe(limit)
  })

  test('/players?limit=2&offset=1', async () => {
    const limit = 2
    const url = `/players?limit=${limit}&offset=1`
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.length).toBe(limit)
  })

  test('/players?limit=2&offset=2', async () => {
    const limit = 2
    const url = `/players?limit=${limit}&offset=2`
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.length).toBe(1)
  })

  test('/players?limit=2&offset=20', async () => {
    const limit = 2
    const url = `/players?limit=${limit}&offset=20`
    const method = 'GET'

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_NOT_FOUND)
  })

  test('scope /players/returnsAll?limit=2', async () => {
    const limit = 2
    const url = `/players/returnsAll?limit=${limit}`
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.length).toBe(limit)
  })

  test('scope /players/returnsAll?limit=2&offset=1', async () => {
    const limit = 2
    const url = `/players/returnsAll?limit=${limit}&offset=1`
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.length).toBe(limit)
  })

  test('scope /players/returnsAll?limit=2&offset=2', async () => {
    const limit = 2
    const url = `/players/returnsAll?limit=${limit}&offset=2`
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    expect(result.length).toBe(1)
  })

  test('scope /players/returnsAll?limit=2&offset=20', async () => {
    const limit = 2
    const url = `/players/returnsAll?limit=${limit}&offset=20`
    const method = 'GET'

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_NOT_FOUND)
  })
})
