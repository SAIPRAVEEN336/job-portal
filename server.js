
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// MySQL connection pool setup
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // change as needed
  password: '', // change as needed
  database: 'job_applications_db', // change as needed
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


app.post('/apply', (req, res) => {
  const application = req.body;
  // Server-side validation
  if (!application.name || !application.email || !application.resume) {
    return res.status(400).send({ message: 'Name, email, and resume are required.' });
  }
  // Insert into MySQL (with company and role)
  const sql = 'INSERT INTO applications (name, email, resume, coverLetter, company, role) VALUES (?, ?, ?, ?, ?, ?)';
  pool.query(
    sql,
    [
      application.name,
      application.email,
      application.resume,
      application.coverLetter || '',
      application.company || '',
      application.role || ''
    ],
    (err, results) => {
      if (err) {
        console.error('Error saving application:', err);
        return res.status(500).send({ message: 'Failed to save application.' });
      }
      res.send({ message: 'Application received and saved!' });
    }
  );
});

// Endpoint to get all job applications from MySQL
app.get('/applications', (req, res) => {
  pool.query('SELECT * FROM applications', (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to read applications.' });
    }
    res.send(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});``