const db = require('../db');

class eventsController {
    async getAllEvents(req, res) {
        try {
            const query = `SELECT
            e.event_id,
            e.event_type,
            e.event_title,
            e.event_description,
            e.event_organizer,
            e.event_startdate,
            e.event_enddate,
            e.event_address,
            e.event_platform,
            GROUP_CONCAT(c.category_name SEPARATOR '_') AS event_tags
            FROM
            events e
            JOIN
            eventscategories ec ON e.event_id = ec.event_id
            JOIN
            categories c ON ec.category_id = c.category_id
            GROUP BY
            e.event_id;                  
            `;

            const [queriedEvents] = await db.execute(query);
            
            res.status(200).json(queriedEvents);
            console.log('Succesfully return all events');
        } catch(err) {
            console.log(err);
            res.status(500).json({message: 'Internal server error' });
        }
    }

    async getEventById(req, res) {
        try {
            const query = `SELECT
            e.event_id,
            e.event_type,
            e.event_title,
            e.event_description,
            e.event_organizer,
            e.event_startdate,
            e.event_enddate,
            e.event_address,
            e.event_platform,
            GROUP_CONCAT(c.category_name SEPARATOR '_') AS event_tags
            FROM
            events e
            JOIN
            eventscategories ec ON e.event_id = ec.event_id
            JOIN
            categories c ON ec.category_id = c.category_id
            WHERE
            e.event_id = ?
            GROUP BY
            e.event_id;                  
            `;

            const eventId = req.params.event_id;
            const [queriedEvent] = await db.execute(query, [eventId]);

            console.log(queriedEvent);

            res.status(200).json(queriedEvent);
        } catch(err) {
            console.log(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    async createEvent(req, res) {
        try {
            const eventQuery = `INSERT INTO events 
            (event_type, event_title, event_description, event_organizer, event_startdate, event_enddate, event_address, event_platform)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            // данные могут придти в другом виде
            const rawEventTags = req.body.event_tags;
            const eventTags = rawEventTags.split('_');
            
            const [queryResult] = await db.execute(eventQuery, [
                req.body.event_type,
                req.body.event_title,
                req.body.event_description,
                req.body.event_organizer,
                req.body.event_startdate,
                req.body.event_enddate,
                req.body.event_address,
                req.body.event_platform,
            ]);

            console.log(queryResult);
            const lastInsertedId = queryResult.insertId;

            const eventsCategoriesQuery = `INSERT INTO eventscategories (event_id, category_id) VALUES (?, ?)`;
            const categoriesQuery = 'SELECT category_id FROM categories WHERE category_name=?';
            
            for (let eventTag of eventTags) {
                const [rawTagId] = await db.execute(categoriesQuery, [eventTag]);
                const tagId = rawTagId[0].category_id;

                const [result] = await db.execute(eventsCategoriesQuery, [lastInsertedId, tagId]);
            }

            // const [queryResult] = await db.execute(query, []);

            res.status(201).json({ message: 'Event added succesfully' });
        } catch(err) {
            console.error('Error adding event', err);
            res.status(500).json({ message: 'Failed to add event' });
        }
    }

    async deleteEventById(req, res) {
        try {
            const eventId = req.params.event_id;
            
            const deleteTagsQuery = 'DELETE FROM eventscategories WHERE event_id=?';
            await db.execute(deleteTagsQuery, [eventId]);

            const deleteEventQuery = 'DELETE FROM events WHERE event_id=?';
            await db.execute(deleteEventQuery, [eventId]);

            res.status(204).json({ message: 'Event successfully deleted' });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // валидация event'ов
    isValidEventMiddleware(req, res, next) {
        const requiredFields = [
            'event_type', 'event_title', 'event_description', 
            'event_organizer', 'event_startdate', 'event_enddate', 
            'event_address', 'event_platform', 'event_tags'
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