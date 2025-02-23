const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Use an absolute path to ensure correct file location
const logPath = path.join(__dirname, 'access.log');
console.log(`Logging to: ${logPath}`);
const logFile = fs.createWriteStream(logPath, { flags: 'a' });

app.use((req, res, next) => {
    const logEntry = `${new Date().toISOString()} - ${req.ip} - ${req.method} ${req.url}\n`;
    console.log(logEntry);
    logFile.write(logEntry);
    next();
});

app.get('/', (req, res) => {
    res.send('Hello, your Node.js server is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

