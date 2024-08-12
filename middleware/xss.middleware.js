// xssMiddleware.js

import xss from "xss";
import { tryCatch } from "../utils/tryCatch.js";

// Set up the XSS middleware with options
const xssOptions = {
  whiteList: {
    a: ["href", "target"],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script"],
  stripIgnoreTagBody: ["style"],
  escapeHtml: xss.escapeHtmlEntities, // Correct method for HTML escaping
};

// xssBodyMiddleware is a middleware function for applying XSS protection to req.body
const xssBodyMiddleware = tryCatch(async (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    for (const key in req.body) {
      if (Object.hasOwnProperty.call(req.body, key)) {
        if (
          xss(req.body[key], xssOptions).toString() !== req.body[key].toString()
        ) {
          res.status(400).json({ status: "fail" });
          return;
        }
      }
    }
  }
  next();
});
// xssQueryMiddleware is a middleware function for applying XSS protection to req.query
const xssQueryMiddleware = tryCatch(async (req, res, next) => {
  if (req.query && typeof req.query === "object") {
    for (const key in req.query) {
      if (Object.hasOwnProperty.call(req.query, key)) {
        if (
          xss(req.query[key], xssOptions).toString() !==
          req.query[key].toString()
        ) {
          res.status(400).json({ status: "fail" });
          return;
        }
      }
    }
  }
  next();
});

// xssParamsMiddleware is a middleware function for applying XSS protection to req.params

const xssParamsMiddleware = tryCatch(async (req, res, next) => {
  if (req.params && typeof req.params === "object") {
    for (const key in req.params) {
      if (Object.hasOwnProperty.call(req.params, key)) {
        if (
          xss(req.params[key], xssOptions).toString() !==
          req.params[key].toString()
        ) {
          res.status(400).json({ status: "fail" });
          return;
        }
      }
    }
  }
  next();
});
// Export the xssBodyMiddleware for use in other files
export { xssBodyMiddleware, xssQueryMiddleware, xssParamsMiddleware };
