const express = require("express");

// import user controller
const {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  getProfiles,
  logout,
} = require("../controllers/userControll");
const verifyToken = require("../middlewares/verifyToken");

// membuat object router
const router = express.Router();

// membuat routing
router.post("/register", createUser);
router.post("/login", login);
router.post("/auth/logout", verifyToken, logout);

// User
router.get("/prof", verifyToken, getProfiles);
// router.get("/user", verifyToken, getAllUsers);
router.get("/user", verifyToken, getUserById);
router.put("/user/edit", verifyToken, updateUser);
router.delete("/user", verifyToken, deleteUser);

// export router
module.exports = router;
