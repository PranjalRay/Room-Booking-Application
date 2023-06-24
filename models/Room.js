const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
  const Room = sequelize.define('Room', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return Room;
};
