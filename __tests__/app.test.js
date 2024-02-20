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
        const { apiData } = response.body;
        expect(typeof apiData).toBe("object");
        expect(Array.isArray(apiData)).toBe(false);
      });
  });

  test("should contain correct information", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const { apiData } = response.body;
        expect(apiData).toEqual(endpoints);
      });
  });
});

describe("get articles by id", () => {
  test("should respond with an object with correct keys ", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const { article } = response.body;
        expect(typeof article).toBe("object");
        expect(Array.isArray(article)).toBe(false);
        expect(typeof article.author).toBe("string");
        expect(typeof article.title).toBe("string");
        expect(typeof article.article_id).toBe("number");
        expect(typeof article.body).toBe("string");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.votes).toBe("number");
        expect(typeof article.article_img_url).toBe("string");
      });
  });

  test("should return correct data for article", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const { article } = response.body;
        const expected = {
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T19:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        expect(article).toEqual(expected);
      });
  });

  test("should respond with 404 for valid but non existent request", () => {
    return request(app)
      .get("/api/articles/1000")
      .expect(404)
      .then((response) => {
        const {msg} = response.body;
        expect(msg).toBe("article not found");
      });
  });

  test('should respond with 400 error for invalid request', () => {
    return request(app)
      .get("/api/articles/robot")
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("Bad request");
      });
  });
});
