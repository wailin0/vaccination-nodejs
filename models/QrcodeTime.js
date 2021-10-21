module.exports = (sequelize, DataTypes) => {
  const qrtimes = sequelize.define("qrtimes", {
    times: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });
  qrtimes.associate = (models) => {
    qrtimes.belongsTo(models.vaccinatedusers, {
      onDelete: "cascade",
      foreignKey: "user_id",
    });
  };

  return qrtimes;
};
