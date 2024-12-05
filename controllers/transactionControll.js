const dayjs = require("dayjs");
const db = require("../database");

// exports.getTransactions = (req, res) => {
//   const query = `
//     SELECT t.id_trans, t.amount, t.note, t.type_cat, t.date, c.name_cat AS category
//     FROM transactions t
//     LEFT JOIN category c ON t.id_cat = c.id_cat
//   `;
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ message: "Error fetching transaction" });
//     }

//     res.status(200).json(results);
//   });
// };

exports.getTransactions = (req, res) => {
  const { type_cat } = req.query;
  const id = req.user?.id_acc;

  if (!id) {
    return res.status(400).json({ message: "User not authenticated" });
  }

  let query = `
    SELECT t.id_trans, t.amount, t.note, t.type_cat, t.date, c.name_cat AS category
    FROM transactions t
    LEFT JOIN category c ON t.id_cat = c.id_cat
    WHERE t.id_acc = ?  
  `;

  // Jika type_cat diberikan, tambahkan filter untuk type_cat
  if (type_cat && ["income", "expense"].includes(type_cat.toLowerCase())) {
    query += ` AND t.type_cat = ?`;
  }

  // Jalankan query
  db.query(
    query,
    [id, type_cat ? type_cat.toLowerCase() : null],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching transactions" });
      }

      res.status(200).json(results);
    }
  );
};

exports.createTransaction = (req, res) => {
  try {
    const { amount, note, id_cat, type_cat } = req.body;
    const id_acc = req.user?.id_acc; // Ambil id_acc dari token yang sudah diverifikasi oleh verifyToken

    // Validasi input
    if (!id_acc) {
      return res.status(400).json({ message: "User account ID is required" });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }
    if (!type_cat || !["income", "expense"].includes(type_cat.toLowerCase())) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }
    if (!id_cat) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    // Format data
    const currentDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const lowerType = type_cat.toLowerCase();

    // Validasi apakah id_acc valid di tabel users
    const validateUserQuery = "SELECT 1 FROM users WHERE id_acc = ?";
    db.query(validateUserQuery, [id_acc], (err, results) => {
      if (err) {
        console.error("Error validating user:", err);
        return res
          .status(500)
          .json({ message: "Error validating user account" });
      }
      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid user account ID" });
      }

      // Simpan transaksi di tabel transactions
      const insertTransactionQuery = `
        INSERT INTO transactions (amount, date, note, id_cat, type_cat, id_acc) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.execute(
        insertTransactionQuery,
        [amount, currentDate, note, id_cat, lowerType, id_acc],
        (err, results) => {
          if (err) {
            console.error("Error creating transaction:", err);
            return res
              .status(500)
              .json({ message: "Error creating transaction" });
          }

          // Update balance di tabel profile
          const updateBalanceQuery = `
            UPDATE profile 
            SET balance = balance ${lowerType === "income" ? "+" : "-"} ?
            WHERE id_acc = ?
          `;
          db.query(updateBalanceQuery, [amount, id_acc], (err) => {
            if (err) {
              console.error("Error updating balance:", err);
              return res.status(500).json({
                message: "Transaction created but failed to update balance",
              });
            }

            // Berhasil
            res.status(201).json({
              message: "Transaction created successfully and balance updated",
              transaction: {
                amount,
                note,
                id_cat,
                type_cat: lowerType,
                date: currentDate,
              },
            });
          });
        }
      );
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected server error" });
  }
};

exports.updateTransaction = (req, res) => {
  const id_trans = req.params.id;
  const { amount, note, id_cat, type_cat } = req.body;
  const lowerType = type_cat.toLowerCase();

  // Perbarui transaksi dengan amount baru
  const queryUpdateTransaction = `
    UPDATE transactions 
    SET amount = ?, note = ?, id_cat = ?, type_cat = ?, update_at = NOW() 
    WHERE id_trans = ?
  `;
  db.execute(
    queryUpdateTransaction,
    [amount, note, id_cat, lowerType, id_trans],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error updating transaction" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Hanya perbarui saldo sesuai dengan amount baru
      const queryUpdateBalance = `
        UPDATE profile 
        SET balance = balance ${lowerType === "income" ? "+" : "-"} ?
        WHERE id_acc = (SELECT id_acc FROM transactions WHERE id_trans = ?)
      `;
      db.query(queryUpdateBalance, [amount, id_trans], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            error: "Failed to update profile balance",
          });
        }

        res.status(200).json({
          message: "Transaction and profile balance updated successfully",
          updatedFields: { amount, note, id_cat, type_cat },
        });
      });
    }
  );
};

exports.deleteTransaction = (req, res) => {
  const id_trans = req.params.id;

  // Ambil informasi transaksi sebelum dihapus
  const query = `
    SELECT id_acc 
    FROM transactions 
    WHERE id_trans = ?
  `;
  db.query(query, [id_trans], (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve transaction data" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const { id_acc } = results[0];

    // Hapus transaksi
    const queryDelete = "DELETE FROM transactions WHERE id_trans = ?";
    db.execute(queryDelete, [id_trans], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error deleting transaction" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Hitung ulang saldo berdasarkan transaksi yang tersisa
      const queryRecalculateBalance = `
        SELECT 
          SUM(CASE 
            WHEN type_cat = 'income' THEN amount 
            WHEN type_cat = 'expense' THEN -amount 
            ELSE 0 
          END) AS new_balance
        FROM transactions
        WHERE id_acc = ?
      `;
      db.query(queryRecalculateBalance, [id_acc], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            error: "Transaction deleted but failed to recalculate balance",
          });
        }

        const balance = results[0].new_balance || 0;

        // Perbarui saldo di tabel profile
        const queryUpdateBalance = `
          UPDATE profile 
          SET balance = ?
          WHERE id_acc = ?
        `;
        db.query(queryUpdateBalance, [balance, id_acc], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              error: "Transaction deleted but failed to update balance",
            });
          }

          res.status(200).json({
            message: `Transaction with id ${id_trans} deleted successfully and balance updated`,
            upBalance: balance,
          });
        });
      });
    });
  });
};
