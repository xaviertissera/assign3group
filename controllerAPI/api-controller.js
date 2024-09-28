// developing the controller API

var dbcon = require('../crowdfunding_db');
var connection = dbcon.getconnection();
connection.connect();

var express = require('express');
var router = express.Router();

// Retrieve all active fundraisers with category for the home page
router.get('/active-fundraisers', (req, res) => {
    
    const query = `
        SELECT f.FUNDRAISER_ID, f.ORGANIZER, f.CAPTION, f.TARGET_FUNDING, f.CURRENT_FUNDING, f.CITY, c.NAME as CATEGORY
        FROM fundraiser f
        JOIN category c ON f.CATEGORY_ID = c.CATEGORY_ID
        WHERE f.ACTIVE = 1;
    `;

    connection.query(query, (err, rows) => {
    
        if (err) {
            console.error("Error while performing query:", err);
            res.status(500).send("Error while performing query.");
        } else {
            res.send(rows);
        }
    });
});

// Retrieve all active fundraisers with category for the search page
router.get('/categories', (req, res) => {
    const query = 'SELECT CATEGORY_ID, NAME FROM category';
    
    connection.query(query, (err, rows) => {
        if (err) {
            console.error("Error while performing query:", err);
            res.status(500).send("Error while performing query.");
        } else {
            res.json(rows);
        }
    });
});

// Search fundraisers based on criteria
router.get('/search-fundraisers', (req, res) => {
    const { organizer, city, category } = req.query;
    let query = `
        SELECT f.FUNDRAISER_ID, f.ORGANIZER, f.CAPTION, f.CITY, c.NAME as CATEGORY
        FROM fundraiser f
        JOIN category c ON f.CATEGORY_ID = c.CATEGORY_ID
        WHERE f.ACTIVE = 1
    `;

    // Add filters based on selected criteria
    if (organizer) query += ` AND f.ORGANIZER LIKE '%${organizer}%'`;
    if (city) query += ` AND f.CITY LIKE '%${city}%'`;
    if (category) query += ` AND f.CATEGORY_ID = ${category}`;

    connection.query(query, (err, rows) => {
        if (err) {
            console.error("Error while performing query:", err);
            res.status(500).send("Error while performing query.");
        } else {
            res.json(rows);
        }
    });
});


// Retrieve fundraiser details by ID
router.get('/fundraiser', (req, res) => {
    const { id } = req.query;
    const query = `
        SELECT f.FUNDRAISER_ID, f.ORGANIZER, f.CAPTION, f.TARGET_FUNDING, f.CURRENT_FUNDING, f.CITY, c.NAME as CATEGORY
        FROM fundraiser f
        JOIN category c ON f.CATEGORY_ID = c.CATEGORY_ID
        WHERE f.FUNDRAISER_ID = ${id}
    `;

    connection.query(query, (err, rows) => {
        if (err) {
            console.error("Error while performing query:", err);
            res.status(500).send("Error while performing query.");
        } else {
            res.json(rows[0]); // Return only one result
        }
    });
});


module.exports = router;
