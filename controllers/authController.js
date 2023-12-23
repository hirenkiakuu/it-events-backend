const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateAccessToken = (id, role) => {
    const payload = {
        id, 
        role
    };

    return jwt.sign(payload, process.env.MYSECRET_KEY, {expiresIn: '24h'});
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
            const { email: username, password, role } = req.body;
            
            const [user] = await User.findByUsername(username);
            
            // console.log(user);

            if (!user.length) {
                return res.status(400).json({ message: 'User was not found' });
            }

            const [{ password: hashedPassword }] = user;
            const isPasswordValid = bcrypt.compareSync(password, hashedPassword);

            if (!isPasswordValid) {
                return res.status(400).json({ message: 'The password is incorrect' });
            }

            const token = generateAccessToken(user.user_id, user.user_role);

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
            const [user] = await User.findByUsername('user');
            
            res.status(200).json(user[0]);
        } catch (err) {
            res.status(500).json( {message: 'Internal server error' });
        }
    }
}

module.exports = new authController();