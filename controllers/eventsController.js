const similarity = require('compute-cosine-similarity');
const db = require('../db');
const User = require('../models/User');

function createSparseVector(categoryValues) {
    const sparseVector = Array.from({ length: 15 }).fill(0);

    // за основу берется массив категорий ивента event.categories
    for (let i = 0; i < categoryValues.length; i++) {
        const element = categoryValues[i];
        sparseVector[element - 1] = element;
    }

    return sparseVector;
}

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

    async getRecommendedEvents(req, res) {
        try {
            // запрос на получение id лайкнутых юзером event`ов из таблицы userevents
            const userId = req.body.user_id;
            const [userLikedEventsIds] = await User.getUserLikedEvents(userId);
            const likedIds = userLikedEventsIds.map(({ event_id }) => event_id);

            // плейсхолдер для event_id в таблице eventscategories
            let idPlaceholders = likedIds.map(() => '?').join(', ');
            const query = `
                SELECT DISTINCT category_id
                FROM eventscategories
                WHERE event_id IN (${idPlaceholders});
            `;

            // запрос на получение id тэга в таблице eventscategories
            let [queriedIds] = await db.execute(query, likedIds);

            // приведение к массиву, состоящему из id 
            queriedIds = queriedIds.map(({ category_id }) => category_id);

            // создание разреженного пользовательского вектора
            const userSparseVector = createSparseVector(queriedIds);

            // запрос на получение ивентов и их категорий из таблицы eventscategories
            const eventsAndCategoriesQuery = 'SELECT * FROM eventscategories';
            const [eventsAndCategories] = await db.execute(eventsAndCategoriesQuery);

            // упорядочивание и сопоставление категорий своему ивенту
            const groupedByEventId = eventsAndCategories.reduce((acc, { event_id, category_id }) => {
                if (!acc[event_id]) {
                    acc[event_id] = { event_id, categories: [] };
                }

                acc[event_id].categories.push(category_id);

                return acc;
            }, {});

            // временная бд, хранящая ивенты и их категории
            // имеет вид [ {event_id: _, event_categories: []} ]
            const database = Object.values(groupedByEventId);

            // создание разреженных векторов для каждого ивента
            database.forEach(event => {
                // за основу берется массив категорий ивента event.categories
                event.categories = createSparseVector(event.categories);
            })

            // расчет косинусного подобия вектора каждого ивента с пользовательским вектором
            // добавляется как поле обьекту event в массиве database
            database.forEach(event => {
                const sim = similarity(event.categories, userSparseVector);
                event.sim = sim;
            });
        
            // отсеивание ивентов с 0 подобием и сортировка по убыванию косинусного подобия
            const recommendations = database
                .filter(event => event.sim !== 0) // Фильтрация элементов с sim !== 0
                .sort((a, b) => b.sim - a.sim) // Сортировка по убыванию поля sim
                .map(event => event.event_id) // формирование массива с id рекомендованных ивентов
            
            res.json({recommendations});
        } catch (err) {
            console.log(err);
            console.error(err);
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