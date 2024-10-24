const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 4000;

// Serve static files
app.use(express.static('public'));

// Routes for serving HTML
app.get('/mobile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/mobile.html'));
});
app.get('/dashboard', (req, res) => {
    res.send('<h1>Welcome to the Dashboard! You are authenticated.</h1>');
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at https://qr-authenticator.onrender.com:${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

// Manage valid sessions
let validSessions = new Set();

// Sample login logic (replace with actual authentication if needed)
const loginUser = async (sessionId) => {
    try {
        const response = await axios.post(`https://dapi.ayozat.co.uk/api/auth/login`, { sessionId }, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data;  // Adjust based on actual API response
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
};

wss.on('connection', ws => {
    console.log('Client connected via WebSocket');

    ws.on('message', async (sessionId) => {
        console.log('Session ID received:', sessionId);

        if (validSessions.has(sessionId)) {
            const response = await loginUser(sessionId);
            if (response && response.success) {
                ws.send('authenticated');  // Notify client of successful login
            } else {
                ws.send('unauthorized');  // Notify client of failure
            }
        } else {
            ws.send('invalid_session');  // Notify client of invalid session
        }
    });

    ws.on('close', () => console.log('WebSocket connection closed'));
});
