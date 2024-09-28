// Get the fundraiser ID from the query string
function getFundraiserId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Fetch fundraiser details and populate the form
function fetchFundraiserDetails() {
    const fundraiserId = getFundraiserId();

    fetch(`/api/concertsx/fundraiser?id=${fundraiserId}`)
        .then(response => response.json())
        .then(fundraiser => {
            document.getElementById('fundraiser-name').textContent = fundraiser.CAPTION;
        })
        .catch(error => console.error('Error fetching fundraiser details:', error));
}

// Handle form submission
document.getElementById('donation-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const fundraiserId = getFundraiserId();
    const giverName = document.getElementById('giver-name').value;
    const donationAmount = parseFloat(document.getElementById('donation-amount').value);

    if (donationAmount < 5) {
        alert('The minimum donation is 5 AUD');
        return;
    }

    const donationData = {
        fundraiserId,
        giver: giverName,
        amount: donationAmount
    };

    // Send the donation to the server via POST
    fetch('/api/concertsx/donation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(donationData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Donation successfully added") {
            // Use the fundraiser's caption in the thank-you message
            alert(`Thank you for your donation to ${data.fundraiserCaption}`);
            window.location.href = `/fundraiser.html?id=${fundraiserId}`;
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error submitting donation:', error));
});


// Fetch the fundraiser details when the page loads
window.onload = fetchFundraiserDetails;
