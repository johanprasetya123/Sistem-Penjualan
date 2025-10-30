const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // sesuaikan
  database: 'sistem penjualan'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Terhubung ke database sistem penjualan');
});

module.exports = db;
