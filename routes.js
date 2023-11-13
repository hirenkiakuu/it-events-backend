const router = require('express').Router();
const eventsController = require('./controllers/eventsController');
// event routing

router.get('/events', eventsController.getAllEvents);
router.post('/addevent', eventsController.addEvent);

module.exports = router;