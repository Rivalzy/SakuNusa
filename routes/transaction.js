const express = require("express");
// import transaction controller
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionControll");
const verifyToken = require("../middlewares/verifyToken");

// membuat object router
const router = express.Router();

// membuat routing
router.get("/transactions", verifyToken, getTransactions);
// filter
router.get("/transactions?type_cat=income", verifyToken, getTransactions);
router.get("/transactions?type_cat=expense", verifyToken, getTransactions);

router.post("/transactions/add", verifyToken, createTransaction);
router.put("/transactions/edit/:id", verifyToken, updateTransaction);
router.delete("/transactions/delete/:id", verifyToken, deleteTransaction);

// export router
module.exports = router;
