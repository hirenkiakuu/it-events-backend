const db = require('../db');

async function getAllEvents(req, res) {
    try {
        const query = 'SELECT * FROM events';
        const [events] = await db.query(query);
        res.json({ events });
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
        (event_title, event_desc_brief, event_desc_full, event_author, event_date, event_address)
        VALUES (?, ?, ?, ?, ?, ?)`;

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