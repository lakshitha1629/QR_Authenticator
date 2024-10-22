const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Explicit route to serve mobile.html
app.get('/mobile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/mobile.html'));
});

// Route for dashboard after successful authentication
app.get('/dashboard', (req, res) => {
    res.send('<h1>Welcome to the Dashboard! You are authenticated.</h1>');
});

// WebSocket server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });
let validSessions = new Set();

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        console.log('Received message:', message);

        // If a session ID is received, store it in validSessions
        if (!validSessions.has(message)) {
            validSessions.add(message); // Add session ID to valid sessions
            console.log('Session ID stored:', message);
        } else {
            // If session ID matches, authenticate the user
            ws.send('authenticated');
            console.log('User authenticated with session ID:', message);
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});
