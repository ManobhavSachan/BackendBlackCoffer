const express = require('express');
const cors = require('cors');
const { startServer } = require('./src/routes/routes');

const app = express();
const port = process.env.PORT || 3000;

// Use cors middleware
app.use(cors());

// Start the server
startServer(app, port);
