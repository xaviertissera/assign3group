function getFundraiserId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Fetch and display fundraiser details and donations
function fetchFundraiserDetailsAndDonations() {
    const fundraiserId = getFundraiserId();
    
    if (!fundraiserId) {
        document.getElementById('fundraiser-details').innerText = 'No fundraiser selected.';
        return;
    }

    fetch(`/api/concertsx/fundraiser-details?id=${fundraiserId}`)
        .then(response => response.json())
        .then(data => {
            const details = document.getElementById('fundraiser-details');
            
            // Display fundraiser details
            details.innerHTML = `
                <p><strong>ID:</strong> ${data.fundraiser.FUNDRAISER_ID}</p>
                <p><strong>Organizer:</strong> ${data.fundraiser.ORGANIZER}</p>
                <p><strong>Caption:</strong> ${data.fundraiser.CAPTION}</p>
                <p><strong>Target Funding:</strong> $${data.fundraiser.TARGET_FUNDING}</p>
                <p><strong>Current Funding:</strong> $${data.fundraiser.CURRENT_FUNDING}</p>
                <p><strong>City:</strong> ${data.fundraiser.CITY}</p>
                <p><strong>Category:</strong> ${data.fundraiser.CATEGORY}</p>
                <hr>
            `;

            // Display donations or no donations message
            if (data.donations.length === 0) {
                details.innerHTML += `<p><strong><u>Donations:</u></strong> No donations received yet.</p>`;
            } else {
                details.innerHTML += `<p><strong><u>Donations:</u></strong></p>`;
                data.donations.forEach(donation => {
                    // Format the date to remove the time
                    const formattedDate = new Date(donation.DATE).toISOString().slice(0, 10);
                    
                    details.innerHTML += `
                        <p>Donation by ${donation.GIVER} on ${formattedDate}: $${donation.AMOUNT}</p>
                    `;
                });
            }
        })
        .catch(error => console.error('Error fetching fundraiser details and donations:', error));
}


//donate button click
function donate() {
    const fundraiserId = getFundraiserId();
    
    // Redirect to the donation page
    window.location.href = `/donation.html?id=${fundraiserId}`;
}

window.onload = fetchFundraiserDetailsAndDonations;
