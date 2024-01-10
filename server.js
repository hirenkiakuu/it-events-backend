const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/authRouter');
const eventsRouter = require('./routes/eventsRouter');

const PORT = 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use('/test', authRouter);
app.use('/api/v1', eventsRouter);


app.listen(PORT, () => console.log(`server is running on port ${PORT}`));