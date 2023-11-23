const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

class authController {
    async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Error while registration', errors });
            }

            const { username, password, role } = req.body;
   
            const [existingUser] = await User.findByUsername(username);
            
            if (existingUser.length) {
                return res.status(409).json({ error: 'User with this username already exists' });
            }

            const hashedPassword = bcrypt.hashSync(password, 7);
            
            await User.create(username, hashedPassword, role);

            res.status(201).json({ message: 'User registered successfully' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async login(req, res) {
        try {
            const {username, password} = req.body;
            const [user] = await User.findByUsername(username);
            
            console.log(user);

            if (!user.length) {
                return res.status(400).json({ message: 'User was not found' });
            }

            const [{ password: hashedPassword }] = user;
            const isPasswordValid = bcrypt.compareSync(password, hashedPassword);

            if (!isPasswordValid) {
                return res.status(400).json({ message: 'The password is incorrect' });
            }
            res.status(200).json({ message: 'Succesfully logged in' });
        } catch (e) {
            console.error(e);
            res.status(500).json( {error: 'Internal server error'} );
        }
    }

    async getUsers(req, res) {
        try {
            const allUsers = await User.getAllUsers();

            // res.status(200).json('server is working');
            res.status(200).json(allUsers[0]);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Internal server error'} );
        }
    }
}

module.exports = new authController();