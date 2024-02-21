const request = require("supertest");
const app = require("../db/app/app.js");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const { getFileContents } = require("../file-utils/getFileContents");
require("jest-sorted");

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

describe("GET /api", () => {
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

describe("GET /api/topics", () => {
  test("should respond with an array of topic objects ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const { topics } = response.body;
        expect(topics.length).toBe(3);
        expect(Array.isArray(topics)).toBe(true);
        expect(typeof topics[0]).toBe("object");
      });
  });
  test("array should contain correct properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const { topics } = response.body;
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

describe("GET /api/comments", () => {
  test("should respond with an array of comment objects ", () => {
    return request(app)
      .get("/api/comments")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments.length).toBe(18);
        expect(Array.isArray(comments)).toBe(true);
        expect(typeof comments[0]).toBe("object");
      });
  });
  test("array should contain correct properties", () => {
    return request(app)
      .get("/api/comments")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        comments.forEach((comment) => {
          expect(typeof comment.article_id).toBe("number");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.votes).toBe("number");
        });
      });
  });

  test("should respond with correct values", () => {
    return request(app)
      .get("/api/comments")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments[0]).toHaveProperty("article_id", 9);
        expect(comments[0]).toHaveProperty("author", "butter_bridge");
        expect(comments[0]).toHaveProperty(
          "body",
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
        );
        expect(comments[0]).toHaveProperty("comment_id", 1);
        expect(comments[0]).toHaveProperty(
          "created_at",
          "2020-04-06T11:17:00.000Z"
        );
        expect(comments[0]).toHaveProperty("votes", 16);
      });
  });
});

