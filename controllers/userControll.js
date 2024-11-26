const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

// Konfigurasi MySQL koneksi
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "",
}); // table users

// Cek koneksi ke database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// mengambil semua data
exports.getAllUsers = (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// mengambil data berdasarkan ID
exports.getUserById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const query = "SELECT * FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(results[0]);
  });
};

// menambahkan user baru
exports.createUser = (req, res) => {
  const { name, age, gender, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: "Failed to encrypt password" });
    }
    const query =
      "INSERT INTO users (name, age, gender, email, password) VALUES (?, ?, ?, ?, ?)";
    db.query(
      query,
      [name, age, gender, email, hashedPassword],
      (err, result) => {
        if (err) {
          // cek email apakah sudah terdaftar
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              error: `The Email with ${email} has already been used, please use another email`,
            });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          message: "User created successfully",
          user: { id: result.insertId, name, age, gender, email },
        });
      }
    );
  });
};

// memperbarui data user
exports.updateUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, age, gender, email, password } = req.body;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  const query =
    "UPDATE users SET name = ?, age = ?, gender = ?, email = ?, password = ? WHERE id = ?";
  db.query(
    query,
    [name, age, gender, email, hashedPassword, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ id, name, age, gender, email });
    }
  );
};

// menghapus data user
exports.deleteUser = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const email = req.body.email;
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [id, email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: `User with id ${id} and email ${email} deleted.` });
  });
};

// user login
exports.login = (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = results[0];
    // membandingkan password yang sudah terenkiripsi
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        email: user.email,
      },
    });
  });
};
