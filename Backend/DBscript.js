const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path')

const app = express();
const router = require('./Bridge');
const port = 3000;

app.use('/css', express.static(path.join(__dirname, '../css')));
app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Fungsi Import
const { generateUserID } = require('./userController');
const topUpRouter = require('./top-up');


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
app.use('/', router);

// Middleware untuk session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 3600000 }
}));

// function requireAuth(req, res, next) {
//     if (req.session.userId) {
//         // Lanjutkan jika pengguna telah terotentikasi
//         next();
//     } else {
//         // Kirim respons jika pengguna tidak terotentikasi
//         res.status(401).json({ message: 'Unauthorized' });
//     }
// }

// Rute untuk registrasi pengguna
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email, role } = req.body;

        // Cek apakah username sudah digunakan sebelumnya
        const usernameExists = await pool.query('SELECT * FROM user_table WHERE username = $1', [username]);
        if (usernameExists.rows.length > 0) {
            return res.status(400).json({ message: 'Username sudah digunakan' });
        }

        // Cek apakah email sudah digunakan sebelumnya
        const emailExists = await pool.query('SELECT * FROM user_table WHERE email = $1', [email]);
        if (emailExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email sudah digunakan' });
        }

        // Enkripsi password
        //const hashedPassword = await bcrypt.hash(password, 10);

        // Generate User ID
        const userID = await generateUserID(pool);

        // Simpan data pengguna ke tabel user_table 
        const result = await pool.query('INSERT INTO user_table (user_id, username, password, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING *', [userID, username, password, email, role]);

        // Mengirimkan respons berhasil
        //res.status(201).json({ message: 'Registrasi berhasil', user: result.rows[0] });
        res.send('<script>window.location.href = "/login";</script>');
        //res.redirect('/login');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat melakukan registrasi' });
    }
});


// Rute untuk login pengguna
app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Cari pengguna berdasarkan email atau username
        const result = await pool.query('SELECT * FROM user_table WHERE email = $1 OR username = $1', [identifier]);
        const userDB = result.rows[0];

        // Cek apakah pengguna ditemukan
        if (!userDB) {
            console.log("Pengguna tidak ditemukan");
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        // Verifikasi password
        if (password !== userDB.password) {
            console.log("Password salah");
            return res.status(401).json({ message: 'Password salah' });
        }

        // Simpan data pengguna yang berhasil login dalam session
        req.session.user = userDB;

        // Mengirimkan respons berhasil
        res.status(200).json({ message: 'Login berhasil', user: userDB });
        console.log(req.session.user);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat melakukan login' });
    }
});

//Rute untuk menampilkan profile pengguna
app.get('/api/user', (req, res) => {
    const userId = req.session.userId;

    // Ambil informasi pengguna dari database berdasarkan userId
    const getUserQuery = 'SELECT * FROM user_table WHERE id = $1';
    pool.query(getUserQuery, [userId], (error, result) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat mengambil informasi pengguna' });
        } else {
            const userDB = result.rows[0];

            if (userDB) {
                // Kirim informasi pengguna yang sedang login sebagai respons
                res.status(200).json({ username: userDB.username, role: userDB.role });
            } else {
                res.status(404).json({ message: 'Pengguna tidak ditemukan' });
            }
        }
    });
});

//Rute untuk menambahkan data profile
app.post('/api/profile', async (req, res) => {
    try {
        const { name, role, partnerID, vehicleLicense, npm, alamat, phoneNumber } = req.body;

        // Lakukan validasi data jika diperlukan

        // Simpan data ke dalam database
        const result = await pool.query(
            'INSERT INTO user_table  (name, role, partnerID, vehicleLicense, npm, alamat, phoneNumber) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
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

app.post('/api/topup', async (req, res) => {
    const userId = req.session.userId;
    const { amount } = req.body;

    try {
        // Perbarui saldo pengguna di dalam tabel user_table
        const updateQuery = 'UPDATE user_table SET balance = balance + $1 WHERE id = $2';
        await pool.query(updateQuery, [amount, userId]);

        // Ambil data pengguna terbaru setelah perubahan saldo
        const getUserQuery = 'SELECT * FROM user_table WHERE id = $1';
        const result = await pool.query(getUserQuery, [userId]);
        const userDB = result.rows[0];

        if (userDB) {
            // Kirim respons berhasil dengan data saldo terbaru
            res.status(200).json({ message: 'Top-up berhasil', balance: userDB.balance });
        } else {
            // Kirim respons gagal jika pengguna tidak ditemukan
            res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui saldo pengguna' });
    }
});

//API untuk update user
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { nama, alamat, phone_number, npm, vehicle_license } = req.body;

    try {
        // Cek apakah pengguna dengan ID yang diberikan ada di database
        const user_table = await pool.query('SELECT * FROM user_table  WHERE user_id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        // Update data pengguna
        const result = await pool.query(
            'UPDATE user_table  SET nama = $1, alamat = $2, phone_number = $3, npm = $4, vehicle_license = $5 WHERE user_id = $6 RETURNING *',
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

// Rute untuk logout pengguna
app.get('/api/logout', (req, res) => {
    // Hapus data pengguna dari session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ message: 'Terjadi kesalahan saat logout' });
        }

        // Mengirimkan respons berhasil
        res.status(200).json({ message: 'Logout berhasil' });
    });
});


// Memulai server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

module.exports = app, pool, router;