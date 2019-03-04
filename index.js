const http = require('http');
const path = require('path');
const express = require('express');
const helmet = require('helmet');

// App
const app = express();

// Protect headers
app.use(helmet());

// App Set Static Route
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// 404 page
app.get('*', (req, res, next) => {
    res.status(404);
    res.sendFile(path.join(__dirname, 'public/404.html'));
});

// Server settings
const server = http.createServer(app);
server.listen(3030);
console.log(`The server is listening on port 3030 http://localhost:3030`);