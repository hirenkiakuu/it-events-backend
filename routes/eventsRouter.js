const eventsRouter = require('express').Router();
const eventsController = require('../controllers/eventsController');
// event routing

eventsRouter.get('/events', eventsController.getAllEvents);
eventsRouter.post('/newevent', eventsController.addEvent);


module.exports = eventsRouter;