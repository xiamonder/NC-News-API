const request = require("supertest");
const app = require("../db/app/app.js");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const { getFileContents } = require("../file-utils/getFileContents");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => db.end());

describe("invalid enpoint error handling", () => {
  test("should return an error message of page not found", () => {
    return request(app)
      .get("/api/robot")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Page not found");
      });
  });
});

describe("get topics", () => {
  test("should respond with an array of topic objects ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const topics = response.body.topics;
        expect(topics.length).toBe(3);
        expect(Array.isArray(topics)).toBe(true);
      });
  });
  test("array should contain correct properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const topics = response.body.topics;
        topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });

  test("should respond with correct values", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const { topics } = response.body;
        expect(topics[0]).toHaveProperty("slug", "mitch");
        expect(topics[0]).toHaveProperty(
          "description",
          "The man, the Mitch, the legend"
        );
      });
  });
});

describe("get api", () => {
  let endpoints;
  beforeAll(async () => {
    endpoints = await getFileContents("endpoints.json");
  });

  test("should respond with an object", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const { apiDetails } = response.body;
        console.log(apiDetails);
        expect(typeof apiDetails).toBe("object");
      });
  });

  test("should contain correct information", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const { apiDetails } = response.body;
        expect(apiDetails).toEqual(endpoints);
      });
  });
});
