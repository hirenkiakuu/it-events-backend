const db = require('../db');

const User = {
    create: (username, password, role='user') => {
        return db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
        [username, password, role]);
    }, 
    findByUsername: (username) => {
        return db.execute('SELECT * FROM users WHERE username = ?', [username]);
    },
    getAllUsers: () => {
        return db.execute('SELECT * FROM users');
    }
}

module.exports = User;

