import jsonwebtoken from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET_KEY;

// const verifyToken = (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1]; // ציפייה שה-token יישלח בכותרת 'Authorization: Bearer <token>'
//   console.log("token", token);

//   if (!token) {
//     return res.status(401).json({ message: "Token not provided" });
//   }

//   try {
//     const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET); // השתמש במפתח הסודי שלך
//     req.user = decoded; // הוסף מידע על המשתמש לבקשה
//     console.log("req.user", req.user);

//     next(); // המשך לבקשה הבאה
//   } catch (error) {
//     res.status(403).json({ message: "Invalid or expired token" });
//   }
// };

const isAdmin = (req, res, next) => {
  console.log("req.user.role", req.user.role);

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

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
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Token is invalid", error: error.message });
  }
};

export default { verifyToken, isAdmin };
