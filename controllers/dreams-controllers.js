const {
  fetchDreamsByUser,
  createNewDream,
  fetchDreamById,
  removeDreamById,
} = require("../models/dreams-models");

exports.getDreamsByUser = (req, res, next) => {
  const { user_id } = req.params;
  const { start_date, end_date, sort } = req.query;

  // Normalize tag to always be an array
  const tags = req.query.tag
    ? Array.isArray(req.query.tag)
      ? req.query.tag
      : [req.query.tag]
    : [];

  fetchDreamsByUser(user_id, tags, start_date, end_date, sort)
    .then((dreamsData) => {
      res.status(200).send(dreamsData);
    })
    .catch(next);
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
