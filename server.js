const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const axios = require('axios'); // Import axios for API calls
const app = express();
const PORT = process.env.PORT || 4000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route to serve mobile.html
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

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', async (message) => {
        console.log('Received message:', message);

        // Extract email and password from the message
        const [email, password] = message.split(":");
        console.log(`Email: ${email}, Password: ${password}`);

        // Prepare data for the login API
        const loginData = {
            email: email,
            password: password
        };

        // Call the backend login API
        try {
            const response = await axios.post('https://dapi.ayozat.co.uk/api/auth/login', loginData, {
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            });

            if (response.data.success) {
                ws.send('authenticated');  // If login is successful, send 'authenticated'
                console.log('User authenticated');
            } else {
                ws.send('authentication failed');
                console.log('Authentication failed');
            }
        } catch (error) {
            console.error('API call error:', error);
            ws.send('authentication failed');
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});
