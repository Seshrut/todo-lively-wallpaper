const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const PORT = 8080;
const app = express();
app.use(express.json());

const JWT_SECRET = 'your_super_secret_key';

const users = [
  { id: 'user1', username: 'user1', passwordHash: bcrypt.hashSync('pass1', 8) },
  { id: 'user2', username: 'user2', passwordHash: bcrypt.hashSync('pass2', 8) }
];

const todo = {};

app.listen(PORT, () => {
  console.log(`server online at http://localhost:${PORT}`);
});

app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.sendStatus(403);
  }
}

app.get('/', authenticateToken, (req, res) => {
  const userId = req.userId;
  if (!todo[userId]) todo[userId] = { comptasks: {}, tasks: {} };
  res.status(200).send(todo[userId]);
});

app.post('/', authenticateToken, (req, res) => {
  const userId = req.userId;
  if (!todo[userId]) todo[userId] = { comptasks: {}, tasks: {} };

  const { comptasks = {}, tasks = {} } = req.body;

  for (let taskID in comptasks) {
    let newID = taskID;
    while (todo[userId].comptasks[newID] || todo[userId].tasks[newID]) {
      newID += '_';
    }
    todo[userId].comptasks[newID] = comptasks[taskID];
  }

  for (let taskID in tasks) {
    let newID = taskID;
    while (todo[userId].tasks[newID] || todo[userId].comptasks[newID]) {
      newID += '_';
    }
    todo[userId].tasks[newID] = tasks[taskID];
  }

  res.send(todo[userId]);
});

app.patch('/', authenticateToken, (req, res) => {
  const userId = req.userId;
  if (!todo[userId]) return res.sendStatus(404);

  const { comptasks = {}, tasks = {} } = req.body;

  for (let taskID in comptasks) {
    if (todo[userId].tasks[taskID]) {
      delete todo[userId].tasks[taskID];
    }
    todo[userId].comptasks[taskID] = comptasks[taskID];
  }

  for (let taskID in tasks) {
    if (todo[userId].comptasks[taskID]) {
      delete todo[userId].comptasks[taskID];
    }
    todo[userId].tasks[taskID] = tasks[taskID];
  }

  res.send(todo[userId]);
});

app.delete('/', authenticateToken, (req, res) => {
  const userId = req.userId;
  if (!todo[userId]) return res.sendStatus(404);

  const { comptasks = [], tasks = [] } = req.body;

  comptasks.forEach(id => delete todo[userId].comptasks[id]);
  tasks.forEach(id => delete todo[userId].tasks[id]);

  res.send(todo[userId]);
});


app.get('/whoami', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ message: 'invalid token' });
  }
  res.send({ 
    id: user.id,
    username: user.username
  });
});
/*
POST /login HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Content-Length: 51

{
  "username": "user1",
  "password": "pass1"
}

GET / HTTP/1.1
Host: localhost:8080
Authorization: Bearer <YOUR_JWT_TOKEN>

POST / HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Length: 102

{
  "comptasks": {
    "task123": "Buy groceries"
  },
  "tasks": {
    "task456": "Finish homework"
  }
}

PATCH / HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Length: 118

{
  "tasks": {
    "task123": "Buy groceries (tasks)"
  },
  "comptasks": {
    "task456": "Finish homework (reopened)"
  }
}

DELETE / HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Length: 56

{
  "comptasks": ["task456"],
  "tasks": ["task123"]
}
*/