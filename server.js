const express = require('express');
const cors = require('cors');
const conn = require('./db').promise();

const PORT = 3000;

const app = express();

app.use(cors());

// post user

// post event

// get events (by recommending)

// testing db request
app.get('/', async(req, res) => {
    const query = 'SELECT * FROM events';

    const [params] = await conn.execute(query);
    
    console.log(params);
});

app.use(express.json());


// posting event добавление ивента в бд
app.post('/addevent', async(req, res) => {
    const event = req.body;

    try {
        const query = `INSERT INTO events 
        (event_title, event_desc_brief, event_desc_full, event_author, event_date, event_address)
        VALUES (?, ?, ?, ?, ?, ?)`;

        conn.execute(query, [...Object.values(event)]);
        
        console.log('event успешно добавлен');
    } catch(err) {
        console.log(err);
    }
    

    // console.log(event.title);
});


app.listen(PORT, () => console.log('server is running on port 3000'));