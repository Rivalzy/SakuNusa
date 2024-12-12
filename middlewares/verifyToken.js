const jwt = require("jsonwebtoken");

// Middleware untuk validasi token
const verifyToken = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    // Verifikasi token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token." });
      }

      // Menyimpan informasi user dari token ke req.user
      req.user = {
        id_acc: user.id_acc,
        email: user.email,
        name: user.name,
      };

      next();
    });
  } catch (error) {
    console.error("Error in verifyToken middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export middleware auth
module.exports = verifyToken;
