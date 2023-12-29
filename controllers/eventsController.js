const similarity = require('compute-cosine-similarity');
const db = require('../db');
const User = require('../models/User');


async function fetchData(likedIds) {
    const categoriesArr = [];

    // Используем Promise.all для ожидания завершения всех асинхронных операций
    await Promise.all(likedIds.map(async likedId => {
        try {
            const result = await db.execute(query, [likedId]);
            categoriesArr.push(result);
        } catch (error) {
            console.error(error);
        }
    }));

    console.log(categoriesArr);

    // Преобразование категорий, если это необходимо
    const categoryIds = categoriesArr.map(({ category_id }) => category_id);
    console.log(categoryIds);

    return categoryIds;
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
            const getAllEventsQuery = 'SELECT * FROM events';
            const [allEvents] = await db.execute(getAllEventsQuery);

            const userId = req.body.user_id;
            const [userLikedEventsIds] = await User.getUserLikedEvents(userId);
            const likedIds = userLikedEventsIds.map(({ event_id }) => event_id);
    
            console.log(userLikedEventsIds);

            const selectedEvents = allEvents.filter(event => likedIds.includes(event.event_id));
            
            console.log(selectedEvents)

            const placeholders = likedIds.map(() => '?').join(', ');
            const query = `
                SELECT DISTINCT category_id
                FROM eventscategories
                WHERE event_id IN (${placeholders});
            `;

            // Выполнение запроса с массивом id событий
            let [rows] = await db.execute(query, likedIds);

            console.log(rows);

            rows = rows.map(({ category_id }) => category_id)

            console.log(rows)

            const placeholders2 = rows.map(() => '?').join(', ');
            const query2 = `
                SELECT DISTINCT category_name
                FROM categories
                WHERE category_id IN (${placeholders2});
            `;
            let [userCategories] = await db.execute(query2, rows);
            userCategories = userCategories.map(({ category_name }) => category_name);
            console.log(userCategories);

            // const eventsCategories = await db.execute();
            // const query2 = `
            //     SELECT DISTINCT category_name
            //     FROM categories
            //     WHERE category_id IN (${placeholders2});
            // `;
            // let [userCategories] = await db.execute(query2, rows);
            // userCategories = usersCategories.map(({ category_name }) => category_name);
            // console.log(usersCategories);

        //     const usersLikedEvents = allEvents.filter(event => {
        //         ///
        //     });

        //     const userCategories = ////
        

        const inputVector = rows;
        const maxElement = Math.max(...inputVector);

    // Создать новый массив с нулями
         const sparseVector1 = Array.from({ length: 15 }).fill(0);

// Заполнить новый массив весами из исходного вектора
            for (let i = 0; i < inputVector.length; i++) {
            const element = inputVector[i];
            sparseVector1[element - 1] = element;
            }

            console.log(sparseVector1);

            const queryx = 'SELECT event_id, category_id FROM eventscategories'
            const [eventsx] = await db.execute(queryx);

            console.log(eventsx);

        //     const categoriesMatrix = vectorizer.fitTransform(eventsDatabase.map(event => event.categories.join(' ')));

            // const userVector = vectorizer.transform([userCategories.join(' ')]);

        //     const cosineSimilarities = userVector.cosineSimilarity(categoriesMatrix).data;

        // // Получаем индексы ивентов, отсортированных по убыванию косинусного подобия
        //     const recommendedEventIndices = cosineSimilarities
        //     .map((similarity, index) => ({ index, similarity }))
        //     .sort((a, b) => b.similarity - a.similarity)
        //     .map(item => item.index);

        // // Возвращаем рекомендации
        //     const recommendations = recommendedEventIndices.map(index => ({ event_id: eventsDatabase[index].event_id }));
        //     res.json({ recommendations });
        const groupedByEventId = eventsx.reduce((acc, { event_id, category_id }) => {
            if (!acc[event_id]) {
              acc[event_id] = { event_id, categories: [] };
            }
          
            acc[event_id].categories.push(category_id);

            return acc;
          }, {});
          
          // Преобразование объекта в массив
          const database = Object.values(groupedByEventId);
          
          console.log(database);

        //   var s = similarity( x, y );

          let similarities = [];

          database.forEach(event => {
            const sparseVector = Array.from({ length: 15 }).fill(0);

// Заполнить новый массив весами из исходного вектора
            for (let i = 0; i < event.categories.length; i++) {
            const element = event.categories[i];
            sparseVector[element - 1] = element;
            }

            event.categories = sparseVector;
          })

          console.log(database);

        database.forEach(event => {
            const sim = similarity(event.categories, sparseVector1);
            event.sim = sim;
        });

        console.log(database);
    // Индексы ивентов, отсортированные по убыванию сходства
    // const sortedIndexes = similarities
    //     .map((similarity, index) => ({ index, similarity }))
    //     .sort((a, b) => b.similarity - a.similarity)
    //     .map(item => item.index);

    // Возвращаем рекомендации в порядке убывания сходства
    //     const recommendations = sortedIndexes.map(index => eventsDatabase[index]);
    //     console.log(recommendations);
    // res.json({ recommendations });
        
      
      // Фильтрация и сортировка
      const sortedAndFilteredArray = database
        .filter(event => event.sim !== 0) // Фильтрация элементов с sim !== 0
        .sort((a, b) => b.sim - a.sim); // Сортировка по убыванию поля sim
      
        console.log(sparseVector1);
    
        console.log(sortedAndFilteredArray);
      
        const recommendations = sortedAndFilteredArray.map(event => event.event_id);
            
            res.json({recommendations});
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