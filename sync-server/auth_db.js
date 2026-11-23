const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            save_data TEXT DEFAULT '{}',
            role TEXT DEFAULT 'user',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

function register(username, password, role = null) {
    return new Promise((resolve, reject) => {
        if (!username || !password) return reject(new Error('帳號或密碼不能為空'));
        const hash = bcrypt.hashSync(password, 10);
        
        // Check if this is the first registered user or admin
        db.get('SELECT COUNT(*) as count FROM users', (err, countRow) => {
            if (err) return reject(err);
            const userRole = role ? role : (countRow.count === 0 || username.toLowerCase() === 'admin' ? 'admin' : 'user');
            db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, hash, userRole], function(err2) {
                if (err2) {
                    if (err2.message.includes('UNIQUE')) {
                        return reject(new Error('此帳號名稱已存在'));
                    }
                    return reject(err2);
                }
                resolve({ id: this.lastID, username, role: userRole });
            });
        });
    });
}

function login(username, password) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
            if (err) return reject(err);
            if (!row) return reject(new Error('帳號或密碼錯誤'));
            const ok = bcrypt.compareSync(password, row.password);
            if (!ok) return reject(new Error('帳號或密碼錯誤'));
            resolve({ id: row.id, username: row.username, role: row.role || 'user', saveData: row.save_data });
        });
    });
}

function getSave(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT save_data FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            if (!row) return reject(new Error('找不到使用者'));
            resolve(row.save_data ? JSON.parse(row.save_data) : {});
        });
    });
}

function updateSave(userId, saveData) {
    return new Promise((resolve, reject) => {
        const jsonStr = typeof saveData === 'string' ? saveData : JSON.stringify(saveData);
        db.run(`UPDATE users SET save_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [jsonStr, userId], function(err) {
            if (err) return reject(err);
            resolve(true);
        });
    });
}

module.exports = {
    register,
    login,
    getSave,
    updateSave
};
