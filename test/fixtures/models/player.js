const { Op } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    teamId: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN
  }, {
    scopes: {
      returnsOne: {
        where: {
          active: true
        }
      },
      returnsNone: {
        where: {
          name: 'notaname'
        }
      },
      returnsAll: {
        where: {
          name: {
            [Op.ne]: 'notaname'
          }
        }
      }
    }
  })

  Player.associate = (models) => {
    models.Player.belongsTo(models.Team, {
      foreignKey: { name: 'teamId' }
    })
  }

  return Player
}
