const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const conn = require('./db');

const PORT = 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', routes);


app.listen(PORT, () => console.log(`server is running on port ${PORT}`));