module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    cityId: DataTypes.INTEGER
  }, {})

  Team.associate = (models) => {
    models.Team.belongsTo(models.City, {
      foreignKey: { name: 'cityId' }
    })
    models.Team.hasMany(models.Player, {
      foreignKey: { name: 'teamId' }
    })
  }

  return Team
}
