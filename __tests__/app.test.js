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

describe("POST /api/topics", () => {
  test("should respond with object with correct keys", () => {
    const body = {
      slug: "frogs",
      description: "just a cool animal",
    };
    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(201)
      .then((response) => {
        const { topic } = response.body;
        expect(typeof topic).toBe("object");
        expect(Array.isArray(topic)).toBe(false);
        expect(typeof topic.slug).toBe("string");
        expect(typeof topic.description).toBe("string");
      });
  });
  test("should respond with object with correct properties", () => {
    const body = {
      slug: "frogs",
      description: "just a cool animal",
    };
    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(201)
      .then((response) => {
        const { topic } = response.body;
        expect(topic).toHaveProperty("slug", "frogs");
        expect(topic).toHaveProperty("description", "just a cool animal");
      });
  });
  test("should ignore unneccesary info", () => {
    const body = {
      slug: "frogs",
      description: "just a cool animal",
      nickname: "frogger",
    };
    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(201)
      .then((response) => {
        const { topic } = response.body;
        expect(topic).toHaveProperty("slug", "frogs");
        expect(topic).toHaveProperty("description", "just a cool animal");
        expect(topic).not.toHaveProperty("nickname", "frogger");
        expect(typeof topic.nickname).toBe("undefined");
      });
  });
  test("should be included in topics", () => {
    const body = {
      slug: "frogs",
      description: "just a cool animal",
    };
    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(201)
      .then(() => {
        return request(app)
          .get("/api/topics")
          .expect(200)
          .then((response) => {
            const { topics } = response.body;
            expect(topics.length).toBe(4);
            expect(Array.isArray(topics)).toBe(true);
            expect(typeof topics[0]).toBe("object");
          });
      });
  });

  test("should respond with 400 error if topic already exists", () => {
    const body = {
      slug: "paper",
      description: "what books are made of",
    };
    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("topic already exists");
      });
  });

  test("should respond with 400 error for invalid body", () => {
    const body = {
      description: "just a cool animal",
    };
    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("bad request");
      });
  });
});

describe("GET /api/users", () => {
  test("should respond with sorted array of article objects ", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const { users } = response.body;
        expect(users.length).toBe(4);
        expect(Array.isArray(users)).toBe(true);
      });
  });
  test("array should contain correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const { users } = response.body;
        users.forEach((user) => {
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });

  test("should respond with correct values", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const { users } = response.body;
        expect(users[0]).toHaveProperty("username", "butter_bridge");
        expect(users[0]).toHaveProperty("name", "jonny");
        expect(users[0]).toHaveProperty(
          "avatar_url",
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
        );
      });
  });
});

describe("GET /api/users/:username", () => {
  test("should respond with an object with correct keys ", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then((response) => {
        const { user } = response.body;
        expect(typeof user).toBe("object");
        expect(Array.isArray(user)).toBe(false);
        expect(typeof user.username).toBe("string");
        expect(typeof user.name).toBe("string");
        expect(typeof user.avatar_url).toBe("string");
      });
  });

  test("should return correct data for article", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then((response) => {
        const { user } = response.body;
        const expected = {
          name: "jonny",
          username: "butter_bridge",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        };
        expect(user).toEqual(expected);
      });
  });

  test("should respond with 404 for valid but non existent request", () => {
    return request(app)
      .get("/api/users/robto")
      .expect(404)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("user not found");
      });
  });
});

