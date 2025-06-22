const { getEndpoints } = require("./endpoints-controller");
const {
  getUserDetails,
  createNewUser,
  deleteUser,
} = require("./users-controllers");
const {
  getDreamsByUser,
  postDreamToUser,
  getDreamById,
  deleteDreamById,
} = require("./dreams-controllers");

module.exports = {
  getEndpoints,
  getUserDetails,
  createNewUser,
  deleteUser,
  getDreamsByUser,
  postDreamToUser,
  getDreamById,
  deleteDreamById,
};
