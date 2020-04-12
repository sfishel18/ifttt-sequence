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

const testWebooks = [
  "https://postman-echo.com/response-headers?dog=Salvador",
  "https://postman-echo.com/response-headers?dog=Rosa",
  "https://postman-echo.com/response-headers?dog=Valentine"
];

test("next command", async () => {
  const id = `next-command-test-${Date.now()}`;
  expect.assertions(8);

  const firstResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "next",
    webhooks: testWebooks
  });
  expect(firstResponse.status).toEqual(200);
  expect(firstResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Salvador",
}
`);

  const secondResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "next",
    webhooks: testWebooks
  });
  expect(secondResponse.status).toEqual(200);
  expect(secondResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Rosa",
}
`);

  const thirdResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "next",
    webhooks: testWebooks
  });
  expect(thirdResponse.status).toEqual(200);
  expect(thirdResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Valentine",
}
`);

  const fourthResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "next",
    webhooks: testWebooks
  });
  expect(fourthResponse.status).toEqual(200);
  expect(fourthResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Salvador",
}
`);
});

test("previous command", async () => {
  const id = `previous-command-test-${Date.now()}`;
  expect.assertions(10);

  const firstResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "previous",
    webhooks: testWebooks
  });
  expect(firstResponse.status).toEqual(200);
  expect(firstResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Valentine",
}
`);

  const secondResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "previous",
    webhooks: testWebooks
  });
  expect(secondResponse.status).toEqual(200);
  expect(secondResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Rosa",
}
`);

  const thirdResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "previous",
    webhooks: testWebooks
  });
  expect(thirdResponse.status).toEqual(200);
  expect(thirdResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Salvador",
}
`);

  const fourthResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "previous",
    webhooks: testWebooks
  });
  expect(fourthResponse.status).toEqual(200);
  expect(fourthResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Valentine",
}
`);

  const fifthResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "previous",
    webhooks: testWebooks
  });
  expect(fifthResponse.status).toEqual(200);
  expect(fifthResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Rosa",
}
`);
});

test("repeat command", async () => {
  const id = `repeat-command-test-${Date.now()}`;
  expect.assertions(8);

  const firstResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "next",
    webhooks: testWebooks
  });
  expect(firstResponse.status).toEqual(200);
  expect(firstResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Salvador",
}
`);

  const secondResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "repeat",
    webhooks: testWebooks
  });
  expect(secondResponse.status).toEqual(200);
  expect(secondResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Salvador",
}
`);

  const thirdResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "next",
    webhooks: testWebooks
  });
  expect(thirdResponse.status).toEqual(200);
  expect(thirdResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Rosa",
}
`);

  const fourthResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "repeat",
    webhooks: testWebooks
  });
  expect(fourthResponse.status).toEqual(200);
  expect(fourthResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Rosa",
}
`);
});

test("reset command", async () => {
  const id = `reset-command-test-${Date.now()}`;
  expect.assertions(6);

  const firstResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "next",
    webhooks: testWebooks
  });
  expect(firstResponse.status).toEqual(200);
  expect(firstResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Salvador",
}
`);

  const secondResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "next",
    webhooks: testWebooks
  });
  expect(secondResponse.status).toEqual(200);
  expect(secondResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Rosa",
}
`);

  const thirdResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "reset",
    webhooks: testWebooks
  });
  expect(thirdResponse.status).toEqual(200);
  expect(thirdResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Salvador",
}
`);
});

const testWebooksWithError = [
  "https://postman-echo.com/response-headers?dog=Salvador",
  "https://echo.getpostman.com/status/404",
  "https://postman-echo.com/response-headers?dog=Valentine"
];

test("advance and retreat commands", async () => {
  const id = `advance-retreat-commands-test-${Date.now()}`;
  expect.assertions(12);
  const firstResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "next",
    webhooks: testWebooksWithError
  });
  expect(firstResponse.status).toEqual(200);
  expect(firstResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Salvador",
}
`);

  const secondResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "advance",
    webhooks: testWebooksWithError
  });
  expect(secondResponse.status).toEqual(200);
  expect(secondResponse.data).toMatchInlineSnapshot(`""`);

  const thirdResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "next",
    webhooks: testWebooksWithError
  });
  expect(thirdResponse.status).toEqual(200);
  expect(thirdResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Valentine",
}
`);

  const fourthResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "retreat",
    webhooks: testWebooksWithError
  });
  expect(fourthResponse.status).toEqual(200);
  expect(fourthResponse.data).toMatchInlineSnapshot(`""`);

  const fifthResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "retreat",
    webhooks: testWebooksWithError
  });
  expect(fifthResponse.status).toEqual(200);
  expect(fifthResponse.data).toMatchInlineSnapshot(`""`);

  const sixthResponse = await axios.post(`${API_URL}/action`, {
    auth: process.env.AUTH_KEY,
    id,
    command: "repeat",
    webhooks: testWebooksWithError
  });
  expect(sixthResponse.status).toEqual(200);
  expect(sixthResponse.data).toMatchInlineSnapshot(`
Object {
  "dog": "Salvador",
}
`);
});
