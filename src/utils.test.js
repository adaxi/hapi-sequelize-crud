/* eslint-env jest */

const { parseLimitAndOffset, parseOrder, parseWhere } = require('./utils.js')

let models
let request

describe('Test utilites', () => {
  beforeEach(() => {
    models = { User: {} }
    request = { query: {}, models }
  })

  test('parseLimitAndOffset is a function', () => {
    expect(typeof parseLimitAndOffset).toBe('function')
  })

  test('parseLimitAndOffset returns limit and offset', () => {
    request.query = { limit: 1, offset: 2, thing: 'hi' }
    expect(parseLimitAndOffset(request).limit).toBe(request.query.limit)
    expect(parseLimitAndOffset(request).offset).toBe(request.query.offset)
  })

  test('parseLimitAndOffset returns limit and offset as numbers', () => {
    const limit = 1
    const offset = 2
    request.query = { limit: `${limit}`, offset: `${offset}`, thing: 'hi' }
    expect(parseLimitAndOffset(request).limit).toBe(limit)
    expect(parseLimitAndOffset(request).offset).toBe(offset)
  })

  test('parseOrder is a function', () => {
    expect(typeof parseOrder).toBe('function')
  })

  test('parseOrder returns order when a string', () => {
    const order = 'thing'
    request.query = { order: order, thing: 'hi' }
    expect(parseOrder(request)).toEqual([[order]])
  })

  test('parseOrder returns order when json', () => {
    request.query.order = [JSON.stringify({ model: 'User' }), 'DESC']
    request.query.thing = 'hi'
    expect(parseOrder(request)).toEqual([{ model: models.User }, 'DESC'])
  })

  test('parseOrder returns null when not defined', () => {
    request.query.thing = 'hi'
    expect(parseOrder(request)).toBeNull()
  })

  test('parseWhere is a function', () => {
    expect(typeof parseWhere).toBe('function')
  })

  test('parseWhere returns the non-sequelize keys', () => {
    request.query = { order: 'thing', include: 'User', limit: 2, thing: 'hi' }
    expect(parseWhere(request)).toEqual({ thing: 'hi' })
  })

  test('parseWhere returns json converted keys', () => {
    request.query = { order: 'hi', thing: '{"id": {"$in": [2, 3]}}' }
    expect(parseWhere(request)).toEqual({ thing: { id: { $in: [2, 3] } } })
  })
})
