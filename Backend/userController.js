// Fungsi untuk menghitung jumlah pengguna saat ini
const countUsers = async (pool) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM user_table');
        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Terjadi kesalahan saat menghitung jumlah pengguna');
    }
};

// Fungsi untuk membuat User ID berdasarkan jumlah pengguna saat ini
const generateUserID = async (pool) => {
    try {
        const count = await countUsers(pool);
        const year = new Date().getFullYear().toString().substr(-2);
        const userID = '20' + year + String(count + 1).padStart(6, '0');
        return userID;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Terjadi kesalahan saat membuat User ID');
    }
};

module.exports = { generateUserID, countUsers };