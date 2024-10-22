const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000; // Use PORT from environment or default to 4000

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Explicit route to serve mobile.html
app.get('/mobile', (req, res) => {
    console.log("Request received for /mobile");
    res.sendFile(path.join(__dirname, 'public/mobile.html'));
});

// WebSocket server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    console.log('Client connected');
    ws.on('message', message => {
        console.log('Received message:', message);
        ws.send('Session ID received: ' + message);
    });
    ws.on('close', () => console.log('Client disconnected'));
});
