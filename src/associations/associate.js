const { getMethod } = require('../utils')
const SequelizeErrorHandler = require('../sequelize-error-handler')

let prefix
let defaultOptions

module.exports = {
  associate: (server, a, b, names, options) => {
    prefix = options.prefix
    defaultOptions = options.defaultOptions

    server.route({
      method: 'GET',
      path: `${prefix}/associate/${names.a.singular}/{aid}/${names.b.singular}/{bid}`,

      async handler (request, h) {
        try {
          const instanceb = await b.findOne({
            where: {
              [b.primaryKeyField]: request.params.bid
            }
          })

          const instancea = await a.findOne({
            where: {
              [a.primaryKeyField]: request.params.aid
            }
          })

          const fn = getMethod(instancea, names.b, false, 'add') ||
                    getMethod(instancea, names.b, false, 'set')
          await fn(instanceb)

          return [instancea, instanceb]
        } catch (err) {
          SequelizeErrorHandler(err)
        }
      },
      options: defaultOptions
    })
  }
}
