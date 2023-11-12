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


app.listen(PORT, () => console.log('server is running on port 3000'));