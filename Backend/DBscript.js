const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path')

const app = express();
const port = 3000;

// Konfigurasi koneksi database
const pool = new Pool({
    connectionString: 'postgres://rezkimuhammad60:3tbwJKEXYjo1@ep-empty-recipe-891243-pooler.ap-southeast-1.aws.neon.tech/TransUI',
    sslmode: "require",
    ssl: true
});

// Middleware untuk menguraikan body permintaan
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
// Middleware untuk session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}));

// Rute untuk registrasi pengguna
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email, role } = req.body;

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

        // Generate User ID
        const userID = await generateUserID(pool);

        // Simpan data pengguna ke tabel users
        const result = await pool.query('INSERT INTO users (user_id, username, password, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING *', [userID, username, hashedPassword, email, role]);

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

//Rute untuk menambahkan data profile
app.post('/api/profile', async (req, res) => {
    try {
        const { name, role, partnerID, vehicleLicense, npm, alamat, phoneNumber } = req.body;

        // Lakukan validasi data jika diperlukan

        // Simpan data ke dalam database
        const result = await pool.query(
            'INSERT INTO users (name, role, partnerID, vehicleLicense, npm, alamat, phoneNumber) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, role, partnerID, vehicleLicense, npm, alamat, phoneNumber]
        );
        const savedData = result.rows[0];

        // Mengirimkan respons berhasil
        res.json({ message: 'Data berhasil disimpan', data: savedData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan data' });
    }
});

//API untuk update user
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { nama, alamat, phone_number, npm, vehicle_license } = req.body;

    try {
        // Cek apakah pengguna dengan ID yang diberikan ada di database
        const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        // Update data pengguna
        const result = await pool.query(
            'UPDATE users SET nama = $1, alamat = $2, phone_number = $3, npm = $4, vehicle_license = $5 WHERE user_id = $6 RETURNING *',
            [nama, alamat, phone_number, npm, vehicle_license, id]
        );

        res.json({ message: 'Data pengguna berhasil diperbarui', user: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data pengguna' });
    }
});

//Untuk Menambahkan data sepeda
app.post('/api/bikes', async (req, res) => {
    try {
        const { specunId, dropLocation, userId, fuel, status } = req.body;

        // Masukkan data sepeda ke dalam tabel "bikes"
        const result = await pool.query(
            'INSERT INTO bikes (specun_id, drop_location, user_id, fuel, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [specunId, dropLocation, userId, fuel, status]
        );

        // Mengirimkan respons berhasil dengan data sepeda yang baru ditambahkan
        res.status(201).json({ message: 'Data sepeda berhasil ditambahkan', bike: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan data sepeda' });
    }
});


//Router 1: Menampilkan landing page (login/register)
app.get('/', (req, res) => {
    temp = req.session;
    if (temp.username && temp.visits) { //jika user terdaftar maka akan masuk ke halaman admin
        return res.redirect('../index.html');
    } else { //login / register page
        temp.visits = 1;
        res.sendFile(path.join(__dirname, '../index.html'));
    }
});

app.get('/', (req, res) => {
    temp = req.session;
    if (temp.username && temp.visits) { //jika user terdaftar maka akan masuk ke halaman admin
        return res.redirect('../index.html');
    } else { //login / register page
        temp.visits = 1;
        res.sendFile(path.join(__dirname, '../index.html'));
    }
});

// Memulai server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});