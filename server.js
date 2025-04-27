const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8080;
const JWT_SECRET = 'your_jwt_secret';

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

app.get('/whoami',(req,res) => {
    console.log("Received GET request for whoami");
    // check if token is valid or expired
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Invalid token format' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // const user = users.find(u => u.id === decoded.userId);
        // if (!user) return res.status(401).json({ message: 'User not found' });
        // res.json({ username: user.username });
        res.json({ message: 'valid token' });
      } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
      }
})

app.post('/login',(req,res)=>{
    console.log("Received POST request for login");
    console.log(req.body);
    res.json({token:"123123###"})
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});