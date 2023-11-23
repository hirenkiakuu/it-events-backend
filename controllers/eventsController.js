const db = require('../db');

async function getAllEvents(req, res) {
    try {
        const query = 'SELECT * FROM events';
        const [events] = await db.query(query);
        res.status(200).json({ events });
        console.log('Succesfully return all events');
    } catch(err) {
        console.log(err);
        res.status(500).json({message: 'Internal server error' });
    }
}

async function addEvent(req, res) {
    const event = req.body;

    if (!event) {
        console.log(req.body);
        res.status(400).json({ message: 'Error' });
    }
    try {
        const query = `INSERT INTO events 
        (event_title, event_description, event_organizer_id, event_date, event_address, event_platfrom)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.execute(query, [...Object.values(event)]);

        const eventId = result.insertId;
        res.status(201).json({ eventId, message: 'Event added succesfully' });
    } catch(err) {
        console.error('Error adding event', err);
        res.status(500).json({ message: 'Failed to add event' });
    }
}

module.exports = {
    getAllEvents,
    addEvent
};