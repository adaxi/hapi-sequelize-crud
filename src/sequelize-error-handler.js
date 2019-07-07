const Boom = require('@hapi/boom');

module.exports = (e) => {
  if (e.original) {
    const { code, detail, hint } = e.original;
    let error;

    // pg error codes https://www.postgresql.org/docs/9.5/static/errcodes-appendix.html
    if (code && (code.startsWith('22') || code.startsWith('23'))) {
      error = Boom.boomify(e, { statusCode: 406 });
    } else if (code && (code.startsWith('42'))) {
      error = Boom.boomify(e, { statusCode: 422 });
    // TODO: we could get better at parse postgres error codes
    } else {
      // use a 502 error code since the issue is upstream with postgres, not
      // this server
      error = Boom.boomify(e, { statusCode: 502 });
    }

    // detail tends to be more specific information. So, if we have it, use.
    if (detail) {
      error.message += `: ${detail}`;
      error.reformat();
    }


    // hint might provide useful information about how to fix the problem
    if (hint) {
      error.message += ` Hint: ${hint}`;
      error.reformat();
    }

    throw error;
  } else if (!e.isBoom) {
    const { message } = e;
    let err;

    if (e.name === 'SequelizeValidationError')
      err = Boom.badData(message);
    else if (e.name === 'SequelizeConnectionTimedOutError')
      err = Boom.gatewayTimeout(message);
    else if (e.name === 'SequelizeHostNotReachableError')
      err = Boom.serverUnavailable(message);
    else if (e.name === 'SequelizeUniqueConstraintError')
      err = Boom.conflict(message);
    else if (e.name === 'SequelizeForeignKeyConstraintError')
      err = Boom.expectationFailed(message);
    else if (e.name === 'SequelizeExclusionConstraintError')
      err = Boom.expectationFailed(message);
    else if (e.name === 'SequelizeConnectionError')
      err = Boom.badGateway(message);
    else err = Boom.badImplementation(message);

    throw err;
  } else {
    throw e;
  }
}