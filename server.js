const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname)));

app.post('/task', (req, res) => {
    console.log("Received POST request:", req.body);
    res.json({ message: "Data received successfully" });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});