//API untuk menambahkan drop_point
app.post('/api/drop_points', async (req, res) => {
    try {
        const { location, chargerPoint, parkPoint, busStop } = req.body;

        // Masukkan data drop_point ke dalam tabel "drop_points"
        const result = await pool.query(
            'INSERT INTO drop_points (location, charger_point, park_point, bus_stop) VALUES ($1, $2, $3, $4) RETURNING *',
            [location, chargerPoint, parkPoint, busStop]
        );

        // Mengirimkan respons berhasil dengan data drop_point yang baru ditambahkan
        res.status(201).json({ message: 'Data drop_point berhasil ditambahkan', dropPoint: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan data drop_point' });
    }
});

// API untuk mengupdate drop_point berdasarkan nama lokasi
app.put('/api/drop_points/:location', async (req, res) => {
    try {
        const { location } = req.params;
        const { chargerPoint, parkPoint, busStop } = req.body;

        // Update data drop_point dalam tabel "drop_points" berdasarkan nama lokasi
        const result = await pool.query('UPDATE drop_points SET charger_point = $1, park_point = $2, bus_stop = $3 WHERE location = $4',
            [chargerPoint, parkPoint, busStop, location]);

        // Mengirimkan respons berhasil
        res.json({ message: 'Data drop_point berhasil diupdate' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengupdate data drop_point' });
    }
});

// API untuk menghapus drop_point berdasarkan nama lokasi
app.delete('/api/drop_points/:location', async (req, res) => {
    try {
        const { location } = req.params;

        // Hapus data drop_point dalam tabel "drop_points" berdasarkan nama lokasi
        const result = await pool.query('DELETE FROM drop_points WHERE location = $1', [location]);

        // Mengirimkan respons berhasil
        res.json({ message: 'Data drop_point berhasil dihapus' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus data drop_point' });
    }
});

// API untuk mencari data drop_point berdasarkan lokasi
app.get('/api/drop_points', async (req, res) => {
    try {
        const { location } = req.query;

        // Cari data drop_point dalam tabel "drop_points" berdasarkan lokasi
        const result = await pool.query('SELECT * FROM drop_points WHERE location = $1', [location]);

        // Mengirimkan respons dengan data drop_point yang sesuai dengan lokasi
        res.json({ dropPoints: result.rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mencari data drop_point' });
    }
});