const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateAccessToken = (id, role) => {
    const payload = {
        id,
        role
    };

    return jwt.sign(payload, process.env.MYSECRET_KEY, {expiresIn: '7d'});
}

class authController {
    async register(req, res) {
        try {
            const errors = validationResult(req);

            console.log(req.body);

            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Error while registration', errors });
            }

            const { email: username, password, userType: role } = req.body;
            

            const [existingUser] = await User.findByUsername(username);
            
            if (existingUser.length) {
                return res.status(409).json({ error: 'User with this username already exists' });
            }

            const hashedPassword = bcrypt.hashSync(password, 7);
            
            await User.create(username, hashedPassword, role);

            res.status(201).json({ message: 'User registered successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async login(req, res) {
        try {
            console.log(req.body);
            const { email: username, password} = req.body;
            
            const [user] = await User.findByUsername(username);
            console.log(user);
            // console.log(user);

            if (!user.length) {
                return res.status(400).json({ message: 'User was not found' });
            }

            const [{ password: hashedPassword }] = user;
            const isPasswordValid = bcrypt.compareSync(password, hashedPassword);

            if (!isPasswordValid) {
                return res.status(400).json({ message: 'The password is incorrect' });
            }

            console.log(user.user_id);
            console.log(user.user_role);
            const token = generateAccessToken(user[0].user_id, user[0].role);

            res.status(200).json({token});
        } catch (err) {
            console.error(err);
            res.status(500).json( {error: 'Internal server error', err} );
        }
    }

    async getUsers(req, res) {
        try {
            const allUsers = await User.getAllUsers();

            // res.status(200).json('server is working');
            res.status(200).json(allUsers[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error'} );
        }
    }

    // тестовое
    async getUser(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decodedData = jwt.verify(token, process.env.MYSECRET_KEY);
            console.log(decodedData);
            const [user] = await User.findById(decodedData.id);
            
            res.status(200).json({ id: user[0].user_id, username: user[0].username, role: user[0].role });
        } catch (err) {
            console.log(err);
            res.status(500).json( {message: 'Internal server error' });
        }
    }

    async likeEvent(req, res) {
        try {
            
            const userId = req.body.user_id;
            const eventId = req.body.event_id;
            console.log(req.body);
            console.log(userId)
            console.log(eventId)
            User.likeEvent(userId, eventId);
            res.status(201).json({ message: 'Successfully added event to favorites' });
        } catch (err) {
            return res.status(500).json( { message: 'Internal server error' } );
        }
    }

    async dislikeEvent(req, res) {
        try {
            const userId = req.body.user_id;
            const eventId = req.body.event_id;
            console.log(req.body);
            console.log(userId)
            console.log(eventId)
            User.dislikeEvent(userId, eventId);
            res.status(201).json({ message: 'Successfully deleted event from favorites' });
        } catch (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

}

module.exports = new authController();