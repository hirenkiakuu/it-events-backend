const db = require('../db');

const User = {
    create: (username, password, role='user') => {
        return db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
        [username, password, role]);
    }, 
    findByUsername: (username) => {
        return db.execute('SELECT * FROM users WHERE username = ?', [username]);
    },
    findById: (id) => {
        return db.execute('SELECT * FROM users WHERE user_id = ?', [id]);
    },
    getAllUsers: () => {
        return db.execute('SELECT * FROM users');
    },
    likeEvent: (userId, eventId) => {
        return db.execute('INSERT INTO eventsusers (user_id, event_id) VALUES (?, ?)', 
        [userId, eventId]);
    },
    dislikeEvent: (userId, eventId) => {
        const deleteTagsQuery = 'DELETE FROM eventsusers WHERE user_id=? AND event_id=?';
        return db.execute(deleteTagsQuery, [userId, eventId]);
    }
}

module.exports = User;

