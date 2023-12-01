const db = require('../db');

class eventsController {
    async getAllEvents(req, res) {
        try {
            const query = 'SELECT * FROM events';

            const [queriedEvents] = await db.query(query);
            
            res.status(200).json(queriedEvents);
            console.log('Succesfully return all events');
        } catch(err) {
            console.log(err);
            res.status(500).json({message: 'Internal server error' });
        }
    }

    async getEvent(req, res) {
        try {
            const query = 'SELECT * FROM events WHERE event_id=2'

            const [queriedEvent] = await db.query(query);

            console.log(queriedEvent);

            res.status(200).json(queriedEvent);
        } catch(err) {
            console.log(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    async addEvent(req, res) {
        try {
            const query = `INSERT INTO events 
            (event_title, event_description, event_organizer_id, event_startdate, event_enddate, event_address, event_platform)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
            
            const clientEvent = req.body;

            const [queryResult] = await db.execute(query, [...Object.values(clientEvent)]);

            res.status(201).json({ message: 'Event added succesfully' });
        } catch(err) {
            console.error('Error adding event', err);
            res.status(500).json({ message: 'Failed to add event' });
        }
    }

    // валидация event'ов
    isValidEventMiddleware(req, res, next) {
        const requiredFields = [
            'event_title', 'event_description', 'event_organizer_id', 
            'event_startdate', 'event_enddate', 'event_address', 'event_platform'
        ];

        const clientEvent = req.body;
        
        if (!requiredFields.every(field => clientEvent[field])) {
            console.log('Didnt pass validation');
            return res.status(400).json({ message: 'Retrieved event is not valid' });
        }

        console.log('Passed validation');
        next();
    }
}

module.exports = new eventsController();