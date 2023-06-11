const express = require('express');
const router = express.Router();
const path = require('path');

// Konfigurasi routing untuk URI /login
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../login.html'));
});

// Konfigurasi routing untuk URI /register
//Router 1: Menampilkan landing page (login/register)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

router.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../profile.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../register.html'));
});

router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../home.html'));
});

router.get('/topup', (req, res) => {
    res.sendFile(path.join(__dirname, '../top-up.html'));
});

router.get('/bikun', (req, res) => {
    res.sendFile(path.join(__dirname, '../bikun.html'));
});

router.get('/krl', (req, res) => {
    res.sendFile(path.join(__dirname, '../krl.html'));
});

router.get('/editprofile', (req, res) => {
    res.sendFile(path.join(__dirname, '../edit-profile.html'));
});

router.get('/crudbikun', (req, res) => {
    res.sendFile(path.join(__dirname, '../crud-bikun.html'));
});

router.get('/cruddatabase', (req, res) => {
    res.sendFile(path.join(__dirname, '../crud-database.html'));
});

router.get('/cruddroploc', (req, res) => {
    res.sendFile(path.join(__dirname, '../crud-droploc.html'));
});

router.get('/crudkrl', (req, res) => {
    res.sendFile(path.join(__dirname, '../crud-krl.html'));
});

router.get('/crudsepeda', (req, res) => {
    res.sendFile(path.join(__dirname, '../crud-sepeda.html'));
});

router.get('/ADMIN', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

module.exports = router;