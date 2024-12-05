const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database");

// mengambil semua data
// exports.getAllUsers = (req, res) => {
//   const query = "SELECT * FROM users";
//   db.query(query, (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// };

// mengambil data berdasarkan ID
exports.getUserById = (req, res) => {
  // Ambil id_acc dari token yang sudah diverifikasi oleh verifyToken
  const id = req.user?.id_acc;
  const query = "SELECT * FROM users WHERE id_acc = ?";
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

  const lowerGen = gender.toLowerCase();

  // Enkripsi password sebelum menyimpan
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: "Failed to encrypt password" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const query =
      "INSERT INTO users (name, age, gender, email, password) VALUES (?, ?, ?, ?, ?)";

    db.query(query, [name, age, lowerGen, email, hash], (err, result) => {
      if (err) {
        // cek email apakah sudah terdaftar
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            error: `The Email with ${email} has already been used, please use another email`,
          });
        }
        return res.status(500).json({ error: err.message });
      }

      const userId = result.insertId;

      // Tambahkan data default ke tabel profile
      const profileQuery =
        "INSERT INTO profile (id_acc, balance) VALUES (?, ?)";
      db.query(profileQuery, [userId, 0], (profileErr) => {
        if (profileErr) {
          console.error(profileErr);
          return res
            .status(500)
            .json({ error: "Failed to create user profile" });
        }

        // respon ketika berhasil
        res.status(201).json({
          message: "User and profile created successfully",
          user: { id: userId, name, age, gender, email },
        });
      });
    });
  });
};

// memperbarui data user
exports.updateUser = async (req, res) => {
  const id = req.user?.id_acc;
  const { name, age, gender, email, password } = req.body;
  const hash = password ? await bcrypt.hash(password, 10) : undefined;

  const lowerGen = gender.toLowerCase();

  const query =
    "UPDATE users SET name = ?, age = ?, gender = ?, email = ?, password = ? WHERE id_acc = ?";
  db.query(query, [name, age, lowerGen, email, hash, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Update User Successfully" });
  });
};

// menghapus data user
exports.deleteUser = (req, res) => {
  const id = req.user?.id_acc;
  const email = req.body.email;
  const query = "DELETE FROM users WHERE id_acc = ?";
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

exports.getProfiles = (req, res) => {
  const id = req.user?.id_acc;

  if (!id) {
    return res.status(400).json({ error: "User ID is missing in token." });
  }

  const query = `
    SELECT u.id_acc, u.name, u.age, u.gender, u.email, p.balance
    FROM users u
    LEFT JOIN profile p ON u.id_acc = p.id_acc
    WHERE u.id_acc = ?;
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch profiles." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.status(200).json(results[0]); // Mengembalikan satu profil user
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Cek apakah email ada di database
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Jika email tidak ditemukan
    if (!results.length) {
      return res.status(401).json({ error: "Email not found" });
    }

    const user = results[0];

    // Validasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id_acc: user.id_acc,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // Response sukses
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  });
};

exports.logout = (req, res) => {
  res.status(200).json({ message: "Logout successful" });
};
