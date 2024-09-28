// Import the Express framework for building the web server

const express = require('express');
const path = require('path'); // To handle file paths
const app = express();
// Import the API controller (concertAPI) from the 'controllerAPI/api-controller' file
const concertAPI = require('./controllerAPI/api-controller');

// Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files from the public folder
app.use(express.static('public'));

// All requests to '/api/concertsx' will be handled by the concertAPI module
app.use("/api/concertsx", concertAPI);

// Serve the homepage when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server on port 3061
const PORT = 3062;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});