describe("GET /api/articles", () => {
  test("should respond with sorted array of user objects ", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(articles.length).toBe(10);
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
          "2020-07-09T20:11:00.000Z"
        );
        expect(articles[6]).toHaveProperty("votes", 100);
        expect(articles[6]).toHaveProperty(
          "article_img_url",
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
        expect(articles[6]).toHaveProperty("comment_count", "11");
      });
  });
  test("should allow filtering with topic query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("should return empty array for valid topic query without associated article", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(articles).toEqual([]);
      });
  });
  test("should allow sorting by columns with order ", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=asc")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(articles).toBeSortedBy("author", { ascending: true });
      });
  });
  test("should work without order query ", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(articles).toBeSortedBy("created_at", { ascending: true });
      });
  });
  test("should work without sort query ", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(articles).toBeSortedBy("author", { descending: true });
      });
  });
  test("should allow pagination ", () => {
    return request(app)
      .get("/api/articles?limit=5&p=2")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(articles.length).toBe(5);
        expect(Array.isArray(articles)).toBe(true);
        expect(articles[0].result).toBe("6");
        expect(articles[0].total_results).toBe("13");
      });
  });
  test("should allow pagination with only limit", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(articles.length).toBe(5);
        expect(Array.isArray(articles)).toBe(true);
        expect(articles[0].result).toBe("1");
        expect(articles[0].total_results).toBe("13");
      });
  });

  test("should allow pagination with only page", () => {
    return request(app)
      .get("/api/articles?p=2")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(articles.length).toBe(3);
        expect(Array.isArray(articles)).toBe(true);
        expect(articles[0].result).toBe("11");
        expect(articles[0].total_results).toBe("13");
      });
  });

  test("should return empty array for requests past last result", () => {
    return request(app)
      .get("/api/articles?p=5")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(articles.length).toBe(0);
        expect(Array.isArray(articles)).toBe(true);
      });
  });
  test("should 400 for invalid page query ", () => {
    return request(app)
      .get("/api/articles?limit=5&p=robot")
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("invalid page request");
      });
  });

  test("should 400 for invalid limit query ", () => {
    return request(app)
      .get("/api/articles?limit=robot&p=1")
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("invalid limit request");
      });
  });

  test("should return 404 for topic query that doesn't exist", () => {
    return request(app)
      .get("/api/articles?topic=robot")
      .expect(404)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("topic not found");
      });
  });

  test("should return 400 for invalid sort query", () => {
    return request(app)
      .get("/api/articles?sort_by=robot")
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("invalid sort query");
      });
  });

  test("should return 400 for invalid order query", () => {
    return request(app)
      .get("/api/articles?order=robot")
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("invalid order query");
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
        expect(typeof article.comment_count).toBe("string");
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
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: "11",
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

describe("POST /api/articles", () => {
  test("should respond with object with correct keys", () => {
    const body = {
      title: "Am I a cat?",
      topic: "mitch",
      author: "icellusedkars",
      body: "Having run out of ideas for articles, I am staring at the wall blankly, like a cat. Does this make me a cat?",
      created_at: 1579126860000,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };

    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(201)
      .then((response) => {
        const { article } = response.body;
        expect(typeof article).toBe("object");
        expect(Array.isArray(article)).toBe(false);
        expect(typeof article.article_id).toBe("number");
        expect(typeof article.title).toBe("string");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.author).toBe("string");
        expect(typeof article.body).toBe("string");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.votes).toBe("number");
        expect(typeof article.article_img_url).toBe("string");
        expect(typeof article.comment_count).toBe("string");
      });
  });
  test("should respond with object with correct properties", () => {
    const body = {
      title: "Am I a cat?",
      topic: "mitch",
      author: "icellusedkars",
      body: "Having run out of ideas for articles, I am staring at the wall blankly, like a cat. Does this make me a cat?",
      created_at: 1579126860000,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(201)
      .then((response) => {
        const { article } = response.body;
        expect(article).toHaveProperty("article_id", 14);
        expect(article).toHaveProperty("title", "Am I a cat?");
        expect(article).toHaveProperty("topic", "mitch");
        expect(article).toHaveProperty("author", "icellusedkars");
        expect(article).toHaveProperty(
          "body",
          "Having run out of ideas for articles, I am staring at the wall blankly, like a cat. Does this make me a cat?"
        );
        expect(article).toHaveProperty("votes", 0);
        expect(article).toHaveProperty(
          "article_img_url",
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
        expect(article).toHaveProperty("comment_count", "0");
      });
  });
  test("should ignore unneccesary info", () => {
    const body = {
      title: "Am I a cat?",
      topic: "mitch",
      author: "icellusedkars",
      body: "Having run out of ideas for articles, I am staring at the wall blankly, like a cat. Does this make me a cat?",
      created_at: 1579126860000,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      nickname: "lurkerino",
    };
    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(201)
      .then((response) => {
        const { article } = response.body;
        expect(article).toHaveProperty("article_id", 14);
        expect(article).toHaveProperty("title", "Am I a cat?");
        expect(article).toHaveProperty("topic", "mitch");
        expect(article).toHaveProperty("author", "icellusedkars");
        expect(article).toHaveProperty(
          "body",
          "Having run out of ideas for articles, I am staring at the wall blankly, like a cat. Does this make me a cat?"
        );
        expect(article).toHaveProperty("votes", 0);
        expect(article).toHaveProperty(
          "article_img_url",
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
        expect(article).toHaveProperty("comment_count", "0");
        expect(article).not.toHaveProperty("nickname");
        expect(typeof article.nickname).toBe("undefined");
      });
  });
  test("should be included in articles table", () => {
    const body = {
      title: "Am I a cat?",
      topic: "mitch",
      author: "icellusedkars",
      body: "Having run out of ideas for articles, I am staring at the wall blankly, like a cat. Does this make me a cat?",
      created_at: 1579126860000,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(201)
      .then(() => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then((response) => {
            const { articles } = response.body;
            expect(Array.isArray(articles)).toBe(true);
            expect(articles[0].total_results).toBe("14");
          });
      });
  });

  test("should respond with 400 error for missing details", () => {
    const body = {
      topic: "mitch",
      author: "icellusedkars",
      body: "Having run out of ideas for articles, I am staring at the wall blankly, like a cat. Does this make me a cat?",
    };
    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("bad request");
      });
  });

  test("should respond with 404 error for invalid username", () => {
    const body = {
      title: "Am I a cat?",
      topic: "mitch",
      author: "robot",
      body: "Having run out of ideas for articles, I am staring at the wall blankly, like a cat. Does this make me a cat?",
      created_at: 1579126860000,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(404)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("user not found");
      });
  });

  test("should respond with 404 error for invalid topic", () => {
    const body = {
      title: "Am I a cat?",
      topic: "robot",
      author: "icellusedkars",
      body: "Having run out of ideas for articles, I am staring at the wall blankly, like a cat. Does this make me a cat?",
      created_at: 1579126860000,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(404)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("topic not found");
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
        expect(comments.length).toBe(10);
      });
  });

  test("article objects should have the correct keys", () => {
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
          result: "1",
          total_results: "11",
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
  test("should allow pagination ", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=2")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments.length).toBe(5);
        expect(Array.isArray(comments)).toBe(true);
        expect(comments[0].result).toBe("6");
        expect(comments[0].total_results).toBe("11");
      });
  });
  test("should allow pagination with only limit", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments.length).toBe(5);
        expect(Array.isArray(comments)).toBe(true);
        expect(comments[0].result).toBe("1");
        expect(comments[0].total_results).toBe("11");
      });
  });

  test("should allow pagination with only page", () => {
    return request(app)
      .get("/api/articles/1/comments?p=2")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments.length).toBe(1);
        expect(Array.isArray(comments)).toBe(true);
        expect(comments[0].result).toBe("11");
        expect(comments[0].total_results).toBe("11");
      });
  });

  test("should return empty array for requests past last result", () => {
    return request(app)
      .get("/api/articles/1/comments?p=5")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments.length).toBe(0);
        expect(Array.isArray(comments)).toBe(true);
      });
  });
  test("should 400 for invalid page query ", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=robot")
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("invalid page request");
      });
  });

  test("should 400 for invalid limit query ", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=robot&p=1")
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("invalid limit request");
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
            expect(comments[0].total_results).toBe("12");
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
          created_at: "2020-07-09T20:11:00.000Z",
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

describe("DELETE /api/articles/:article_id", () => {
  test("should respond with correct status code", () => {
    return request(app).delete("/api/articles/1").expect(204);
  });

  test("should remove article from database", () => {
    return request(app)
      .delete("/api/articles/1")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then((response) => {
            const { articles } = response.body;
            expect(Array.isArray(articles)).toBe(true);
            expect(articles[0].total_results).toBe("12");
            articles.forEach((article) => {
              expect(article.article_id).not.toBe(1);
            });
          });
      });
  });
  test("should remove article comments from database", () => {
    return request(app)
      .delete("/api/articles/1")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/comments")
          .expect(200)
          .then((response) => {
            const { comments } = response.body;
            expect(Array.isArray(comments)).toBe(true);
            expect(comments.length).toBe(7);
            comments.forEach((comment) => {
              expect(comment.article_id).not.toBe(1);
            });
          });
      });
  });

  test("should respond with 404 for valid but non existent comment request", () => {
    return request(app)
      .delete("/api/articles/1000")
      .expect(404)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("article not found");
      });
  });

  test("should respond with 400 error for invalid comment request", () => {
    return request(app)
      .delete("/api/articles/robot")
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("bad request");
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
          "2020-04-06T12:17:00.000Z"
        );
        expect(comments[0]).toHaveProperty("votes", 16);
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

describe("PATCH /api/comments/:comment_id", () => {
  test("should respond with updated comment", () => {
    const body = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/1")
      .send(body)
      .expect(200)
      .then((response) => {
        const { comment } = response.body;
        const expected = {
          comment_id: 1,
          author: "butter_bridge",
          article_id: 9,
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          created_at: "2020-04-06T12:17:00.000Z",
          votes: 17,
        };
        expect(typeof comment).toBe("object");
        expect(Array.isArray(comment)).toBe(false);
        expect(comment).toEqual(expected);
      });
  });

  test("should allow subtraction of votes", () => {
    const body = { inc_votes: -10 };
    return request(app)
      .patch("/api/comments/1")
      .send(body)
      .expect(200)
      .then((response) => {
        const { comment } = response.body;
        expect(comment.votes).toBe(6);
      });
  });

  test("should respond with unchanged comment if no increment included", () => {
    const body = {};
    return request(app)
      .patch("/api/comments/1")
      .send(body)
      .expect(200)
      .then((response) => {
        const { comment } = response.body;
        expect(comment.votes).toBe(16);
      });
  });
  test("should respond with 404 for valid but non existent comment request", () => {
    const body = { inc_votes: 5 };
    return request(app)
      .patch("/api/comments/1000")
      .send(body)
      .expect(404)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("comment not found");
      });
  });

  test("should respond with 400 error for invalid comment request", () => {
    const body = { inc_votes: 5 };
    return request(app)
      .patch("/api/comments/robot")
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
      .patch("/api/comments/1")
      .send(body)
      .expect(400)
      .then((response) => {
        const { msg } = response.body;
        expect(msg).toBe("bad request");
      });
  });
});
