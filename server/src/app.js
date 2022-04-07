const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); 
/* For our Logs  we use morgan */

const api = require('./routes/api');



const app= express();


app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/v1', api);


app.get('/*', (req, res) => {
    /* to direct directly to indexed.html when we load localhost:8000 // Also by addinf * to endpoint servers all pages in front end */
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

module.exports = app;








