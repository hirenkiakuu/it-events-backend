const eventsRouter = require('express').Router();
const eventsController = require('../controllers/eventsController');
// event routing

eventsRouter.get('/events', eventsController.getAllEvents);
eventsRouter.get('/events/:event_id', eventsController.getEventById);
eventsRouter.post('/recommendedevents', eventsController.getRecommendedEvents);
eventsRouter.post('/newevent', eventsController.isValidEventMiddleware, eventsController.createEvent);
eventsRouter.delete('/events/:event_id', eventsController.deleteEventById);

module.exports = eventsRouter;