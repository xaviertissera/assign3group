// Add a new fundraiser
router.post('/fundraisers', (req, res) => {
    const { organizer, caption, target_funding, city, category_id } = req.body;

    const query = `INSERT INTO fundraiser (ORGANIZER, CAPTION, TARGET_FUNDING, CITY, CATEGORY_ID) 
                   VALUES (?, ?, ?, ?, ?)`;
    connection.query(query, [organizer, caption, target_funding, city, category_id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: 'Fundraiser added successfully!', fundraiserId: results.insertId });
        }
    });
});
// Update a fundraiser based on the ID
router.put('/fundraisers/:id', (req, res) => {
    const { id } = req.params;
    const { organizer, caption, target_funding, city, category_id } = req.body;

    const query = `UPDATE fundraiser 
                   SET ORGANIZER = ?, CAPTION = ?, TARGET_FUNDING = ?, CITY = ?, CATEGORY_ID = ?
                   WHERE FUNDRAISER_ID = ?`;
    connection.query(query, [organizer, caption, target_funding, city, category_id, id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Fundraiser not found' });
        } else {
            res.status(200).json({ message: 'Fundraiser updated successfully!' });
        }
    });
});
// Delete a fundraiser only if it has no donations
router.delete('/fundraisers/:id', (req, res) => {
    const { id } = req.params;

    // Check if the fundraiser has any donations
    const checkDonationsQuery = `SELECT COUNT(*) as donationCount FROM donation WHERE FUNDRAISER_ID = ?`;
    connection.query(checkDonationsQuery, [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results[0].donationCount > 0) {
            res.status(400).json({ message: 'Cannot delete fundraiser with donations' });
        } else {
            const deleteQuery = `DELETE FROM fundraiser WHERE FUNDRAISER_ID = ?`;
            connection.query(deleteQuery, [id], (err, results) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else if (results.affectedRows === 0) {
                    res.status(404).json({ message: 'Fundraiser not found' });
                } else {
                    res.status(200).json({ message: 'Fundraiser deleted successfully!' });
                }
            });
        }
    });
});
