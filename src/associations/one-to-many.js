const _ = require('lodash');
const Joi = require('@hapi/joi');
const SequelizeErrorHandler = require('../sequelize-error-handler');

const { parseInclude, parseWhere, getMethod } = require('../utils');

let prefix;
let defaultConfig;

const oneToMany = (server, a, b, names, options) => {
  prefix = options.prefix;
  defaultConfig = options.defaultConfig;

  get(server, a, b, names);
  list(server, a, b, names);
  scope(server, a, b, names);
  scopeScope(server, a, b, names);
  destroy(server, a, b, names);
  destroyScope(server, a, b, names);
  update(server, a, b, names);
};

const get = (server, a, b, names) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.singular}/{bid}`,

    async handler(request, h) {
      try{ 
        const include = parseInclude(request);

        const base = await a.findOne({
          where: {
            [a.primaryKeyField]: request.params.aid,
          },
        });

        const method = getMethod(base, names.b);

        const list = await method({ where: {
          [b.primaryKeyField]: request.params.bid,
        }, include });

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

const list = (server, a, b, names) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.plural}`,

    async handler(request, h) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);

        const base = await a.findOne({
          where: {
            [a.primaryKeyField]: request.params.aid,
          },
        });

        const method = getMethod(base, names.b);
        const list = await method({ where, include });

        return list;
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },
    config: defaultConfig,
  });
};

const scope = (server, a, b, names) => {
  const scopes = Object.keys(b.options.scopes);

  server.route({
    method: 'GET',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.plural}/{scope}`,

    async handler(request, h) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);
  
        const base = await a.findOne({
          where: {
            [a.primaryKeyField]: request.params.aid,
          },
        });
  
        const method = getMethod(base, names.b);
        const list = await method({
          scope: request.params.scope,
          where,
          include,
        });
  
        return list;
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },
    config: _.defaultsDeep({
      validate: {
        params: Joi.object().keys({
          scope: Joi.string().valid(...scopes),
          aid: Joi.number().integer().required(),
        }),
      },
    }, defaultConfig),
  });
};

const scopeScope = (server, a, b, names) => {
  const scopes = {
    a: Object.keys(a.options.scopes),
    b: Object.keys(b.options.scopes),
  };

  server.route({
    method: 'GET',
    path: `${prefix}/${names.a.plural}/{scopea}/${names.b.plural}/{scopeb}`,

    async handler(request, h) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);
  
        const list = await b.scope(request.params.scopeb).findAll({
          where,
          include: include.concat({
            model: a.scope(request.params.scopea),
          }),
        });
  
        return list;
      } catch (err) {
        SequelizeErrorHandler
      }
    },
    config: _.defaultsDeep({
      validate: {
        params: Joi.object().keys({
          scopea: Joi.string().valid(...scopes.a),
          scopeb: Joi.string().valid(...scopes.b),
        }),
      },
    }, defaultConfig),
  });
};

const destroy = (server, a, b, names) => {
  server.route({
    method: 'DELETE',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.plural}`,

    async handler(request, h) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);
  
        const base = await a.findOne({
          where: {
            [a.primaryKeyField]: request.params.aid,
          },
        });
  
        const method = getMethod(base, names.b, true, 'get');
        const list = await method({ where, include });
        await Promise.all(list.map(item =>
          item.destroy()
        ));
  
        return list;
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },
  });
};

const destroyScope = (server, a, b, names) => {
  const scopes = Object.keys(b.options.scopes);

  server.route({
    method: 'DELETE',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.plural}/{scope}`,

    async handler(request, h) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);

        const base = await a.findOne({
          where: {
            [a.primarykeyField]: request.params.aid,
          },
        });

        const method = getMethod(base, names.b, true, 'get');

        const list = await method({
          scope: request.params.scope,
          where,
          include,
        });

        await Promise.all(list.map(instance => instance.destroy()));

        return list;
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },

    config: _.defaultsDeep({
      validate: {
        params: Joi.object().keys({
          scope: Joi.string().valid(...scopes),
          aid: Joi.number().integer().required(),
        }),
      },
    }, defaultConfig),
  });
};

const update = (server, a, b, names) => {
  server.route({
    method: 'PUT',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.plural}`,

    async handler(request, h) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);

        const base = await a.findOne({
          where: {
            [a.primaryKeyField]: request.params.aid,
          },
        });

        const method = getMethod(base, names.b);
        const list = await method({ where, include });

        await Promise.all(list.map(instance => instance.update(request.payload)));

        return list;
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },
    config: defaultConfig,
  });
};

module.exports = {
  oneToMany,
  get,
  list,
  scope,
  scopeScope,
  destroy,
  destroyScope,
  update
}
