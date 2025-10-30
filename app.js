const express = require("express");
const bodyParser = require("body-parser");
const db = require("./config/db");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// ===== ROUTES =====
app.get("/", (req, res) => {
  const sql = `
    SELECT pembelian.*, produk.nama AS nama_produk 
    FROM pembelian 
    JOIN produk ON pembelian.produk_id = produk.id 
    ORDER BY pembelian.tanggal DESC
  `;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.render("index", { pembelian: result });
  });
});

app.get("/tambah", (req, res) => {
  db.query("SELECT * FROM produk", (err, produk) => {
    if (err) throw err;
    res.render("tambahPembelian", { produk });
  });
});

app.post("/tambah", (req, res) => {
  const { produk_id, jumlah } = req.body;

  db.query("SELECT harga FROM produk WHERE id = ?", [produk_id], (err, result) => {
    if (err) throw err;
    const harga = result[0].harga;
    const total = harga * jumlah;

    db.query("UPDATE stok SET jumlah = jumlah - ? WHERE produk_id = ?", [jumlah, produk_id]);
    db.query(
      "INSERT INTO pembelian (produk_id, jumlah, total) VALUES (?, ?, ?)",
      [produk_id, jumlah, total],
      (err2) => {
        if (err2) throw err2;
        res.redirect("/");
      }
    );
  });
});

app.get("/cancel/:id", (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM pembelian WHERE id = ?", [id], (err, pembelian) => {
    if (err) throw err;
    if (pembelian.length === 0) return res.redirect("/");

    const { produk_id, jumlah } = pembelian[0];
    db.query("UPDATE stok SET jumlah = jumlah + ? WHERE produk_id = ?", [jumlah, produk_id]);
    db.query("UPDATE pembelian SET status = 'DIBATALKAN' WHERE id = ?", [id], (err2) => {
      if (err2) throw err2;
      res.redirect("/");
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server Xionco berjalan di http://localhost:${PORT}`));
