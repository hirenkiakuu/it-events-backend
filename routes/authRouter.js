const authRouter = require('express').Router();
const authController = require('../controllers/authController');
const {check} = require('express-validator');
const jwt = require('jsonwebtoken');

// checking for authorization role middleware
const checkUserRole = (requiredRole='user') => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(403).json({ message: 'User is not authorized' });
            }
            const decodedData = jwt.verify(token, process.env.MYSECRET_KEY);
            req.user = decodedData;
            next();
        } catch(err) {
            console.log(err);
            return res.status(403).json({ message: 'User is not authorized' });
        }

        next();
    };
};

const checkIsAdmin = checkUserRole('admin');
const checkIsUser = checkUserRole();

// authorization routing

authRouter.post('/register', 
    check('email', 'Username can not be empty').notEmpty(),
    check('password', 'Password must be greater than 4 and shorter than 10 symbols').isLength({min: 4, max: 10}),
    authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/like', authController.likeEvent);
authRouter.post('/dislike', authController.dislikeEvent);
authRouter.get('/users', authController.getUsers);
authRouter.get('/user', authController.getUser);

module.exports = authRouter;
