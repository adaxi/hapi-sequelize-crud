const SequelizeErrorHandler = require('../sequelize-error-handler');
const { parseInclude, parseWhere, getMethod } = require('../utils');

let prefix;
let defaultConfig;

const oneToOne = (server, a, b, names, options) => {
  prefix = options.prefix;
  defaultConfig = options.defaultConfig;

  get(server, a, b, names);
  create(server, a, b, names);
  destroy(server, a, b, names);
  update(server, a, b, names);
};

const get = (server, a, b, names) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.singular}`,

    async handler(request, h) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);

        const base = await a.findOne({
          where: {
            [a.primaryKeyField]: request.params.aid,
          },
        });
        const method = getMethod(base, names.b, false);

        const list = await method({ where, include, limit: 1 });

        if (Array.isArray(list)) {
          return list[0];
        } else {
          return list;
        }
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },
    config: defaultConfig,
  });
};

const create = (server, a, b, names) => {
  server.route({
    method: 'POST',
    path: `${prefix}/${names.a.singular}/{id}/${names.b.singular}`,

    async handler(request, h) {
      try {
        const base = await a.findOne({
          where: {
            [a.primaryKeyField]: request.params.id,
          },
        });
  
        const method = getMethod(base, names.b, false, 'create');
        const instance = await method(request.payload);
  
        return instance;
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },

    config: defaultConfig,
  });
};

const destroy = (server, a, b, names) => {
  server.route({
    method: 'DELETE',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.singular}/{bid}`,

    async handler(request, reply) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);
  
        const base = await a.findOne({
          where: {
            [a.primaryKeyField]: request.params.aid,
          },
        });
  
        where[b.primaryKeyField] = request.params.bid;
  
        const method = getMethod(base, names.b, false, 'get');
        const instance = await method({ where, include });
        await instance.destroy();

        return instance
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },

    config: defaultConfig,
  });
};

const update = (server, a, b, names) => {
  server.route({
    method: 'PUT',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.singular}/{bid}`,

    async handler(request, reply) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);
  
        const base = await a.findOne({
          where: {
            id: request.params.aid,
          },
        });
  
        where[b.primaryKeyField] = request.params.bid;
  
        const method = getMethod(base, names.b, false);
  
        const instance = await method({ where, include });
        await instance.update(request.payload);
  
        return instance;
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },
    config: defaultConfig,
  });
};

module.exports = {
  oneToOne,
  get,
  create,
  destroy,
  update
}
