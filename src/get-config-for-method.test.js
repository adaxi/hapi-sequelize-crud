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
let config
let attributeValidation
let associationValidation

describe('Test route configuration', () => {
  beforeEach(() => {
    models = ['MyModel']
    scopes = ['aScope']
    config = { cors: {} }
    attributeValidation = { myKey: Joi.any() }
    associationValidation = {
      include: Joi.array().items(Joi.string().valid(models))
    }
  })

  test('validate.query sequelizeOperators', () => {
    whereMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method })
      const { query } = configForMethod.validate
      expect(query).toBeTruthy()
      Object.keys(sequelizeOperators).forEach((operator) => {
        expect(query.validate({ [operator]: true }).error).toBeNull()
      })
      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.query attributeValidation', () => {
    whereMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method, attributeValidation })
      const { query } = configForMethod.validate

      Object.keys(attributeValidation).forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeNull()
      })
      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('query attributeValidation w/ config as plain object', () => {
    const config = {
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
        config
      })
      const { query } = configForMethod.validate

      const keys = [
        ...Object.keys(attributeValidation),
        ...Object.keys(config.validate.query)
      ]

      keys.forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeNull()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('query attributeValidation w/ config as joi object', () => {
    const queryKeys = {
      aKey: Joi.boolean()
    }
    const config = {
      validate: {
        query: Joi.object().keys(queryKeys)
      }
    }

    whereMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        attributeValidation,
        config
      })
      const { query } = configForMethod.validate

      const keys = [
        ...Object.keys(attributeValidation),
        ...Object.keys(queryKeys)
      ]

      keys.forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeNull()
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
        expect(query.validate({ [key]: 'true' }).error).toBeNull()
      })

      Object.keys(associationValidation).forEach((key) => {
        expect(query.validate({ [key]: models }).error).toBeNull()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('query associationValidation w/ config as plain object', () => {
    const config = {
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
        config
      })
      const { query } = configForMethod.validate

      Object.keys(associationValidation).forEach((key) => {
        expect(query.validate({ [key]: models }).error).toBeNull()
      })

      Object.keys(config.validate.query).forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeNull()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('query associationValidation w/ config as joi object', () => {
    const queryKeys = {
      aKey: Joi.boolean()
    }
    const config = {
      validate: {
        query: Joi.object().keys(queryKeys)
      }
    }

    includeMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        associationValidation,
        config
      })
      const { query } = configForMethod.validate

      Object.keys(associationValidation).forEach((key) => {
        expect(query.validate({ [key]: models }).error).toBeNull()
      })

      Object.keys(queryKeys).forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeNull()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.payload associationValidation', () => {
    payloadMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method, attributeValidation })
      const { payload } = configForMethod.validate

      Object.keys(attributeValidation).forEach((key) => {
        expect(payload.validate({ [key]: true }).error).toBeNull()
      })

      expect(payload.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('payload attributeValidation w/ config as plain object', () => {
    const config = {
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
        config
      })
      const { payload } = configForMethod.validate

      const keys = [
        ...Object.keys(attributeValidation),
        ...Object.keys(config.validate.payload)
      ]

      keys.forEach((key) => {
        expect(payload.validate({ [key]: true }).error).toBeNull()
      })

      expect(payload.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('payload attributeValidation w/ config as joi object', () => {
    const payloadKeys = {
      aKey: Joi.boolean()
    }
    const config = {
      validate: {
        payload: Joi.object().keys(payloadKeys)
      }
    }

    payloadMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        attributeValidation,
        config
      })
      const { payload } = configForMethod.validate

      const keys = [
        ...Object.keys(attributeValidation),
        ...Object.keys(payloadKeys)
      ]

      keys.forEach((key) => {
        expect(payload.validate({ [key]: true }).error).toBeNull()
      })

      expect(payload.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.params scopeParamsMethods', () => {
    scopeParamsMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method, scopes })
      const { params } = configForMethod.validate

      scopes.forEach((key) => {
        expect(params.validate({ scope: key }).error).toBeNull()
      })

      expect(params.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('params scopeParamsMethods w/ config as plain object', () => {
    const config = {
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
        config
      })
      const { params } = configForMethod.validate

      scopes.forEach((key) => {
        expect(params.validate({ scope: key }).error).toBeNull()
      })

      Object.keys(config.validate.params).forEach((key) => {
        expect(params.validate({ [key]: true }).error).toBeNull()
      })

      expect(params.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('params scopeParamsMethods w/ config as joi object', () => {
    const paramsKeys = {
      aKey: Joi.boolean()
    }
    const config = {
      validate: {
        params: Joi.object().keys(paramsKeys)
      }
    }

    scopeParamsMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        scopes,
        config
      })
      const { params } = configForMethod.validate

      scopes.forEach((key) => {
        expect(params.validate({ scope: key }).error).toBeNull()
      })

      Object.keys(paramsKeys).forEach((key) => {
        expect(params.validate({ [key]: true }).error).toBeNull()
      })

      expect(params.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.payload idParamsMethods', () => {
    idParamsMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method })
      const { params } = configForMethod.validate

      expect(params.validate({ id: 'aThing' }).error).toBeNull()
    })
  })

  test('validate.query restrictMethods', () => {
    restrictMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({ method })
      const { query } = configForMethod.validate
      const restrictKeys = ['limit', 'offset']

      restrictKeys.forEach((key) => {
        expect(query.validate({ [key]: 0 }).error).toBeNull()
      })

      expect(query.validate({ order: ['thing', 'DESC'] }).error).toBeNull()
      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.query restrictMethods w/ config as plain object', () => {
    const config = {
      validate: {
        query: {
          aKey: Joi.boolean()
        }
      }
    }

    restrictMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        config
      })
      const { query } = configForMethod.validate

      const keys = [
        ...Object.keys(config.validate.query)
      ]

      keys.forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeNull()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('validate.query restrictMethods w/ config as joi object', () => {
    const queryKeys = {
      aKey: Joi.boolean()
    }
    const config = {
      validate: {
        query: Joi.object().keys(queryKeys)
      }
    }

    whereMethods.forEach((method) => {
      const configForMethod = getConfigForMethod({
        method,
        config
      })
      const { query } = configForMethod.validate

      const keys = [
        ...Object.keys(queryKeys)
      ]

      keys.forEach((key) => {
        expect(query.validate({ [key]: true }).error).toBeNull()
      })

      expect(query.validate({ notAThing: true }).error).toBeTruthy()
    })
  })

  test('does not modify initial config on multiple passes', () => {
    const originalConfig = { ...config }
    whereMethods.forEach((method) => {
      getConfigForMethod({ method, models, scopes, config, attributeValidation, associationValidation })
    })
    expect(config).toEqual(originalConfig)
  })
})
