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

// Insert a new donation for a fundraiser
router.post('/donation', (req, res) => {
    const { fundraiserId, giver, amount } = req.body;

    // Check if the donation is at least 5 AUD
    if (amount < 5) {
        return res.status(400).json({ message: "Minimum donation amount is 5 AUD" });
    }

    // First, get the fundraiser caption and current funding
    const getFundraiserQuery = `
        SELECT CAPTION, CURRENT_FUNDING FROM fundraiser WHERE FUNDRAISER_ID = ?;
    `;

    connection.query(getFundraiserQuery, [fundraiserId], (err, fundraiserResult) => {
        if (err) {
            console.error("Error while retrieving fundraiser:", err);
            return res.status(500).send("Error while retrieving fundraiser.");
        }

        if (fundraiserResult.length === 0) {
            return res.status(404).send("Fundraiser not found.");
        }

        const fundraiserCaption = fundraiserResult[0].CAPTION;
        const currentFunding = fundraiserResult[0].CURRENT_FUNDING;

        // Now, insert the donation
        const insertDonationQuery = `
            INSERT INTO donation (DATE, AMOUNT, GIVER, FUNDRAISER_ID)
            VALUES (NOW(), ?, ?, ?);
        `;

        connection.query(insertDonationQuery, [amount, giver, fundraiserId], (insertErr, result) => {
            if (insertErr) {
                console.error("Error while inserting donation:", insertErr);
                return res.status(500).send("Error while inserting donation.");
            }

            // Update the fundraiser's current funding
            const updateFundingQuery = `
                UPDATE fundraiser
                SET CURRENT_FUNDING = CURRENT_FUNDING + ?
                WHERE FUNDRAISER_ID = ?;
            `;

            connection.query(updateFundingQuery, [amount, fundraiserId], (updateErr) => {
                if (updateErr) {
                    console.error("Error while updating current funding:", updateErr);
                    return res.status(500).send("Error while updating current funding.");
                }

                // Send success message along with the fundraiser caption
                res.json({
                    message: "Donation successfully added",
                    fundraiserCaption: fundraiserCaption  // Send the caption in response
                });
            });
        });
    });
});


// Retrieve all fundraisers with id, caption, organizer, and active status
router.get('/fundraisers', (req, res) => {
    const query = `
        SELECT FUNDRAISER_ID, CAPTION, ORGANIZER, ACTIVE
        FROM fundraiser;
    `;

    connection.query(query, (err, rows) => {
        if (err) {
            console.error("Error while retrieving fundraisers:", err);
            res.status(500).send("Error while retrieving fundraisers.");
        } else {
            res.json(rows);  // Send the result as a JSON response
        }
    });
});
const express = require('express');
const router = express.Router();
const connection = require('./db'); // Assuming your MySQL connection is in a file called db.js

// API route to handle adding a new fundraiser
router.post('/add-fundraiser', (req, res) => {
    const { organizer, caption, target_funding, city, category_id, active } = req.body;

    // Validate if all required fields are provided
    if (!organizer || !caption || !target_funding || !city || !category_id) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields: organizer, caption, target funding, city, category, and active status.' });
    }

    // Validate if target_funding is a positive number
    if (target_funding <= 0) {
        return res.status(400).json({ success: false, message: 'Target funding must be a positive number.' });
    }

    // Active field should either be 1 (active) or 0 (inactive)
    if (typeof active === 'undefined' || (active !== 1 && active !== 0)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid active status (1 for active, 0 for inactive).' });
    }

    // SQL query to insert a new fundraiser
    const query = `
        INSERT INTO fundraiser (ORGANIZER, CAPTION, TARGET_FUNDING, CITY, CATEGORY_ID, ACTIVE, CURRENT_FUNDING)
        VALUES (?, ?, ?, ?, ?, ?, 0);
    `;

    // Execute the query
    connection.query(query, [organizer, caption, target_funding, city, category_id, active], (err, result) => {
        if (err) {
            console.error("Error while inserting fundraiser:", err);
            return res.status(500).json({ success: false, message: 'Database error. Failed to add fundraiser.' });
        }

        // Respond with success message, including the inserted fundraiser's ID
        return res.status(200).json({ success: true, message: 'Fundraiser added successfully!', fundraiser_id: result.insertId });
    });
});

// API route to fetch categories (for the dropdown)
router.get('/categories', (req, res) => {
    const query = 'SELECT CATEGORY_ID, NAME FROM category';

    // Execute the query to fetch categories
    connection.query(query, (err, rows) => {
        if (err) {
            console.error("Error while fetching categories:", err);
            return res.status(500).json({ success: false, message: 'Error while fetching categories.' });
        }

        // Respond with the list of categories as a JSON response
        return res.status(200).json({ success: true, categories: rows });
    });
});
// API route to handle updating an existing fundraiser
router.put('/api/update-fundraiser', (req, res) => {
    const { id, organizer, caption, target_funding, city, category_id, active } = req.body;

    // Validate that all fields are provided
    if (!id || !organizer || !caption || !target_funding || !city || !category_id || active === undefined) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // SQL query to update the existing fundraiser
    const query = `
        UPDATE fundraiser 
        SET ORGANIZER = ?, CAPTION = ?, TARGET_FUNDING = ?, CITY = ?, CATEGORY_ID = ?, ACTIVE = ?
        WHERE FUNDRAISER_ID = ?;
    `;

    // Execute the SQL query to update the fundraiser
    connection.query(query, [organizer, caption, target_funding, city, category_id, active, id], (err, result) => {
        if (err) {
            console.error('Error updating fundraiser:', err);
            return res.status(500).json({ success: false, message: 'Database error. Unable to update fundraiser.' });
        }

        if (result.affectedRows === 0) {
            // No rows were updated, meaning the ID didn't match any existing record
            return res.status(404).json({ success: false, message: 'Fundraiser not found.' });
        }

        // If successful, return a success message
        return res.status(200).json({ success: true, message: 'Fundraiser updated successfully!' });
    });
});
module.exports = router;
