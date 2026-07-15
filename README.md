# Air Quality Dashboard

A simple web application to display and track air quality data from your outdoor sensor.

## Features
- **Real-time Monitoring**: Displays the latest Temperature, Humidity, PM2.5, and PM10 values.
- **Historical Data**: Automatically polls your sensor every 5 minutes and stores data in a SQLite database.
- **Interactive Graphs**: Visualizes the last 24 hours of data using Chart.js.

## Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.

### 2. Installation
1. Clone or download this project.
2. Open your terminal in the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```

### 3. Running the Dashboard
1. Start the server:
   ```bash
   node server.js
   ```
2. Open your browser and go to:
   [http://localhost:3000](http://localhost:3000)

## Configuration
- The sensor URL is currently set to `http://environment.emilyg.casa/`. You can change this in `server.js` if needed.
- The polling interval is set to 5 minutes. You can adjust this by modifying the cron schedule in `server.js`.

## Technical Details
- **Backend**: Node.js with Express.
- **Database**: SQLite for lightweight, file-based data storage.
- **Frontend**: Vanilla JS and CSS with Chart.js for data visualization.
