const test = require('ava')
const setup = require('../test/integration-setup.js')
require('sinon-bluebird')

const { modelNames } = setup(test)

const confirmRoute = (t, { path, method }) => {
  const { server } = t.context
  const routes = server.table()
  t.truthy(routes.find(({ path: p, method: m }) => p === path && m === method))
}

modelNames.forEach(({ singular, plural }) => {
  test('get', confirmRoute, { path: `/${singular}/{id}`, method: 'get' })
  test('list', confirmRoute, { path: `/${plural}/{id}`, method: 'get' })
  test('scope', confirmRoute, { path: `/${plural}/{scope}`, method: 'get' })
  test('create', confirmRoute, { path: `/${singular}`, method: 'post' })
  test('destroy', confirmRoute, { path: `/${singular}`, method: 'delete' })
  test('destroyScope', confirmRoute, { path: `/${plural}/{scope}`, method: 'delete' })
  test('update', confirmRoute, { path: `/${singular}/{id}`, method: 'put' })
})
