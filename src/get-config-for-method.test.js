/* eslint-env jest */
const Joi = require('@hapi/joi')

const {
  getConfigForMethod,
  whereMethods,
  includeMethods,
  payloadMethods,
  scopeParamsMethods,
  idParamsMethods,
  restrictMethods,
  sequelizeOperators
} = require('./get-config-for-method.js')

let models
let scopes
let options
let attributeValidation
let associationValidation

describe('Test route configuration', () => {
  beforeEach(() => {
    models = ['MyModel']
    scopes = ['aScope']
    options = { cors: {} }
    attributeValidation = { myKey: Joi.any() }
    associationValidation = {
      include: Joi.array().items(Joi.string().valid(...models))
    }
  })

  test('validate.query sequelizeOperators', () => {
    whereMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method })
      const { query } = configForMethod.validate
      expect(query).toBeTruthy()
      Object.keys(sequelizeOperators).forEach((operator) => {
        expect(query.validate({ [operator]: true }).error).toBeUndefined()
      })
      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.query attributeValidation', () => {
    whereMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method, attributeValidation })
      const { query } = configForMethod.validate

      Object.keys(attributeValidation).forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeUndefined()
      })
      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('query attributeValidation w/ config as plain object', () => {
    const options = {
      validate: {
        query: {
          aKey: Joi.boolean()
        }
      }
    }

    whereMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        attributeValidation,
        options
      })
      const { query } = configForMethod.validate

      const keys = [
        ...Object.keys(attributeValidation),
        ...Object.keys(options.validate.query)
      ]

      keys.forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeUndefined()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('query attributeValidation w/ config as joi object', () => {
    const queryKeys = {
      aKey: Joi.boolean()
    }
    const options = {
      validate: {
        query: Joi.object().keys(queryKeys)
      }
    }

    whereMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        attributeValidation,
        options
      })
      const { query } = configForMethod.validate

      const keys = [
        ...Object.keys(attributeValidation),
        ...Object.keys(queryKeys)
      ]

      keys.forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeUndefined()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.query associationValidation', () => {
    includeMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        attributeValidation,
        associationValidation
      })
      const { query } = configForMethod.validate

      Object.keys(attributeValidation).forEach((key) => {
        expect(query.validate({ [key]: 'true' }).error).toBeUndefined()
      })

      Object.keys(associationValidation).forEach((key) => {
        expect(query.validate({ [key]: models }).error).toBeUndefined()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('query associationValidation w/ config as plain object', () => {
    const options = {
      validate: {
        query: {
          aKey: Joi.boolean()
        }
      }
    }

    includeMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        associationValidation,
        options
      })
      const { query } = configForMethod.validate

      Object.keys(associationValidation).forEach((key) => {
        expect(query.validate({ [key]: models }).error).toBeUndefined()
      })

      Object.keys(options.validate.query).forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeUndefined()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('query associationValidation w/ config as joi object', () => {
    const queryKeys = {
      aKey: Joi.boolean()
    }
    const options = {
      validate: {
        query: Joi.object().keys(queryKeys)
      }
    }

    includeMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        associationValidation,
        options
      })
      const { query } = configForMethod.validate

      Object.keys(associationValidation).forEach((key) => {
        expect(query.validate({ [key]: models }).error).toBeUndefined()
      })

      Object.keys(queryKeys).forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeUndefined()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.payload associationValidation', () => {
    payloadMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method, attributeValidation })
      const { payload } = configForMethod.validate

      Object.keys(attributeValidation).forEach((key) => {
        expect(payload.validate({ [key]: true }).error).toBeUndefined()
      })

      expect(payload.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('payload attributeValidation w/ config as plain object', () => {
    const options = {
      validate: {
        payload: {
          aKey: Joi.boolean()
        }
      }
    }

    payloadMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        attributeValidation,
        options
      })
      const { payload } = configForMethod.validate

      const keys = [
        ...Object.keys(attributeValidation),
        ...Object.keys(options.validate.payload)
      ]

      keys.forEach((key) => {
        expect(payload.validate({ [key]: true }).error).toBeUndefined()
      })

      expect(payload.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('payload attributeValidation w/ config as joi object', () => {
    const payloadKeys = {
      aKey: Joi.boolean()
    }
    const options = {
      validate: {
        payload: Joi.object().keys(payloadKeys)
      }
    }

    payloadMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        attributeValidation,
        options
      })
      const { payload } = configForMethod.validate

      const keys = [
        ...Object.keys(attributeValidation),
        ...Object.keys(payloadKeys)
      ]

      keys.forEach((key) => {
        expect(payload.validate({ [key]: true }).error).toBeUndefined()
      })

      expect(payload.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.params scopeParamsMethods', () => {
    scopeParamsMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method, scopes })
      const { params } = configForMethod.validate

      scopes.forEach((key) => {
        expect(params.validate({ scope: key }).error).toBeUndefined()
      })

      expect(params.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('params scopeParamsMethods w/ config as plain object', () => {
    const options = {
      validate: {
        params: {
          aKey: Joi.boolean()
        }
      }
    }

    scopeParamsMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        scopes,
        options
      })
      const { params } = configForMethod.validate

      scopes.forEach((key) => {
        expect(params.validate({ scope: key }).error).toBeUndefined()
      })

      Object.keys(options.validate.params).forEach((key) => {
        expect(params.validate({ [key]: true }).error).toBeUndefined()
      })

      expect(params.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('params scopeParamsMethods w/ config as joi object', () => {
    const paramsKeys = {
      aKey: Joi.boolean()
    }
    const options = {
      validate: {
        params: Joi.object().keys(paramsKeys)
      }
    }

    scopeParamsMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        scopes,
        options
      })
      const { params } = configForMethod.validate

      scopes.forEach((key) => {
        expect(params.validate({ scope: key }).error).toBeUndefined()
      })

      Object.keys(paramsKeys).forEach((key) => {
        expect(params.validate({ [key]: true }).error).toBeUndefined()
      })

      expect(params.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.payload idParamsMethods', () => {
    idParamsMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method })
      const { params } = configForMethod.validate

      expect(params.validate({ id: 'aThing' }).error).toBeUndefined()
    })
  })

  test('validate.query restrictMethods', () => {
    restrictMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method })
      const { query } = configForMethod.validate
      const restrictKeys = ['limit', 'offset']

      restrictKeys.forEach((key) => {
        expect(query.validate({ [key]: 0 }).error).toBeUndefined()
      })

      expect(query.validate({ order: ['thing', 'DESC'] }).error).toBeUndefined()
      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.query restrictMethods w/ config as plain object', () => {
    const options = {
      validate: {
        query: {
          aKey: Joi.boolean()
        }
      }
    }

    restrictMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        options
      })
      const { query } = configForMethod.validate

      const keys = [
        ...Object.keys(options.validate.query)
      ]

      keys.forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeUndefined()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.query restrictMethods w/ config as joi object', () => {
    const queryKeys = {
      aKey: Joi.boolean()
    }
    const options = {
      validate: {
        query: Joi.object().keys(queryKeys)
      }
    }

    whereMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        options
      })
      const { query } = configForMethod.validate

      const keys = [
        ...Object.keys(queryKeys)
      ]

      keys.forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeUndefined()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('does not modify initial config on multiple passes', () => {
    const originalConfig = { ...options }
    whereMethods.forEach((method) => {
      getConfigForMethod({ method, models, scopes, options, attributeValidation, associationValidation })
    })
    expect(options).toEqual(originalConfig)
  })
})
