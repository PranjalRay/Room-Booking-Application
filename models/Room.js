const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Room", {
    // Existing attributes
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // New attribute
    isBooked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
};
