const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const axios = require('axios'); // For making API requests to your site's login API
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
    console.log(`Server running at https://qr-authenticator.onrender.com:${PORT}`);
});

const wss = new WebSocket.Server({ server });
let validSessions = new Set();

// Sample login code
const loginUser = async (data) => {
    const response = await axios({
        method: "post",
        data: data,
        url: `https://dapi.ayozat.co.uk/api/auth/login`,  // Updated login URL
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
    });
    return response.data;
};

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', async (sessionId) => {
        console.log('Received session ID:', sessionId);

        // Check if the session ID is valid and proceed with login
        if (validSessions.has(sessionId)) {
            try {
                // Login using your API (replace credentials as needed)
                const loginData = { sessionId }; // Adjust based on your backend's login expectations
                const response = await loginUser(loginData);

                if (response.success) {
                    ws.send('authenticated'); // Notify the client that the user is authenticated
                    console.log('User authenticated successfully with session ID:', sessionId);
                } else {
                    ws.send('unauthorized'); // Notify client if login failed
                    console.log('Login failed for session ID:', sessionId);
                }
            } catch (error) {
                console.error('Error logging in:', error);
                ws.send('error');
            }
        } else {
            ws.send('invalid_session');
            console.log('Invalid session ID:', sessionId);
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});
