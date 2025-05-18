const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
require('dotenv').config()

mongoose.connect('mongodb://localhost:27017/todoapp');

const PORT = 8080;
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per window
  message: { message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const logsignSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).max(128).required()
});

const taskObjectSchema = Joi.object().pattern(
  Joi.string().pattern(/^task\d+$/),  // task ID like task123
  Joi.string().max(500)               // task description
);

const postpatchSchema = Joi.object({
  tasks: taskObjectSchema.optional(),
  comptasks: taskObjectSchema.optional()
});

const deleteSchema = Joi.object({
  tasks: Joi.array().items(
    Joi.string().pattern(/^task\d+$/)
  ).optional(),

  comptasks: Joi.array().items(
    Joi.string().pattern(/^task\d+$/)
  ).optional()
});

const userSchema = new mongoose.Schema({
  username: String,
  passwordHash: String
});

const User = mongoose.model('User', userSchema);

const todoSchema = new mongoose.Schema({
  userId: String,
  tasks: { type: Object, default: {} },
  comptasks: { type: Object, default: {} }
});

const Todo = mongoose.model('Todo', todoSchema);

app.listen(PORT, () => {
  console.log(`server online at http://localhost:${PORT}`);
});

app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

app.post('/login', authLimiter, async (req, res) => {
  const {error} = logsignSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/signup', authLimiter, async (req, res) => {
  const {error} = logsignSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' });

  if (await User.findOne({ username }))
    return res.status(409).json({ message: 'Username already taken' });

  const passwordHash = await bcrypt.hash(password, 8);
  const id = `user${Date.now()}`;

  const newUser = new User({ id, username, passwordHash });
  await newUser.save();

  const newTodo = new Todo({ userId: id, tasks: {}, comptasks: {} });
  await newTodo.save();

  const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token });
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

app.get('/task', authenticateToken, async (req, res) => {
  const userId = req.userId;

  let userTodo = await Todo.findOne({ userId });
  if (!userTodo) {
    userTodo = new Todo({ userId, comptasks: {}, tasks: {} });
    await userTodo.save();
  }

  res.status(200).send({
    comptasks: userTodo.comptasks,
    tasks: userTodo.tasks
  });
});

app.post('/task', authenticateToken, async (req, res) => {
  const { error } = postpatchSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const userId = req.userId;

  let userTodo = await Todo.findOne({ userId });
  if (!userTodo) {
    userTodo = new Todo({ userId, comptasks: {}, tasks: {} });
  }

  const { comptasks = {}, tasks = {} } = req.body;

  for (let taskID in comptasks) {
    let newID = taskID;
    while (userTodo.comptasks[newID] || userTodo.tasks[newID]) {
      newID += '_';
    }
    userTodo.comptasks[newID] = comptasks[taskID];
  }

  for (let taskID in tasks) {
    let newID = taskID;
    while (userTodo.tasks[newID] || userTodo.comptasks[newID]) {
      newID += '_';
    }
    userTodo.tasks[newID] = tasks[taskID];
  }

  await userTodo.save();
  res.send({ comptasks: userTodo.comptasks, tasks: userTodo.tasks });
});

app.patch('/task', authenticateToken, async (req, res) => {
  const { error } = postpatchSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const userId = req.userId;
  const userTodo = await Todo.findOne({ userId });
  if (!userTodo) return res.sendStatus(404);

  const { comptasks = {}, tasks = {} } = req.body;

  for (let taskID in comptasks) {
    if (userTodo.tasks[taskID]) {
      delete userTodo.tasks[taskID];
    }
    userTodo.comptasks[taskID] = comptasks[taskID];
  }

  for (let taskID in tasks) {
    if (userTodo.comptasks[taskID]) {
      delete userTodo.comptasks[taskID];
    }
    userTodo.tasks[taskID] = tasks[taskID];
  }

  await userTodo.save();
  res.send({ comptasks: userTodo.comptasks, tasks: userTodo.tasks });
});

app.delete('/task', authenticateToken, async (req, res) => {
  const { error } = deleteSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });  
  const userId = req.userId;
  const userTodo = await Todo.findOne({ userId });
  if (!userTodo) return res.sendStatus(404);

  const { comptasks = [], tasks = [] } = req.body;

  comptasks.forEach(id => delete userTodo.comptasks[id]);
  tasks.forEach(id => delete userTodo.tasks[id]);

  await userTodo.save();
  res.send({ comptasks: userTodo.comptasks, tasks: userTodo.tasks });
});

app.get('/whoami', authenticateToken, async (req, res) => {
  const user = await User.findOne({ id: req.userId });
  if (!user) return res.status(404).json({ message: 'invalid token' });

  res.send({ id: user.id, username: user.username });
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