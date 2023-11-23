const authRouter = require('express').Router();
const authController = require('../controllers/authController');
const {check} = require('express-validator');
// authorization routing

authRouter.post('/register', 
    check('username', 'Username can not be empty').notEmpty(),
    check('password', 'Password must be greater than 4 and shorter than 10 symbols').isLength({min: 4, max: 10}),
    authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/users', authController.getUsers);


module.exports = authRouter;