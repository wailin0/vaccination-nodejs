module.exports = (sequelize, Datatypes) => {
  const users = sequelize.define("users", {
    username: {
      type: Datatypes.STRING,
      allowNull: false,
    },
    email: {
      type: Datatypes.STRING,
      allowNull: false,
    },
    password: {
      type: Datatypes.STRING,
      allowNull: false,
    },
  });

  return users;
};
