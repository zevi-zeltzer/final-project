import jsonwebtoken from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET_KEY;

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jsonwebtoken.verify(token, secretKey);
    req.userId = decoded.userId; // Add user ID to the request
    req.role = decoded.role;    // Add user role to the request
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Token is invalid", error: error.message });
  }
};

// Middleware to check if user is an admin
const verifyAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next(); // If role is admin, proceed to the next middleware
};

export default { verifyToken, verifyAdmin };
