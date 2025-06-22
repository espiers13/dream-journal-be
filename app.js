const express = require("express");
const cors = require("cors");
const app = express();

const {
  getEndpoints,
  getUserDetails,
  createNewUser,
  deleteUser,
  getDreamsByUser,
  postDreamToUser,
  getDreamById,
  deleteDreamById,
} = require("./controllers/index.controllers");

const {
  handlePSQLErrors,
  handleCustomErrors,
  handleServerErrors,
} = require("./errors/errors");

app.use(express.json());
app.use(cors());

app.get("/api", getEndpoints);

app.post("/api/auth/login", getUserDetails);

app.post("/api/users", createNewUser);

app.post("/api/auth/delete/user", deleteUser);

app.get("/api/:user_id/dreams", getDreamsByUser);

app.post("/api/:user_id/dreams", postDreamToUser);

app.get("/api/dreams/:dream_id", getDreamById);

app.delete("/api/dreams/:dream_id", deleteDreamById);

// ERROR HANDLING

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
