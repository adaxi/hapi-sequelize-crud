const { Server } = require('@hapi/hapi');
const Sequelize = require('sequelize');
const portfinder = require('portfinder');
const path = require('path');
const Promise = require('bluebird');
const Qs = require('qs')

const getPort = Promise.promisify(portfinder.getPort);
const modelsPath = path.join(__dirname, 'fixtures', 'models');
const modelsGlob = path.join(modelsPath, '**', '*.js');
const dbName = 'db';

// these are what's in the fixtures dir
const modelNames = [
  { Singluar: 'City', singular: 'city', Plural: 'Cities', plural: 'cities' },
  { Singluar: 'Team', singular: 'team', Plural: 'Teams', plural: 'teams' },
  { Singluar: 'Player', singular: 'player', Plural: 'Players', plural: 'players' },
];


module.exports = (test) => {
  test.beforeEach('get an open port', async (t) => {
    t.context.port = await getPort();
  });

  test.beforeEach('setup server', async (t) => {
    const sequelize = t.context.sequelize = new Sequelize({
      dialect: 'sqlite',
      logging: false,
    });

    const server = t.context.server = new Server({
      host: '0.0.0.0',
      port: t.context.port,
      query: {
        parser: (query) => Qs.parse(query)
      }
    });

    await server.register([
      {
        plugin: require('hapi-sequelizejs'),
        options: {
          name: dbName,
          models: [modelsGlob],
          sequelize,
          sync: true,
          forceSync: true,
        },
      },
      {
        plugin: require('../src/index.js'),
        options: {
          name: dbName,
        },
      }
    ]);

  });

  test.beforeEach('create data', async (t) => {
    const { Player, Team, City } = t.context.sequelize.models;
    const city1 = await City.create({ name: 'Healdsburg' });
    const team1 = await Team.create({ name: 'Baseballs', cityId: city1.id });
    const team2 = await Team.create({ name: 'Footballs', cityId: city1.id });
    const player1 = await Player.create({
      name: 'Cat', teamId: team1.id, active: true,
    });
    const player2 = await Player.create({ name: 'Pinot', teamId: team1.id });
    const player3 = await Player.create({ name: 'Syrah', teamId: team2.id });
    t.context.instances = { city1, team1, team2, player1, player2, player3 };
  });

  // kill the server so that we can exit and don't leak memory
  test.afterEach('stop the server', (t) => t.context.server.stop());

  return { modelNames };
};
