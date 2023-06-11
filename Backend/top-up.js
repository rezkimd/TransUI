const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require('./DBscript');

// router.post('/', requireAuth, async (req, res) => {
//     const userId = req.session.userId;
//     const { amount } = req.body;

//     try {
//         // Perbarui saldo pengguna di dalam tabel user_table
//         const updateQuery = 'UPDATE user_table SET balance = balance + $1 WHERE id = $2';
//         await pool.query(updateQuery, [amount, userId]);

//         // Ambil data pengguna terbaru setelah perubahan saldo
//         const getUserQuery = 'SELECT * FROM user_table WHERE id = $1';
//         const result = await pool.query(getUserQuery, [userId]);
//         const userDB = result.rows[0];

//         if (userDB) {
//             // Kirim respons berhasil dengan data saldo terbaru
//             res.status(200).json({ message: 'Top-up berhasil', balance: user.balance });
//         } else {
//             // Kirim respons gagal jika pengguna tidak ditemukan
//             res.status(404).json({ message: 'Pengguna tidak ditemukan' });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui saldo pengguna' });
//     }
// });