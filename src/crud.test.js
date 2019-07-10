
/* eslint-env jest */

const Crypto = require('crypto')
const { list } = require('./crud.js')
const { stub } = require('sinon')

const generateId = () => Crypto.randomBytes(16).toString('hex')

describe('Test include', () => {
  const methods = {
    GET: 'GET'
  }

  let server
  let model
  let models
  let request
  let h

  beforeEach(() => {
    server = { route: stub() }
    models = [makeModel(), makeModel()]
    model = models[0]
    request = {
      query: {},
      payload: {},
      models
    }
    h = jest.fn()
  })

  const makeModel = () => {
    const id = generateId()
    return {
      id,
      findAll: stub(),
      _plural: 'models',
      _singular: 'model',
      toJSON: () => ({ id })
    }
  }

  test('crud#list without prefix', () => {
    list({ server, model })
    const { path } = server.route.args[0][0]
    expect(path).not.toContain('undefined') // correctly sets the path without a prefix defined
    expect(path).toEqual(`/${model._plural}`)
  })

  test('crud#list with prefix', () => {
    const prefix = '/v1'
    list({ server, model, prefix })
    const { path } = server.route.args[0][0]
    expect(path).toEqual(`${prefix}/${model._plural}`)
  })

  test('crud#list method', () => {
    list({ server, model })
    const { method } = server.route.args[0][0]
    expect(method).toEqual(methods.GET)
  })

  test('crud#list config', () => {
    const userConfig = {}
    list({ server, model, config: userConfig })
    const { config } = server.route.args[0][0]
    expect(config).toEqual(userConfig)
  })

  test('crud#list handler', async () => {
    list({ server, model })
    const { handler } = server.route.args[0][0]
    model.findAll.resolves(models)
    const response = await handler(request, h)
    expect(response).not.toBeInstanceOf(Error)
    expect(response).toEqual(models.map(({ id }) => ({ id })))
  })

  test('crud#list handler if parseInclude errors', async () => {
    // we _want_ the error
    delete request.models

    list({ server, model })
    const { handler } = server.route.args[0][0]

    try {
      await handler(request, h)
      expect(true).toBe(false)
    } catch (err) {
      expect(err.isBoom).toBe(true)
    }
  })

  test('crud#list handler with limit', async () => {
    const { findAll } = model

    // set the limit
    request.query.limit = 1

    list({ server, model })
    const { handler } = server.route.args[0][0]
    model.findAll.resolves(models)

    let response = await handler(request, h)
    const findAllArgs = findAll.args[0][0]

    expect(response).not.toBeInstanceOf(Error)
    expect(findAllArgs.limit).toBe(request.query.limit)
  })

  test('crud#list handler with order', async () => {
    const { findAll } = model

    // set the limit
    request.query.order = 'key'

    list({ server, model })
    const { handler } = server.route.args[0][0]
    model.findAll.resolves(models)

    let response = await handler(request, h)
    const findAllArgs = findAll.args[0][0]

    expect(response).not.toBeInstanceOf(Error)
    expect(findAllArgs.order).toStrictEqual([[request.query.order]])
  })
})
