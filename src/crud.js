const _ = require('lodash');
const Path = require('path');
const Joi = require('@hapi/joi');
const { notFound, badRequest } = require('@hapi/boom');
const SequelizeErrorHandler = require('./sequelize-error-handler');

const { parseInclude, parseWhere, parseLimitAndOffset, parseOrder } = require('./utils');
const associations = require('./associations/index');
const { getConfigForMethod } = require('./get-config-for-method.js');

const createAll = ({
  server,
  model,
  prefix,
  config,
  attributeValidation,
  associationValidation,
  scopes,
}) => {
  Object.keys(methods).forEach((method) => {
    methods[method]({
      server,
      model,
      prefix,
      config: getConfigForMethod({
        method,
        attributeValidation,
        associationValidation,
        config,
        scopes,
      }),
    });
  });
};

/*
The `models` option, becomes `permissions`, and can look like:

```
models: ['cat', 'dog']
```

or

```
models: {
  cat: ['list', 'get']
  , dog: true // all
}
```

*/

const crud = (server, model, { prefix, defaultConfig: config, models: permissions }) => {
  const modelName = model._singular;
  const modelAttributes = Object.keys(model.rawAttributes);
  const associatedModelNames = Object.keys(model.associations);
  const modelAssociations = [
    ...associatedModelNames,
    ..._.flatMap(associatedModelNames, (associationName) => {
      const { target } = model.associations[associationName];
      const { _singular, _plural, _Singular, _Plural } = target;
      return [_singular, _plural, _Singular, _Plural];
    }),
  ].filter(Boolean);

  const attributeValidation = modelAttributes.reduce((params, attribute) => {
    // TODO: use joi-sequelize
    params[attribute] = Joi.any();
    return params;
  }, {});

  const validAssociations = modelAssociations.length
    ? Joi.string().valid(...modelAssociations)
    : Joi.valid(null);
  const associationValidation = {
    include: [Joi.array().items(validAssociations), validAssociations],
  };

  const scopes = Object.keys(model.options.scopes);

  // if we don't have any permissions set, just create all the methods
  if (!permissions) {
    createAll({
      server,
      model,
      prefix,
      config,
      attributeValidation,
      associationValidation,
      scopes,
    });
  // if permissions are set, but we can't parse them, throw an error
  } else if (!Array.isArray(permissions)) {
    throw new Error('hapi-sequelize-crud: `models` property must be an array');
  // if permissions are set, but the only thing we've got is a model name, there
  // are no permissions to be set, so just create all methods and move on
  } else if (permissions.includes(modelName)) {
    createAll({
      server,
      model,
      prefix,
      config,
      attributeValidation,
      associationValidation,
      scopes,
    });
  // if we've gotten here, we have complex permissions and need to set them
  } else {
    const permissionOptions = permissions.filter((permission) => {
      return permission.model === modelName;
    });

    permissionOptions.forEach((permissionOption) => {
      if (_.isPlainObject(permissionOption)) {
        const permissionConfig = permissionOption.config || config;

        if (permissionOption.methods) {
          permissionOption.methods.forEach((method) => {
            methods[method]({
              server,
              model,
              prefix,
              config: getConfigForMethod({
                method,
                attributeValidation,
                associationValidation,
                scopes,
                config: permissionConfig,
              }),
            });
          });
        } else {
          createAll({
            server,
            model,
            prefix,
            attributeValidation,
            associationValidation,
            scopes,
            config: permissionConfig,
          });
        }
      }
    });
  }
};

const list = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'GET',
    path: Path.join(prefix, model._plural),
    async handler(request, h) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);
        const { limit, offset } = parseLimitAndOffset(request);
        const order = parseOrder(request);

        const list = await model.findAll({
          where, include, limit, offset, order,
        });

        if (!list.length) {
          throw notFound('Nothing found.');
        }
        return list.map((item) => item.toJSON());
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },

    config,
  });
};

