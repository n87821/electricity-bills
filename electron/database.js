const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

// Get the user data path
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'electricity.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database.');
    createTables();
  }
});

// Create tables if they don't exist
function createTables() {
  db.serialize(() => {
    // Customers table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      meterNumber TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )`);

    // Bills table
    db.run(`CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      previousReading INTEGER NOT NULL,
      currentReading INTEGER NOT NULL,
      consumption INTEGER NOT NULL,
      amount REAL NOT NULL,
      rate REAL NOT NULL,
      date TEXT NOT NULL,
      isPaid INTEGER DEFAULT 0,
      FOREIGN KEY (customerId) REFERENCES customers(id)
    )`);

    // Settings table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      kwRate REAL NOT NULL DEFAULT 0.6,
      companyName TEXT NOT NULL DEFAULT 'شركة عياش جروب',
      systemName TEXT NOT NULL DEFAULT 'نظام إدارة فواتير الكهرباء'
    )`);

    // Insert default settings if not exists
    db.get('SELECT COUNT(*) as count FROM settings', (err, row) => {
      if (err) {
        console.error('Error checking settings:', err);
        return;
      }
      if (row.count === 0) {
        db.run(`INSERT INTO settings (id, kwRate, companyName, systemName)
                VALUES (1, 0.6, 'شركة عياش جروب', 'نظام إدارة فواتير الكهرباء')`);
      }
    });
  });
}

module.exports = { db }; 