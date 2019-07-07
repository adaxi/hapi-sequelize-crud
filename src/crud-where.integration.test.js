const test = require('ava');
const setup = require('../test/integration-setup.js');
require('sinon-bluebird');

const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;

setup(test);

test('single result /team?name=Baseball', async (t) => {
  const { server, instances } = t.context;
  const { team1 } = instances;
  const url = `/team?name=${team1.name}`;
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.id, team1.id);
  t.is(result.name, team1.name);
});

test('no results /team?name=Baseball&id=2', async (t) => {
  const { server, instances } = t.context;
  const { team1 } = instances;
  // this doesn't exist in our fixtures
  const url = `/team?name=${team1.name}&id=2`;
  const method = 'GET';

  const res = await server.inject({ url, method });
  const { statusCode } = res
  console.log(res)
  t.is(statusCode, STATUS_NOT_FOUND);
});

test('single result from list query /teams?name=Baseball', async (t) => {
  const { server, instances } = t.context;
  const { team1 } = instances;
  const url = `/teams?name=${team1.name}`;
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  console.log(result)
  t.is(statusCode, STATUS_OK);
  t.is(result[0].id, team1.id);
  t.is(result[0].name, team1.name);
  t.is(result.length, 1)
});

test('multiple results from list query /players?teamId=1', async (t) => {
  const { server, instances } = t.context;
  const { team1, player1, player2 } = instances;
  const url = `/players?teamId=${team1.id}`;
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  const playerIds = result.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));
});