const get = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'GET',
    path: Path.join(prefix, model._singular, '{id?}'),
    async handler(request, h) {
      try {
        if (request.query) {
          console.log('HERE1', request.query)
        }
        const include = parseInclude(request);
        const where = parseWhere(request);
        if (where) {
          console.log('HERE', where)
        }
        const { id } = request.params;
        if (id) where[model.primaryKeyField] = id;

        const instance = await model.findOne({ where, include });

        if (!instance) {
          throw notFound(id ? `${id} not found.` : `Nothing found.`);
        }

        return instance.toJSON();
      } catch (err) {
        console.log(err)
        SequelizeErrorHandler(err)
      }
    },
    config,
  });
};

const scope = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'GET',
    path: Path.join(prefix, model._plural, '{scope}'),

    async handler(request, h) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);
        const { limit, offset } = parseLimitAndOffset(request);
        const order = parseOrder(request);

        if (!(Object.keys(model.options.scopes || {}).includes(request.params.scope))) {
          throw badRequest('Invalid scope.')
        }

        const list = await model.scope(request.params.scope).findAll({
          include, where, limit, offset, order,
        });

        if (!list.length) {
          throw notFound('Nothing found.');
        }

        return list.map((item) => item.toJSON());
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },
    config,
  });
};

const create = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'POST',
    path: Path.join(prefix, model._singular),
    async handler(request, h) {
      try {
        const instance = await model.create(request.payload);
        return instance.toJSON();
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },
    config,
  });
};

const destroy = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'DELETE',
    path: Path.join(prefix, model._singular, '{id?}'),

    async handler(request, h) {
      try {
        const where = parseWhere(request);
        const { id } = request.params;
        if (id) where[model.primaryKeyField] = id;
  
        const list = await model.findAll({ where });
  
        if (!list.length) {
          throw notFound(id ? `${id} not found.`: 'Nothing found.')
        }
  
        await Promise.all(list.map(instance => instance.destroy()));
  
        const listAsJSON = list.map((item) => item.toJSON());
        return listAsJSON.length === 1 ? listAsJSON[0] : listAsJSON
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },
    config,
  });
};

const destroyAll = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'DELETE',
    path: Path.join(prefix, model._plural),

    async handler(request, h) {
      try {
        const where = parseWhere(request);
  
        const list = await model.findAll({ where });
  
        if (!list.length) {
          throw notFound('Nothing found.')
        }
  
        await Promise.all(list.map(instance => instance.destroy()));
  
        const listAsJSON = list.map((item) => item.toJSON());
        return listAsJSON.length === 1 ? listAsJSON[0] : listAsJSON
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },

    config,
  });
};

const destroyScope = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'DELETE',
    path: Path.join(prefix, model._plural, '{scope}'),

    async handler(request, h) {
      try {
        const include = parseInclude(request);
        const where = parseWhere(request);
        if (!(Object.keys(model.options.scopes || {}).includes(request.params.scope))) {
          throw badRequest('Invalid scope.')
        }

        const list = await model.scope(request.params.scope).findAll({ include, where });
  
        if (!list.length) {
          throw notFound('Nothing found.')
        }
  
        await Promise.all(list.map(instance => instance.destroy()));
  
        const listAsJSON = list.map((item) => item.toJSON());
        return listAsJSON.length === 1 ? listAsJSON[0] : listAsJSON;
      } catch (err) {
        SequelizeErrorHandler(err)
      }
    },
    config,
  });
};

const update = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'PUT',
    path: Path.join(prefix, model._singular, '{id}'),

    async handler(request, h) {
      try {
        const { id } = request.params;
        const instance = await model.findByPk(id);
  
        if (!instance) {
          throw notFound(`${id} not found.`);
        } 
  
        await instance.update(request.payload);
  
        return instance.toJSON()
      } catch (err) {
        SequelizeErrorHandler(err)
      }
     
    },

    config,
  });
};

const methods = {
  list, get, scope, create, destroy, destroyAll, destroyScope, update,
};

module.exports = {
  crud,
  associations,
  list,
  get,
  scope,
  create,
  destroy,
  destroyAll,
  destroyScope,
  update
}
