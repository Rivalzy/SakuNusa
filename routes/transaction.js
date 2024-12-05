const express = require("express");
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionControll");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

router.get("/transactions", verifyToken, getTransactions);
// filter
router.get("/transactions?type_cat=income", verifyToken, getTransactions);
router.get("/transactions?type_cat=expense", verifyToken, getTransactions);

router.post("/transactions/add", verifyToken, createTransaction);
router.put("/transactions/edit", verifyToken, updateTransaction); //
router.delete("/transactions", verifyToken, deleteTransaction);

module.exports = router;