describe("GET /api/articles", () => {
  test("should respond with sorted array of article objects ", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(articles.length).toBe(13);
        expect(Array.isArray(articles)).toBe(true);
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("array should contain correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("string");
        });
      });
  });

  test("should respond with correct values", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(articles[6]).toHaveProperty("article_id", 1);
        expect(articles[6]).toHaveProperty(
          "title",
          "Living in the shadow of a great man"
        );
        expect(articles[6]).toHaveProperty("topic", "mitch");
        expect(articles[6]).toHaveProperty("author", "butter_bridge");
        expect(articles[6]).toHaveProperty(
          "created_at",
          "2020-07-09T19:11:00.000Z"
        );
        expect(articles[6]).toHaveProperty("votes", 100);
        expect(articles[6]).toHaveProperty(
          "article_img_url",
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
        expect(articles[6]).toHaveProperty("comment_count", "11");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
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
        const { msg } = response.body;
        expect(msg).toBe("article not found");
      });
  });

  test("should respond with 400 error for invalid request", () => {
    return request(app)
      .get("/api/articles/robot")
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("bad request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("should respond with an object with an array of comments", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBe(11);
      });
  });

  test("comment objects should have the correct keys", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.article_id).toBe("number");
        });
      });
  });

  test("should return correct data for comments", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        const expected = {
          article_id: 1,
          author: "butter_bridge",
          body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          comment_id: 2,
          created_at: "2020-10-31T02:03:00.000Z",
          votes: 14,
        };
        expect(comments[0]).toEqual(expected);
      });
  });

  test("Should respond with empty array for article without comments", () => {
    return request(app)
      .get("/api/articles/10/comments")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments).toEqual([]);
      });
  });

  test("should respond with 404 for valid but non existent request", () => {
    return request(app)
      .get("/api/articles/1000/comments")
      .expect(404)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("article not found");
      });
  });

  test("should respond with 400 error for invalid request", () => {
    return request(app)
      .get("/api/articles/robot/comments")
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("bad request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("should respond with object with correct keys", () => {
    const body = {
      username: "lurker",
      body: "robots are robots because robot makes robot",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(body)
      .expect(201)
      .then((response) => {
        const { comment } = response.body;
        expect(typeof comment).toBe("object");
        expect(Array.isArray(comment)).toBe(false);
        expect(typeof comment.comment_id).toBe("number");
        expect(typeof comment.votes).toBe("number");
        expect(typeof comment.created_at).toBe("string");
        expect(typeof comment.author).toBe("string");
        expect(typeof comment.body).toBe("string");
        expect(typeof comment.article_id).toBe("number");
      });
  });
  test("should respond with object with correct properties", () => {
    const body = {
      username: "lurker",
      body: "robots are robots because robot makes robot",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(body)
      .expect(201)
      .then((response) => {
        const { comment } = response.body;
        expect(comment).toHaveProperty("article_id", 1);
        expect(comment).toHaveProperty("author", "lurker");
        expect(comment).toHaveProperty(
          "body",
          "robots are robots because robot makes robot"
        );
        expect(comment).toHaveProperty("comment_id", 19);
        expect(comment).toHaveProperty("votes", 0);
      });
  });
  test("should ignore unneccesary info", () => {
    const body = {
      username: "lurker",
      body: "robots are robots because robot makes robot",
      nickname: "lurkerino",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(body)
      .expect(201)
      .then((response) => {
        const { comment } = response.body;
        expect(comment).toHaveProperty("article_id", 1);
        expect(comment).toHaveProperty("author", "lurker");
        expect(comment).toHaveProperty(
          "body",
          "robots are robots because robot makes robot"
        );
        expect(comment).toHaveProperty("comment_id", 19);
        expect(comment).toHaveProperty("votes", 0);
        expect(comment).not.toHaveProperty("nickname", "lurkerino");
        expect(typeof comment.nickname).toBe("undefined");
      });
  });
  test("should be included in comments for target article", () => {
    const body = {
      username: "lurker",
      body: "robots are robots because robot makes robot",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(body)
      .expect(201)
      .then(() => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then((response) => {
            const { comments } = response.body;
            expect(Array.isArray(comments)).toBe(true);
            expect(comments.length).toBe(12);
          });
      });
  });

  test("should respond with 404 for valid but non existent article request", () => {
    const body = {
      username: "lurker",
      body: "robots are robots because robot makes robot",
    };
    return request(app)
      .post("/api/articles/1000/comments")
      .send(body)
      .expect(404)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("article not found");
      });
  });

  test("should respond with 400 error for invalid article request", () => {
    const body = {
      username: "lurker",
      body: "robots are robots because robot makes robot",
    };
    return request(app)
      .post("/api/articles/robot/comments")
      .send(body)
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("bad request");
      });
  });

  test("should respond with 400 error for invalid body", () => {
    const body = {
      username: "lurker",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(body)
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("bad request");
      });
  });

  test("should respond with 404 error for invalid username", () => {
    const body = {
      username: "robot",
      body: "robots are robots because robot makes robot",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(body)
      .expect(404)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("username not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("should respond with updated article", () => {
    const body = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/1")
      .send(body)
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
          votes: 105,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        expect(typeof article).toBe("object");
        expect(Array.isArray(article)).toBe(false);
        expect(article).toEqual(expected);
      });
  });

  test("should allow subtraction of votes", () => {
    const body = { inc_votes: -10 };
    return request(app)
      .patch("/api/articles/1")
      .send(body)
      .expect(200)
      .then((response) => {
        const { article } = response.body;
        expect(article.votes).toBe(90);
      });
  });

  test("should respond with unchanged article if no increment included", () => {
    const body = {};
    return request(app)
      .patch("/api/articles/1")
      .send(body)
      .expect(200)
      .then((response) => {
        const { article } = response.body;
        expect(article.votes).toBe(100);
      });
  });
  test("should respond with 404 for valid but non existent article request", () => {
    const body = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/1000")
      .send(body)
      .expect(404)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("article not found");
      });
  });

  test("should respond with 400 error for invalid article request", () => {
    const body = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/robot")
      .send(body)
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("bad request");
      });
  });

  test("should respond with 400 error for invalid update", () => {
    const body = { inc_votes: "robot" };
    return request(app)
      .patch("/api/articles/1")
      .send(body)
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("should respond with correct status code", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });

  test("should remove comment from database", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/comments")
          .expect(200)
          .then((response) => {
            const { comments } = response.body;
            expect(Array.isArray(comments)).toBe(true);
            expect(comments.length).toBe(17);
          });
      });
  });

  test("should respond with 404 for valid but non existent comment request", () => {
    return request(app)
      .delete("/api/comments/1000")
      .expect(404)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("comment not found");
      });
  });

  test("should respond with 400 error for invalid comment request", () => {
    return request(app)
      .delete("/api/comments/robot")
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("bad request");
      });
  });
});
