const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'register'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle form submission
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  const insertQuery = `INSERT INTO user (name, email, password) VALUES (?, ?, ?)`;
  connection.query(insertQuery, [name, email, password], (err, result) => {
    if (err) throw err;
    console.log('User registered successfully');
    res.send('Registration successful!');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
