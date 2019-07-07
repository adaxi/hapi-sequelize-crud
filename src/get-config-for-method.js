const { set, get } = require('lodash');
const Joi = require('@hapi/joi');
const { Op } = require('sequelize');

// if the custom validation is a joi object we need to concat
// else, assume it's an plain object and we can just add it in with .keys
const concatToJoiObject = (joi, candidate) => {
  if (!candidate) return joi;
  else if (candidate.isJoi) return joi.concat(candidate);
  else return joi.keys(candidate);
};

const sequelizeOperators = {
  [Op.and]: Joi.any(),
  [Op.or]: Joi.any(),
  [Op.gt]: Joi.any(),
  [Op.gte]: Joi.any(),
  [Op.lt]: Joi.any(),
  [Op.lte]: Joi.any(),
  [Op.ne]: Joi.any(),
  [Op.eq]: Joi.any(),
  [Op.not]: Joi.any(),
  [Op.between]: Joi.any(),
  [Op.notBetween]: Joi.any(),
  [Op.in]: Joi.any(),
  [Op.notIn]: Joi.any(),
  [Op.like]: Joi.any(),
  [Op.notLike]: Joi.any(),
  [Op.iLike]: Joi.any(),
  [Op.notILike]: Joi.any(),
  [Op.overlap]: Joi.any(),
  [Op.contains]: Joi.any(),
  [Op.contained]: Joi.any(),
  [Op.any]: Joi.any(),
  [Op.col]: Joi.any(),
};

const whereMethods = [
  'list',
  'get',
  'scope',
  'destroy',
  'destoryScope',
  'destroyAll',
];

const includeMethods = [
  'list',
  'get',
  'scope',
  'destoryScope',
];

const payloadMethods = [
  'create',
  'update',
];

const scopeParamsMethods = [
  'destroyScope',
  'scope',
];

const idParamsMethods = [
  'get',
  'update',
];

const restrictMethods = [
  'list',
  'scope',
];

const getConfigForMethod = ({
  method, attributeValidation, associationValidation, scopes = [], config = {},
}) => {
  const hasWhere = whereMethods.includes(method);
  const hasInclude = includeMethods.includes(method);
  const hasPayload = payloadMethods.includes(method);
  const hasScopeParams = scopeParamsMethods.includes(method);
  const hasIdParams = idParamsMethods.includes(method);
  const hasRestrictMethods = restrictMethods.includes(method);
  // clone the config so we don't modify it on multiple passes.
  let methodConfig = { ...config, validate: { ...config.validate } };

  if (hasWhere) {
    const query = concatToJoiObject(Joi.object()
      .keys({
        ...attributeValidation,
        ...sequelizeOperators,
      }),
      get(methodConfig, 'validate.query')
    );

    methodConfig = set(methodConfig, 'validate.query', query);
  }

  if (hasInclude) {
    const query = concatToJoiObject(Joi.object()
      .keys({
        ...associationValidation,
      }),
      get(methodConfig, 'validate.query')
    );

    methodConfig = set(methodConfig, 'validate.query', query);
  }

  if (hasPayload) {
    const payload = concatToJoiObject(Joi.object()
      .keys({
        ...attributeValidation,
      }),
      get(methodConfig, 'validate.payload')
    );

    methodConfig = set(methodConfig, 'validate.payload', payload);
  }

  if (hasScopeParams) {
    const params = concatToJoiObject(Joi.object()
      .keys({
        scope: Joi.string().valid(...scopes),
      }),
      get(methodConfig, 'validate.params')
    );

    methodConfig = set(methodConfig, 'validate.params', params);
  }

  if (hasIdParams) {
    const params = concatToJoiObject(Joi.object()
      .keys({
        id: Joi.any(),
      }),
      get(methodConfig, 'validate.params')
    );

    methodConfig = set(methodConfig, 'validate.params', params);
  }

  if (hasRestrictMethods) {
    const query = concatToJoiObject(Joi.object()
      .keys({
        limit: Joi.number().min(0).integer(),
        offset: Joi.number().min(0).integer(),
        order: [Joi.array(), Joi.string()],
      }),
      get(methodConfig, 'validate.query')
    );

    methodConfig = set(methodConfig, 'validate.query', query);
  }

  return methodConfig;
};

module.exports = {
  getConfigForMethod,
  whereMethods,
  includeMethods,
  payloadMethods,
  scopeParamsMethods,
  idParamsMethods,
  restrictMethods,
  sequelizeOperators
}
