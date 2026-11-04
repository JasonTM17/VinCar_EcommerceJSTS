import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";

const { createApiFetch } = await import("./api.ts");

test("apiFetch sends JSON and parses the response", async () => {
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      assert.equal(req.headers["content-type"], "application/json");
      assert.equal(body, JSON.stringify({ ok: true }));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const api = createApiFetch(`http://127.0.0.1:${port}/api/v1`);

  const result = await api("/ping", { method: "POST", body: JSON.stringify({ ok: true }) });
  assert.deepEqual(result, { status: "ok" });
  await new Promise((resolve) => server.close(resolve));
});

test("apiFetch throws on non-2xx responses", async () => {
  const server = createServer((_req, res) => {
    res.writeHead(422, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid input" }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const api = createApiFetch(`http://127.0.0.1:${port}/api/v1`);

  await assert.rejects(() => api("/bad"), /API 422/);
  await new Promise((resolve) => server.close(resolve));
});
