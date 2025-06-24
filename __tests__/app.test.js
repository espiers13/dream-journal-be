const db = require("../db/index.js");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const request = require("supertest");
const app = require("../app");
const endpoints = require("../endpoints.json");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => {
  return db.end();
});

describe("Endpoints test - GET /api", () => {
  test("status code 200: will return a json representation of all of the available endpoints of the APP", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toMatchObject(endpoints);
      });
  });
});

describe("Login test - POST /api/auth/login", () => {
  test("Status code 200: returns the user object when correct username and password are entered", () => {
    return request(app)
      .post("/api/auth/login")
      .send({ username: "test", password: "test" })
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({
          id: 1,
          username: "test",
          email: "test@test.com",
        });
      });
  });
  test("Status code 401: returns appropriate error status and message when user does not exist", () => {
    return request(app)
      .post("/api/auth/login")
      .send({ username: "notauser", password: "test" })
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("User not found");
      });
  });
  test("Status code 401: returns appropriate error status and message when username and password do not match", () => {
    return request(app)
      .post("/api/auth/login")
      .send({ username: "test", password: "notapassword" })
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid password");
      });
  });
});

describe("New user test - POST /api/users", () => {
  test("Status code 201: accepts new user object and adds to database, returns user object", () => {
    const newUser = {
      username: "betty",
      email: "betty@cats.com",
      password: "catsrule",
    };

    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .then(({ body }) => {
        expect(body).toHaveProperty("username");
        expect(body).toHaveProperty("email");
        expect(body.id).toBe(6);
        expect(body.username).toBe("betty");
      });
  });
  test("Status code 409: returns appropriate error status and message when username already exists", () => {
    const newUser = {
      username: "test",
      email: "betty@cats.com",
      password: "catsrule",
    };
    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(409)
      .then(({ body }) => {
        expect(body.msg).toBe("Username already exists");
      });
  });
  test("Status code 409: returns appropriate error status and message when email already exists", () => {
    const newUser = {
      username: "betty",
      email: "test@test.com",
      password: "catsrule",
    };
    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(409)
      .then(({ body }) => {
        expect(body.msg).toBe("Email already exists");
      });
  });
});

describe("Delete user test - POST /api/auth/delete/user", () => {
  test("Status code 204: deletes user from database when username and password match", () => {
    const userData = {
      username: "test",
      password: "test",
    };
    return request(app)
      .post("/api/auth/delete/user")
      .send(userData)
      .expect(204);
  });
  test("Status code 401: returns appropriate error status and message when username and password do not match", () => {
    return request(app)
      .post("/api/auth/delete/user")
      .send({ username: "test", password: "notapassword" })
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid password");
      });
  });
});

describe.only("Get dreams test - GET /api/:user_id/dreams", () => {
  test("Status code 200: will return an array of all dream objects when passed through a user_id", () => {
    return request(app)
      .get("/api/1/dreams")
      .expect(200)
      .then(({ body }) => {
        body.forEach((dream) => {
          expect(dream).toHaveProperty("date_logged");
          expect(dream).toHaveProperty("description");
          expect(dream).toHaveProperty("tags");
          expect(dream).toHaveProperty("id");
        });
      });
  });
  test("Status code 200: will return an empty array when user has no logged dreams", () => {
    return request(app)
      .get("/api/3/dreams")
      .expect(200)
      .then(({ body }) => {
        expect(body.length).toBe(0);
      });
  });
});

describe("Get dreams filtered by tag - GET /api/:user_id/dreams?tag=tagName", () => {
  test("Status code 200: returns dreams with the specified tag", () => {
    return request(app)
      .get("/api/1/dreams?tag=anxiety")
      .expect(200)
      .then(({ body }) => {
        body.forEach((dream) => {
          expect(dream.tags).toContain("anxiety");
          expect(dream).toHaveProperty("date_logged");
          expect(dream).toHaveProperty("description");
        });
      });
  });
});

describe("Get dreams filtered by date range - GET /api/:user_id/dreams?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD", () => {
  test("Status code 200: returns dreams within date range", () => {
    return request(app)
      .get("/api/1/dreams?start_date=2024-01-01&end_date=2024-12-31")
      .expect(200)
      .then(({ body }) => {
        body.forEach((dream) => {
          const date = new Date(dream.date_logged);
          expect(date >= new Date("2024-01-01")).toBe(true);
          expect(date <= new Date("2024-12-31")).toBe(true);
          expect(dream).toHaveProperty("tags");
          expect(dream).toHaveProperty("description");
        });
      });
  });
});

describe("Get dreams sorted by date - GET /api/:user_id/dreams?sort=date_asc|date_desc", () => {
  test("Status code 200: returns dreams sorted ascending by date_logged", () => {
    return request(app)
      .get("/api/1/dreams?sort=date_asc")
      .expect(200)
      .then(({ body }) => {
        for (let i = 1; i < body.length; i++) {
          expect(
            new Date(body[i - 1].date_logged) <= new Date(body[i].date_logged)
          ).toBe(true);
        }
      });
  });

  test("Status code 200: returns dreams sorted descending by date_logged", () => {
    return request(app)
      .get("/api/1/dreams?sort=date_desc")
      .expect(200)
      .then(({ body }) => {
        for (let i = 1; i < body.length; i++) {
          expect(
            new Date(body[i - 1].date_logged) >= new Date(body[i].date_logged)
          ).toBe(true);
        }
      });
  });
});

describe("Post dreams test - POST /api/:user_id/dreams", () => {
  test("Status code 201: posts a dream to database and returns dream", () => {
    const newDream = {
      date_logged: "2025-06-22",
      description: "I was a giant marshmallow",
      tags: ["fun"],
    };

    const expected = {
      user_id: 1,
      date_logged: "2025-06-21T23:00:00.000Z",
      description: "I was a giant marshmallow",
      tags: ["fun"],
    };

    return request(app)
      .post("/api/1/dreams")
      .send(newDream)
      .expect(201)
      .then(({ body }) => {
        expect(body).toMatchObject(expected);
      });
  });

  test("Status 400: fails when description is missing", () => {
    const newDream = {
      date_logged: "2025-06-22",
      tags: ["fun"],
    };

    return request(app)
      .post("/api/1/dreams")
      .send(newDream)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Must include a description");
      });
  });
});

describe("Get dream by ID test - GET /api/dreams/:dream_id", () => {
  test("Status code 200: returns an object of dream data when passed through a dream_id", () => {
    const expected = {
      id: 2,
      user_id: 2,
      date_logged: "2025-06-17T23:00:00.000Z",
      description:
        "I was in school again but couldn’t remember my timetable. The classrooms kept shifting and everyone spoke gibberish.",
      tags: ["anxiety", "recurring"],
    };

    return request(app)
      .get("/api/dreams/2")
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject(expected);
      });
  });
  test("Status code 404: returns appropriate status code and error message when dream does not exist", () => {
    return request(app)
      .get("/api/dreams/200")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Dream does not exist");
      });
  });
});

describe("Delete dream test - DELETE /api/dreams/:dream_id", () => {
  test("Status code 204: deletes dream from database when passed through dream_id", () => {
    return request(app).delete("/api/dreams/1").expect(204);
  });
  test("Status code 404: returns appropriate status code and error message when dream does not exist", () => {
    return request(app)
      .delete("/api/dreams/200")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Dream does not exist");
      });
  });
});
