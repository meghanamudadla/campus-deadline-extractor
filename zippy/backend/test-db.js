const db = require('./database');
db.all("SELECT * FROM notices", [], (err, rows) => {
  if (err) console.error("Error reading notices:", err.message);
  else console.log("Notices in DB:", rows);
});