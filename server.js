
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');
const app = express();
const port = 3000;
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

app.use(express.json());
app.use(express.static('public'));

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).send({ message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// SQLite database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Promisify db methods
const dbRun = util.promisify(db.run.bind(db));
const dbGet = util.promisify(db.get.bind(db));
const dbAll = util.promisify(db.all.bind(db));

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullname TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table ready');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      resume TEXT NOT NULL,
      coverLetter TEXT,
      company TEXT,
      role TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating applications table:', err);
    } else {
      console.log('Applications table ready');
    }
  });

  // Add user_id column if it doesn't exist
  db.run(`ALTER TABLE applications ADD COLUMN user_id INTEGER REFERENCES users(id)`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding user_id column:', err);
    } else if (!err) {
      console.log('Added user_id column to applications');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating login_logs table:', err);
    } else {
      console.log('Login logs table ready');
    }
  });
});

// Signup endpoint
app.post('/signup', async (req, res) => {
   console.log('Signup request received:', req.body);
   const { fullname, email, password } = req.body;

   if (!fullname || !email || !password) {
      console.log('Missing fields');
      return res.status(400).send({ message: 'All fields are required.' });
   }

   try {
      // Check if user already exists
      const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
      console.log('Existing user check:', existingUser);
      if (existingUser) {
         return res.status(400).send({ message: 'User already exists.' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed');

      // Insert user
      await dbRun('INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)', [fullname, email, hashedPassword]);
      console.log('User inserted');

      res.send({ message: 'User registered successfully.' });
   } catch (err) {
      console.error('Error registering user:', err);
      res.status(500).send({ message: 'Failed to register user.' });
   }
});

// Login endpoint
app.post('/login', async (req, res) => {
   console.log('Login request received:', req.body);
   const { email, password } = req.body;

   if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).send({ message: 'Email and password are required.' });
   }

   try {
      // Find user
      const user = await dbGet('SELECT id, fullname, password FROM users WHERE email = ?', [email]);
      console.log('User found:', user ? 'yes' : 'no');
      if (!user) {
         return res.status(400).send({ message: 'Invalid email or password.' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isValidPassword);
      if (!isValidPassword) {
         return res.status(400).send({ message: 'Invalid email or password.' });
      }

      // Log the login
      await dbRun('INSERT INTO login_logs (user_id, email) VALUES (?, ?)', [user.id, email]);
      console.log('Login logged');

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      res.send({ message: 'Login successful.', token, user: { id: user.id, fullname: user.fullname, email } });
   } catch (err) {
      console.error('Error logging in:', err);
      res.status(500).send({ message: 'Failed to login.' });
   }
});

app.post('/apply', authenticateToken, async (req, res) => {
   const application = req.body;
   // Server-side validation
   if (!application.name || !application.email || !application.resume) {
     return res.status(400).send({ message: 'Name, email, and resume are required.' });
   }
   try {
     // Insert into SQLite with user_id
     await dbRun('INSERT INTO applications (user_id, name, email, resume, coverLetter, company, role) VALUES (?, ?, ?, ?, ?, ?, ?)', [
       req.user.id,
       application.name,
       application.email,
       application.resume,
       application.coverLetter || '',
       application.company || '',
       application.role || ''
     ]);
     res.send({ message: 'Application received and saved!' });
   } catch (err) {
     console.error('Error saving application:', err);
     res.status(500).send({ message: 'Failed to save application.' });
   }
 });

// Endpoint to get all job applications from SQLite (public, for admin maybe)
app.get('/applications', async (req, res) => {
  try {
    const applications = await dbAll('SELECT * FROM applications');
    res.send(applications);
  } catch (err) {
    console.error('Error reading applications:', err);
    res.status(500).send({ message: 'Failed to read applications.' });
  }
});

// Protected endpoint to get user's applications
app.get('/user/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await dbAll('SELECT * FROM applications WHERE user_id = ?', [req.user.id]);
    res.send(applications);
  } catch (err) {
    console.error('Error reading user applications:', err);
    res.status(500).send({ message: 'Failed to read applications.' });
  }
});

// Protected endpoint to get user profile
app.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, fullname, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.send(user);
  } catch (err) {
    console.error('Error reading user profile:', err);
    res.status(500).send({ message: 'Failed to read profile.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});``