const {
  fetchDreamsByUser,
  createNewDream,
  fetchDreamById,
  removeDreamById,
} = require("../models/dreams-models");

exports.getDreamsByUser = (req, res, next) => {
  const { user_id } = req.params;
  const { tag, start_date, end_date, sort } = req.query;

  fetchDreamsByUser(user_id, tag, start_date, end_date, sort)
    .then((dreamsData) => {
      res.status(200).send(dreamsData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postDreamToUser = (req, res, next) => {
  const { user_id } = req.params;
  const newDream = req.body;

  createNewDream(user_id, newDream)
    .then((dreamData) => {
      res.status(201).send(dreamData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getDreamById = (req, res, next) => {
  const { dream_id } = req.params;

  fetchDreamById(dream_id)
    .then((dreamData) => {
      res.status(200).send(dreamData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteDreamById = (req, res, next) => {
  const { dream_id } = req.params;
  fetchDreamById(dream_id)
    .then((dreamData) => {
      removeDreamById(dreamData.id)
        .then(() => {
          res.sendStatus(204);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};
