const db = require('../config/db');

const DhtModel = {

    getData: (callback) => {
        const query1 = `
            SELECT 
                MAX(suhun) AS suhumax, 
                MIN(suhun) AS suhumin, 
                AVG(suhun) AS suhurata
            FROM dht_readings;
        `;

        const query2 = `
            SELECT idx, suhun, humid, kecerahan, timestamps 
            FROM dht_readings 
            WHERE suhun = (SELECT MAX(suhun) FROM dht_readings) 
            AND humid = (SELECT MAX(humid) FROM dht_readings);
        `;

        const query3 = `
            SELECT DISTINCT DATE_FORMAT(timestamps, '%m-%Y') AS month_year 
            FROM dht_readings 
            ORDER BY month_year DESC;
        `;
    
        // Use the callback style for the db.execute method
        db.execute(query1, (err, result1) => {
            if (err) {
                console.error('Query execution error:', err);
                callback(err, null);
                return;
            }

            // Execute second query
            db.execute(query2, (err2, result2) => {
                if (err2) {
                    console.error('Query execution error:', err2);
                    callback(err2, null);
                    return;
                }

                // Execute third query
                db.execute(query3, (err3, result3) => {
                    if (err3) {
                        console.error('Query execution error:', err3);
                        callback(err3, null);
                        return;
                    }

                    // Handle results, set default values if null
                    const rows1 = result1 && result1.length > 0 ? result1 : [{ suhumax: 0, suhumin: 0, suhurata: 0 }];
                    const rows2 = result2 && result2.length > 0 ? result2 : [];
                    const rows3 = result3 && result3.length > 0 ? result3 : [];

                    callback(null, { 
                        suhumax: parseInt(rows1[0].suhumax) || 0,
                        suhumin: parseInt(rows1[0].suhumin) || 0,
                        suhurata: parseInt(rows1[0].suhurata) || 0,
                        nilai_suhu_max_humid_max: rows2,
                        month_year: rows3
                    });
                });
            });
        });
    },
};

module.exports = DhtModel;
