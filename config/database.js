// import mysql
const mysql = require("mysql2");

// buat koneksi
const connection = mysql.createConnection({
  host: "34.50.68.48",
  user: "root",
  password: "",
  database: "", // name database
});

// menghubungkan ke database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    process.exit(1);
  }
  console.log("Connected to the database");
});

// export db
module.exports = connection;
