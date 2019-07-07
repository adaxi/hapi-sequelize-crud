module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define('City', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
  }, {});

  City.associate = (models) => {
    models.City.hasMany(models.Team, {
      foreignKey: { name: 'cityId' },
    });
  }

  return City
};
