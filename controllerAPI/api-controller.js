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

// Retrieve fundraiser details and donations by fundraiser ID
router.get('/fundraiser-details', (req, res) => {
    const { id } = req.query;
    
    // Query to get fundraiser details
    const fundraiserQuery = `
        SELECT f.FUNDRAISER_ID, f.ORGANIZER, f.CAPTION, f.TARGET_FUNDING, f.CURRENT_FUNDING, f.CITY, c.NAME as CATEGORY
        FROM fundraiser f
        JOIN category c ON f.CATEGORY_ID = c.CATEGORY_ID
        WHERE f.FUNDRAISER_ID = ${id};
    `;
    
    // Query to get donations for the fundraiser
    const donationQuery = `
        SELECT d.DONATION_ID, d.DATE, d.AMOUNT, d.GIVER
        FROM donation d
        WHERE d.FUNDRAISER_ID = ${id};
    `;

    // Execute the fundraiser query
    connection.query(fundraiserQuery, (err, fundraiserResult) => {
        if (err) {
            console.error("Error while performing query:", err);
            res.status(500).send("Error while performing query.");
        } else if (fundraiserResult.length === 0) {
            res.status(404).send("Fundraiser not found.");
        } else {
            // If fundraiser exists, query for donations
            connection.query(donationQuery, (donationErr, donationResult) => {
                if (donationErr) {
                    console.error("Error while retrieving donations:", donationErr);
                    res.status(500).send("Error while retrieving donations.");
                } else {
                    // Send both fundraiser details and donations in the response
                    res.json({
                        fundraiser: fundraiserResult[0],   // Fundraiser details
                        donations: donationResult          // List of donations (can be empty if no donations)
                    });
                }
            });
        }
    });
});

module.exports = router;
