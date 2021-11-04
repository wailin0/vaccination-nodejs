module.exports = (sequelize, DataTypes) => {
  const vaccinatedusers = sequelize.define("vaccinatedusers", {
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nrc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vaccineFirstDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    vaccineSecondDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    profile: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    qrcode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });
  vaccinatedusers.associate = (models) => {
    vaccinatedusers.hasOne(models.qrtimes, {
      onDelete: "cascade",
      foreignKey: "qrtimes_id",
    });
  };
  return vaccinatedusers;
};
