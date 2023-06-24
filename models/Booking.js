const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
  const Booking = sequelize.define('Booking', {
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  return Booking;
};
