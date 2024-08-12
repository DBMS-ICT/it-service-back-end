///------------- Trim Query Middleware --------------//
export const trimQueryMiddleware = (req, res, next) => {
  for (let key in req.query) {
    if (
      req.query[key] === "" ||
      req.query[key] === null ||
      req.query[key] === undefined
    ) {
      delete req.query[key];
    } else if (typeof req.query[key] === "object") {
      for (let nkey in req.query[key]) {
        if (req.query[key][nkey] === "" || req.query[key][nkey] === null) {
          delete req.query[key][nkey];
        }
      }
      if (Object.keys(req.query[key]).length === 0) {
        delete req.query[key];
      }
    }
  }
  next();
};
///------------- Trim Body Middleware --------------//
export const trimBodyMiddleware = (req, res, next) => {
  for (let key in req.body) {
    if (!checkSpace(req.body[key])) {
      res.status(400).json({
        status: "fail",
      });
      return;
    }
  }
  next();
};
const checkSpace = (value) => {
  // convert value to array
  const arr = value.split("");
  let count = 0;
  // remove empty string
  arr.forEach((item, index) => {
    if (item === " ") count++;
  });
  console.log(count, arr.length);
  if (count == arr.length) return false;
  return true;
};
