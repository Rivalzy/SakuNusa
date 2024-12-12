// import express dan router
const express = require("express");
const cors = require("cors");
const User = require("./routes/user");
const Transaction = require("./routes/transaction");

// import dotenv dan menjalankan method config
require("dotenv").config();

// destructing object process.env
const PORT = process.env.PORT || 3000;

// membuat object express
const app = express();
app.use(cors());

// menggunakan middleware
app.use(express.json());

// menggunakan routing (router)
app.use(User);
app.use(Transaction);

app.get("/", (req, res) => {
  res.send("message : not found");
});

// mendefinisikan port
app.listen(PORT, () =>
  console.log(`Server running at: http://0.0.0.0:${PORT}`)
);
