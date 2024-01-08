const db = require('../db');

const User = {
    create: (username, password, role='user') => {
        try {    
            return db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
            [username, password, role]);
        } catch (err) {
            console.error('Error creating user: ', err);
            throw(err);
        }
    }, 
    findByUsername: (username) => {
        try {
            return db.execute('SELECT * FROM users WHERE username = ?', [username]);
        } catch (err) {
            console.error('Error finging user by username: ', err);
            throw(err); 
        }
    },
    findById: (id) => {
        try {
            return db.execute('SELECT * FROM users WHERE user_id = ?', [id]);
        } catch (err) {
            console.error('Error fingind user by id: ', err);
        }
    },
    getAllUsers: () => {
        try {
            return db.execute('SELECT * FROM users');
        } catch (err) {
            console.error('Errir getting all users', err);
            throw(err);
        }
    },
    likeEvent: (userId, eventId) => {
        try {
            return db.execute('INSERT INTO eventsusers (user_id, event_id) VALUES (?, ?)', 
            [userId, eventId]);
        } catch (err) {
            console.error('Error adding event to users preferred: ', err);
            throw(err);
        }
    },
    dislikeEvent: (userId, eventId) => {
        try {
            const deleteTagsQuery = 'DELETE FROM eventsusers WHERE user_id=? AND event_id=?';
            return db.execute(deleteTagsQuery, [userId, eventId]);
        } catch (err) {
            console.error('Error removing event from users preferred: ', err);
            throw(err);
        }
    },
    getUserLikedEvents: (userId) => {
        try {
            const getCategoriesQuery = 'SELECT event_id FROM eventsusers WHERE user_id=?';
            return db.execute(getCategoriesQuery, [userId]);
        } catch (err) {
            console.error('Error adding event to users preferred: ', err);
            throw(err);
        }
    }
}

module.exports = User;

