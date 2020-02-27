/* eslint-env jest */

const { setupServer, setupModels, stopServer, modelNames } = require('../test/integration-setup.js')()

describe('Test routes existence', () => {
  let server
  let sequelize

  beforeAll(async () => {
    const { server: _server, sequelize: _sequelize } = await setupServer()
    server = _server
    sequelize = _sequelize
    await setupModels(sequelize)
  })

  afterAll(() => stopServer(server))

  modelNames.forEach(({ singular, plural }) => {
    test(`Test route for 'get' for '/${singular}/{id?}'`, () => {
      expect(server.table().find(({ path, method }) => (path === `/${singular}/{id?}` && method === 'get'))).toBeTruthy()
    })
    test(`Test route for 'list' for '/${plural}/{id?}'`, () => {
      expect(server.table().find(({ path, method }) => (path === `/${plural}` && method === 'get'))).toBeTruthy()
    })
    test(`Test route for 'scope' for '/${plural}/{scope}'`, () => {
      expect(server.table().find(({ path, method }) => (path === `/${plural}/{scope}` && method === 'get'))).toBeTruthy()
    })
    test(`Test route for 'create' for '/${singular}'`, () => {
      expect(server.table().find(({ path, method }) => (path === `/${singular}` && method === 'post'))).toBeTruthy()
    })
    test(`Test route for 'destroy' for '/${singular}/{id?}'`, () => {
      expect(server.table().find(({ path, method }) => (path === `/${singular}/{id?}` && method === 'delete'))).toBeTruthy()
    })
    test(`Test route for 'destroyScope' for '/${plural}/{scope}'`, () => {
      expect(server.table().find(({ path, method }) => (path === `/${plural}/{scope}` && method === 'delete'))).toBeTruthy()
    })
    test(`Test route for 'update' for '/${singular}/{id}'`, () => {
      expect(server.table().find(({ path, method }) => (path === `/${singular}/{id}` && method === 'put'))).toBeTruthy()
    })
  })
})
