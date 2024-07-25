const { builder } = require("@netlify/functions");
const { createProxyMiddleware } = require("http-proxy-middleware");

const proxy = createProxyMiddleware({
  target: "https://cosmos-rpc.quickapi.com:443",
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader("Access-Control-Allow-Origin", "*");
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers["Access-Control-Allow-Origin"] = "*";
  },
});

const handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      },
    };
  }

  return new Promise((resolve, reject) => {
    const callback = (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve({
        statusCode: res.statusCode,
        body: res.body,
        headers: res.headers,
      });
    };

    proxy(event, context, callback);
  });
};

exports.handler = builder(handler);