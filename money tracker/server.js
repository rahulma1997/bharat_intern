const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'money_tracker'
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
  // Fetch and display balance and transactions from the database
  const fetchBalanceQuery = 'SELECT SUM(amount) AS balance FROM transactions';
  connection.query(fetchBalanceQuery, (err, result) => {
    if (err) throw err;
    const balance = result[0].balance || 0;

    const fetchTransactionsQuery = 'SELECT * FROM transactions ORDER BY id DESC';
    connection.query(fetchTransactionsQuery, (err, results) => {
      if (err) throw err;

      const transactionListHTML = results.map(transaction => {
        return `<li>${transaction.type.toUpperCase()}: $${transaction.amount.toFixed(2)} - ${transaction.description}</li>`;
      }).join('');

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="style.css">
          <title>Money Tracker</title>
          
        </head>
        <body>
          <header>
            <h1>Money Tracker</h1>
          </header>
        
          <section id="balance">
            <h2>Your Balance</h2>
            <p id="balance-amount">$${balance.toFixed(2)}</p>
          </section>
        
          <section id="transactions">
            <h2>Transactions</h2>
            <ul id="transaction-list">
              ${transactionListHTML}
            </ul>
          </section>
        
          <section id="add-transaction">
            <h2>Add Transaction</h2>
            <form action="/add-transaction" method="post">
              <label for="type">Type:</label>
              <select id="type" name="type" required>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
        
              <label for="amount">Amount:</label>
              <input type="number" id="amount" name="amount" step="0.01" required>
        
              <label for="description">Description:</label>
              <input type="text" id="description" name="description" required>
        
              <button type="submit">Add Transaction</button>
            </form>
          </section>
        </body>
        </html>
      `;

      res.send(html);
    });
  });
});

// Handle form submission to add a new transaction
app.post('/add-transaction', (req, res) => {
  const { type, amount, description } = req.body;

  const insertQuery = 'INSERT INTO transactions (type, amount, description) VALUES (?, ?, ?)';
  connection.query(insertQuery, [type, amount, description], (err, result) => {
    if (err) throw err;
    console.log('Transaction added successfully');
    res.redirect('/');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
