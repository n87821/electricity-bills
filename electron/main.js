const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { db } = require('./database');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // In development, load from localhost
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('get-customers', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM customers ORDER BY name', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle('add-customer', async (_, customer) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO customers (id, name, address, meterNumber, createdAt) VALUES (?, ?, ?, ?, ?)');
    stmt.run(customer.id, customer.name, customer.address, customer.meterNumber, customer.createdAt, function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
    stmt.finalize();
  });
});

ipcMain.handle('update-customer', async (_, customer) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('UPDATE customers SET name = ?, address = ?, meterNumber = ? WHERE id = ?');
    stmt.run(customer.name, customer.address, customer.meterNumber, customer.id, function(err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
    stmt.finalize();
  });
});

ipcMain.handle('delete-customer', async (_, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM customers WHERE id = ?', id, function(err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
});

ipcMain.handle('get-bills', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM bills ORDER BY date DESC', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle('add-bill', async (_, bill) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO bills (id, customerId, previousReading, currentReading, consumption, amount, rate, date, isPaid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(
      bill.id,
      bill.customerId,
      bill.previousReading,
      bill.currentReading,
      bill.consumption,
      bill.amount,
      bill.rate,
      bill.date,
      bill.isPaid,
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
    stmt.finalize();
  });
});

ipcMain.handle('mark-bill-paid', async (_, id) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE bills SET isPaid = 1 WHERE id = ?', id, function(err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
});

ipcMain.handle('delete-bill', async (_, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM bills WHERE id = ?', id, function(err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
});
