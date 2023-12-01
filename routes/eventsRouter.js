const eventsRouter = require('express').Router();
const eventsController = require('../controllers/eventsController');
// event routing

eventsRouter.get('/events', eventsController.getAllEvents);
eventsRouter.post('/newevent', eventsController.isValidEventMiddleware, eventsController.addEvent);
eventsRouter.get('/event', eventsController.getEvent);

module.exports = eventsRouter;