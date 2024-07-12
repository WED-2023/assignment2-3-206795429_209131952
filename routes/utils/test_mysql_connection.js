const mysql = require('mysql2');
require('dotenv').config();

console.log("Starting MySQL connection test...");

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Aa1234',
  database: 'mydb',
});

console.log("Attempting to connect to MySQL...");

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
  connection.end();
});