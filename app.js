// import express dan router
const express = require("express");
const cors = require("cors");

// import dotenv dan menjalankan method config
require("dotenv").config();

// destructing object process.env
const PORT = process.env.PORT || 8000

// membuat object express
const app = express();
app.use(cors());

// menggunakan middleware
app.use(express.json());

// menggunakan routing (router)
app.use(Route);

app.get("/", (req, res) => {
    console.log("Response success")
    res.send("Response Success!")
})

// mendefinisikan port
app.listen(PORT, () =>
  console.log(`Server running at: http://localhost:${PORT}`)
);
