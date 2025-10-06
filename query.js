const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.all('SELECT * FROM users', (err, rows) => {
   if (err) {
      console.error(err);
   } else {
      console.log('Users:');
      console.log(rows);
   }
});

db.all('SELECT * FROM applications', (err, rows) => {
   if (err) {
      console.error(err);
   } else {
      console.log('Applications:');
      console.log(rows);
   }
});

db.all('SELECT * FROM login_logs', (err, rows) => {
   if (err) {
      console.error(err);
   } else {
      console.log('Login Logs:');
      console.log(rows);
   }
   db.close();
});