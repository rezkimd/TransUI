const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Konfigurasi koneksi database
const pool = new Pool({
    //user: 'your_username',
    //host: 'your_host',
    //database: 'your_database',
    //password: 'your_password',
    port: 5432, // Port default PostgreSQL
});

// Middleware untuk menguraikan body permintaan
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware untuk session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}));

// Rute untuk registrasi pengguna
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email, role, partnerId, vehicleLicense, npm, address, phoneNumber } = req.body;

        // Cek apakah username sudah digunakan sebelumnya
        const usernameExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (usernameExists.rows.length > 0) {
            return res.status(400).json({ message: 'Username sudah digunakan' });
        }

        // Cek apakah email sudah digunakan sebelumnya
        const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email sudah digunakan' });
        }

        // Enkripsi password
        const hashedPassword = await bcrypt.hash(password, 10);

        let result;

        if (role === 'partner') {
            // Buat Partner ID secara serial dari angka 1
            const partnerIdResult = await pool.query('SELECT MAX(partner_id) FROM partners');
            const maxPartnerId = partnerIdResult.rows[0].max || 0;
            const newPartnerId = String(Number(maxPartnerId) + 1).padStart(6, '0');

            // Simpan data partner ke tabel partners
            await pool.query('INSERT INTO partners (partner_id, vehicle_license) VALUES ($1, $2)', [newPartnerId, vehicleLicense]);

            // Simpan data pengguna ke tabel users
            result = await pool.query('INSERT INTO users (username, password, email, role, partner_id, address, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [username, hashedPassword, email, role, newPartnerId, address, phoneNumber]);
        } else if (role === 'mahasiswa') {
            // Simpan data pengguna ke tabel users
            result = await pool.query('INSERT INTO users (username, password, email, role, npm, address, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [username, hashedPassword, email, role, npm, address, phoneNumber]);
        } else {
            // Simpan data pengguna ke tabel users
            result = await pool.query('INSERT INTO users (username, password, email, role, address, phone_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [username, hashedPassword, email, role, address, phoneNumber]);
        }

        // Mengirimkan respons berhasil
        res.status(201).json({ message: 'Registrasi berhasil', user: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat melakukan registrasi' });
    }
});

// Rute untuk login pengguna
app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Cari pengguna berdasarkan phone_number, email, atau username
        const result = await pool.query('SELECT * FROM users WHERE phone_number = $1 OR email = $1 OR username = $1', [identifier]);
        const user = result.rows[0];

        // Cek apakah pengguna ditemukan
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        // Verifikasi password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Password salah' });
        }

        // Simpan data pengguna yang berhasil login dalam session
        req.session.user = user;

        // Mengirimkan respons berhasil
        res.json({ message: 'Login berhasil', user });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat melakukan login' });
    }
});


// Memulai server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

