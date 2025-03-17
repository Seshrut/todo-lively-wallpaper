const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

// app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/task',(req,res)=>{
    console.log("Received GET request for todo list");
    res.json({message:"send todo"})
})

app.post('/task', (req, res) => {
    console.log("Received POST request:", req.body);
    res.json({ message: "Data received successfully" });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});