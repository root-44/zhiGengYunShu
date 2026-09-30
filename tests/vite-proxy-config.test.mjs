import assert from "node:assert/strict";
import config from "../vite.config.js";

assert.equal(
  config.server?.proxy?.["/api"]?.target,
  "http://100.82.194.79:8090",
  "Vite dev server must proxy /api requests to the backend"
);

assert.equal(
  config.server.proxy["/api"].changeOrigin,
  true,
  "Vite proxy should change origin for backend requests"
);

assert.equal(
  config.server?.proxy?.["/uploads"]?.target,
  "http://100.82.194.79:8090",
  "Vite dev server must proxy uploaded files to the backend"
);

assert.equal(
  config.preview?.proxy?.["/api"]?.target,
  "http://100.82.194.79:8090",
  "Vite preview server must proxy /api requests to the backend"
);

assert.equal(
  config.preview.proxy["/api"].changeOrigin,
  true,
  "Vite preview proxy should change origin for backend requests"
);

assert.equal(
  config.preview?.proxy?.["/uploads"]?.target,
  "http://100.82.194.79:8090",
  "Vite preview server must proxy uploaded files to the backend"
);
