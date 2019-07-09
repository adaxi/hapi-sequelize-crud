/* eslint-env jest */

const { setupServer, setupModels, stopServer } = require('../test/integration-setup.js')()

describe('Test list order', () => {
  const STATUS_OK = 200
  const STATUS_BAD_QUERY = 502

  let server
  let instances
  beforeEach(async () => {
    server = await setupServer()
    instances = await setupModels()
  })

  afterEach(() => {
    stopServer()
  })

  test('/players?order=name', async () => {
    const { player1, player2, player3 } = instances
    const url = '/players?order=name'
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    // this is the order we'd expect the names to be in
    expect(result[0].name).toBe(player1.name)
    expect(result[1].name).toBe(player2.name)
    expect(result[2].name).toBe(player3.name)
  })

  test('/players?order=name%20ASC', async () => {
    const { player1, player2, player3 } = instances
    const url = '/players?order=name%20ASC'
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    // this is the order we'd expect the names to be in
    expect(result[0].name).toBe(player1.name)
    expect(result[1].name).toBe(player2.name)
    expect(result[2].name).toBe(player3.name)
  })

  test('/players?order=name%20DESC', async () => {
    const { player1, player2, player3 } = instances
    const url = '/players?order=name%20DESC'
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    // this is the order we'd expect the names to be in
    expect(result[0].name).toBe(player3.name)
    expect(result[1].name).toBe(player2.name)
    expect(result[2].name).toBe(player1.name)
  })

  test('/players?order[]=name', async () => {
    const { player1, player2, player3 } = instances
    const url = '/players?order[]=name'
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    // this is the order we'd expect the names to be in
    expect(result[0].name).toBe(player1.name)
    expect(result[1].name).toBe(player2.name)
    expect(result[2].name).toBe(player3.name)
  })

  test('/players?order[0]=name&order[0]=DESC', async () => {
    const { player1, player2, player3 } = instances
    const url = '/players?order[0]=name&order[0]=DESC'
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    // this is the order we'd expect the names to be in
    expect(result[0].name).toBe(player3.name)
    expect(result[1].name).toBe(player2.name)
    expect(result[2].name).toBe(player1.name)
  })

  // multiple sorts
  test('/players?order[0]=active&order[0]=DESC&order[1]=name&order[1]=DESC', async () => {
    const { player1, player2, player3 } = instances
    const url = '/players?order[0]=name&order[0]=DESC&order[1]=teamId&order[1]=DESC'
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    // this is the order we'd expect the names to be in
    expect(result[0].name).toBe(player3.name)
    expect(result[1].name).toBe(player2.name)
    expect(result[2].name).toBe(player1.name)
  })

  // Sif this test fails, that's great! Just remove the workaround note in the docs
  test('sequelize bug /players?order[0]={"model":"Team"}&order[0]=name&order[0]=DESC', async () => {
    const url = '/players?order[0]={"model":"Team"}&order[0]=name&order[0]=DESC'
    const method = 'GET'

    const { statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_BAD_QUERY)
  })

  // b/c the above fails, this is a work-around
  test('/players?order[0]={"model":"Team"}&order[0]=name&order[0]=DESC&include=team', async () => {
    const { player1, player2, player3 } = instances
    const url = '/players?order[0]={"model":"Team"}&order[0]=name&order[0]=DESC&include=team'
    const method = 'GET'

    const { result, statusCode } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_OK)
    // this is the order we'd expect the names to be in
    expect(result[0].name).toBe(player3.name)
    expect(result[1].name).toBe(player1.name)
    expect(result[2].name).toBe(player2.name)
  })

  test('invalid column /players?order[0]=invalid', async () => {
    const url = '/players?order[]=invalid'
    const method = 'GET'

    const { statusCode, result } = await server.inject({ url, method })
    expect(statusCode).toBe(STATUS_BAD_QUERY)
    expect(result.message).toEqual(expect.stringContaining('invalid'))
  })
})
