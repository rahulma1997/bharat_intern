const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'blog'
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
  // Fetch and display blog posts from the database
  const query = 'SELECT * FROM posts';
  connection.query(query, (err, results) => {
    if (err) throw err;
    
    const postsHTML = results.map(post => {
      return `<div class="post"><h3>${post.title}</h3><p>${post.content}</p></div>`;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="style.css">
        <title>Blog</title>
        
      </head>
      <body>
        <header>
          <h1>My Blog</h1>
        </header>
      
        <section id="posts">
          ${postsHTML}
        </section>
      
        <section id="create-post">
          <h2>Create a Post</h2>
          <form action="/create-post" method="post">
            <label for="title">Title:</label>
            <input type="text" id="title" name="title" required>
      
            <label for="content">Content:</label>
            <textarea id="content" name="content" rows="4" required></textarea>
      
            <button type="submit">Publish</button>
          </form>
        </section>
      </body>
      </html>
    `;

    res.send(html);
  });
});

// Handle form submission to create a new post
app.post('/create-post', (req, res) => {
  const { title, content } = req.body;

  const insertQuery = 'INSERT INTO posts (title, content) VALUES (?, ?)';
  connection.query(insertQuery, [title, content], (err, result) => {
    if (err) throw err;
    console.log('Post created successfully');
    res.redirect('/');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
