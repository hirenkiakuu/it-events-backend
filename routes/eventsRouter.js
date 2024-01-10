const eventsRouter = require('express').Router();
const eventsController = require('../controllers/eventsController');
// event routing

eventsRouter.get('/all-events', eventsController.getAllEvents);
eventsRouter.get('/events/:event_id', eventsController.getEventById);
eventsRouter.post('/recommended-events', eventsController.getRecommendedEvents);
eventsRouter.post('/create-event', eventsController.isValidEventMiddleware, eventsController.createEvent);
eventsRouter.delete('/events/:event_id', eventsController.deleteEventById);

module.exports = eventsRouter;