const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const cron = require('node-cron');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;
const SENSOR_URL = 'http://environment.emilyg.casa/';

app.use(cors());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./sensor_data.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        sds_p1 REAL,
        sds_p2 REAL,
        temperature REAL,
        pressure REAL,
        humidity REAL,
        signal REAL
    )`);
});

// Function to fetch and store data
async function fetchAndStoreData() {
    try {
        const response = await axios.get(SENSOR_URL);
        const data = response.data;
        
        const values = {};
        data.sensordatavalues.forEach(item => {
            if (item.value_type === 'SDS_P1') values.p1 = parseFloat(item.value);
            if (item.value_type === 'SDS_P2') values.p2 = parseFloat(item.value);
            if (item.value_type === 'BME280_temperature') values.temp = parseFloat(item.value);
            if (item.value_type === 'BME280_pressure') values.press = parseFloat(item.value);
            if (item.value_type === 'BME280_humidity') values.hum = parseFloat(item.value);
            if (item.value_type === 'signal') values.sig = parseFloat(item.value);
        });

        db.run(`INSERT INTO readings (timestamp, sds_p1, sds_p2, temperature, pressure, humidity, signal) 
                VALUES (datetime('now'), ?, ?, ?, ?, ?, ?)`, 
                [values.p1, values.p2, values.temp, values.press, values.hum, values.sig], 
                (err) => {
            if (err) console.error(err.message);
            console.log('Stored new sensor reading');
        });
    } catch (error) {
        console.error('Error fetching sensor data:', error.message);
    }
}

// Poll every 30 seconds
cron.schedule('*/30 * * * * *', () => {
    console.log('Polling sensor...');
    fetchAndStoreData();
});

// Initial fetch
fetchAndStoreData();

// API Endpoints
app.get('/api/latest', (req, res) => {
    db.get('SELECT * FROM readings ORDER BY timestamp DESC, id DESC LIMIT 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.get('/api/history', (req, res) => {
    const hours = req.query.hours || 24;
    db.all(`SELECT * FROM readings WHERE timestamp > datetime('now', '-${hours} hours') ORDER BY timestamp ASC, id ASC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
