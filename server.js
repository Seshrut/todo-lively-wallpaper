const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');

app.listen(8080, () => {
    console.log('Server is running on http://localhost:3000');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});