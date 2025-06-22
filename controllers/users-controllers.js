const { loginUser, postUser, removeUser } = require("../models/users-models");

exports.getUserDetails = (req, res, next) => {
  const { username, password } = req.body;

  loginUser(username, password)
    .then((userData) => {
      res.status(200).send(userData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.createNewUser = (req, res, next) => {
  const newUser = req.body;
  postUser(newUser)
    .then((userData) => {
      res.status(201).send(userData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteUser = (req, res, next) => {
  const { username, password } = req.body;

  loginUser(username, password)
    .then((userData) => {
      removeUser(userData.id).then(() => {
        res.sendStatus(204);
      });
    })
    .catch((err) => {
      next(err);
    });
};
