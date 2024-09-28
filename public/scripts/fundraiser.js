// fundraiser.js

function getFundraiserId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Fetch and display fundraiser details
function fetchFundraiserDetails() {
    const fundraiserId = getFundraiserId();
    
    if (!fundraiserId) {
        document.getElementById('fundraiser-details').innerText = 'No fundraiser selected.';
        return;
    }

    fetch(`/api/concertsx/fundraiser?id=${fundraiserId}`)
        .then(response => response.json())
        .then(fundraiser => {
            const details = document.getElementById('fundraiser-details');

            details.innerHTML = `
                <p><strong>ID:</strong> ${fundraiser.FUNDRAISER_ID}</p>
                <p><strong>Organizer:</strong> ${fundraiser.ORGANIZER}</p>
                <p><strong>Caption:</strong> ${fundraiser.CAPTION}</p>
                <p><strong>Target Funding:</strong> $${fundraiser.TARGET_FUNDING}</p>
                <p><strong>Current Funding:</strong> $${fundraiser.CURRENT_FUNDING}</p>
                <p><strong>City:</strong> ${fundraiser.CITY}</p>
                <p><strong>Category:</strong> ${fundraiser.CATEGORY}</p>
            `;
        })
        .catch(error => console.error('Error fetching fundraiser details:', error));
}

// Handle donate button click
function donate() {
    alert('This feature is under construction');
}


// Fetch fundraiser details on page load
window.onload = fetchFundraiserDetails;
