// const db = require('./db');

// async function registerUser(req, res) {
//     try {
//         const { login, password } = req.body;

//         if (!login || !password) {
//             return res.status(400).json({ message: 'Both login and password are required' });
//         }

//         const [existingUsers] = await db.query('SELECT * FROM users WHERE login = ?', [login]);
//         if (existingUsers.length > 0) {
//             return res.status(409).json({ message: 'User with this login already exists '});
//         }

//         const [result] = await db.query('');

//     } catch(error) {
//         console.log(error);
//     }
// }

////

