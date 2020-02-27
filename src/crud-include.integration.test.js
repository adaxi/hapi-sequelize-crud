/* eslint-env jest */

const { setupServer, setupModels, stopServer } = require('../test/integration-setup.js')()

describe('Test include', () => {
  const STATUS_OK = 200

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

  test('belongsTo /team?include=city', async () => {
    const { team1, city1 } = instances
    const path = `/team/${team1.id}?include=city`

    const { result, statusCode } = await server.inject(path)
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBe(team1.id)
    expect(result.City.id).toBe(city1.id)
  })

  test('belongsTo /team?include=cities', async () => {
    const { team1, city1 } = instances
    const path = `/team/${team1.id}?include=cities`

    const { result, statusCode } = await server.inject(path)
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBe(team1.id)
    expect(result.City.id).toBe(city1.id)
  })

  test('hasMany /team?include=player', async () => {
    const { team1, player1, player2 } = instances
    const path = `/team/${team1.id}?include=player`

    const { result, statusCode } = await server.inject(path)
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBe(team1.id)

    const playerIds = result.Players.map(({ id }) => id)
    expect(playerIds).toContain(player1.id)
    expect(playerIds).toContain(player2.id)
  })

  test('hasMany /team?include=players', async () => {
    const { team1, player1, player2 } = instances
    const path = `/team/${team1.id}?include=players`

    const { result, statusCode } = await server.inject(path)
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBe(team1.id)

    const playerIds = result.Players.map(({ id }) => id)
    expect(playerIds).toContain(player1.id)
    expect(playerIds).toContain(player2.id)
  })

  test('multiple includes /team?include=players&include=city', async () => {
    const { team1, player1, player2, city1 } = instances
    const path = `/team/${team1.id}?include=players&include=city`

    const { result, statusCode } = await server.inject(path)
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBe(team1.id)
    expect(result.City.id).toBe(city1.id)

    const playerIds = result.Players.map(({ id }) => id)
    expect(playerIds).toContain(player1.id)
    expect(playerIds).toContain(player2.id)
  })

  test('multiple includes /team?include[]=players&include[]=city', async () => {
    const { team1, player1, player2, city1 } = instances
    const path = `/team/${team1.id}?include[]=players&include[]=city`

    const { result, statusCode } = await server.inject(path)
    expect(statusCode).toBe(STATUS_OK)
    expect(result.id).toBe(team1.id)
    expect(result.City.id).toBe(city1.id)

    const playerIds = result.Players.map(({ id }) => id)
    expect(playerIds).toContain(player1.id)
    expect(playerIds).toContain(player2.id)
  })
})
