const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const dbFile = './beevibe.db';
if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile); // Start clean

const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE hives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE,
    name TEXT,
    latitude REAL,
    longitude REAL,
    description TEXT
  )`);

  db.run(`CREATE TABLE sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hive_uuid TEXT,
    temperature REAL,
    humidity REAL,
    weight REAL,
    reading_time TEXT,
    FOREIGN KEY(hive_uuid) REFERENCES hives(uuid)
  )`);

  const hives = [
    { uuid: uuidv4(), name: 'Hive One', lat: -41.29, lon: 173.28, desc: 'First hive' },
    { uuid: uuidv4(), name: 'Hive Two', lat: -41.295, lon: 173.285, desc: 'Second hive' },
  ];

  hives.forEach(hive => {
    db.run(`INSERT INTO hives (uuid, name, latitude, longitude, description)
            VALUES (?, ?, ?, ?, ?)`,
      [hive.uuid, hive.name, hive.lat, hive.lon, hive.desc]);

    const now = new Date().toISOString();
    db.run(`INSERT INTO sensor_readings (hive_uuid, temperature, humidity, weight, reading_time)
            VALUES (?, ?, ?, ?, ?)`,
      [hive.uuid, 32.5, 65.2, 18000 + Math.random() * 500, now]);
  });

  console.log('✅ Database setup complete: beevibe.db');
});

db.close();
