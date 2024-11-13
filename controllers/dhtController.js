const DhtModel = require('../models/dhtModel');


// Mendapatkan semua data DHT
exports.getData = (req, res) => {
    DhtModel.getData((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
        res.json(results);
    });
};

