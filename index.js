require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dhtRoutes = require('./routes/dhtRoutes');
const mqttController = require('./controllers/mqttController'); 
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(bodyParser.json());

app.use('/api', dhtRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
