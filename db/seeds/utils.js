const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.hashUsersData = (usersData) => {
  return Promise.all(
    usersData.map(({ username, email, password }) => {
      return bcrypt.hash(password, saltRounds).then((hashedPassword) => {
        // Return array matching users table columns: username, email, password
        return [username, email, hashedPassword];
      });
    })
  );
};
