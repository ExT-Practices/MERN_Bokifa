import jwt from "jsonwebtoken";

const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Token nahi hai to bhi request continue hogi
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    // Invalid/expired token hone par bhi public API block nahi hogi
    req.user = null;
    next();
  }
};

export default optionalAuthMiddleware;
