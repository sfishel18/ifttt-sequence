/**
 * @jest-environment node
 */

const waitOn = require("wait-on");
const axios = require("axios");

const { API_URL = "http://localhost:8080", DB_PORT = "8081" } = process.env;

beforeAll(() => waitOn({ resources: [API_URL, `tcp:${DB_PORT}`] }));

test("access denied if auth is wrong", () => {
  expect.assertions(2);
  return axios
    .post(`${API_URL}/action`, {
      auth: process.env.AUTH_KEY.slice(0, -1)
    })
    .catch(error => {
      expect(error.response.status).toEqual(401);
      expect(error.response.data).toMatchInlineSnapshot(`"Access denied"`);
    });
});
test("bad request if id is missing", () => {
  expect.assertions(2);
  return axios
    .post(`${API_URL}/action`, {
      auth: process.env.AUTH_KEY
    })
    .catch(error => {
      expect(error.response.status).toEqual(400);
      expect(error.response.data).toMatchInlineSnapshot(
        `"Required argument \\"id\\" is missing or empty"`
      );
    });
});
test("bad request if command is invalid", () => {
  expect.assertions(2);
  return axios
    .post(`${API_URL}/action`, {
      auth: process.env.AUTH_KEY,
      webhook: "https://postman-echo.com/response-headers?dog=Rosa",
      id: "foo",
      command: "invalid"
    })
    .catch(error => {
      expect(error.response.status).toEqual(400);
      expect(error.response.data).toMatchInlineSnapshot(
        `"Command \\"invalid\\" is not supported"`
      );
    });
});
test("bad request if webhooks is missing", () => {
  expect.assertions(2);
  return axios
    .post(`${API_URL}/action`, {
      auth: process.env.AUTH_KEY,
      id: "foo",
      command: "next"
    })
    .catch(error => {
      expect(error.response.status).toEqual(400);
      expect(error.response.data).toMatchInlineSnapshot(
        `"Required argument \\"webhooks\\" is missing or empty"`
      );
    });
});

// test("next command")
