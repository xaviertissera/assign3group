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

// Function to hide the alert after a timeout
function hideAlertAfterTimeout(alertElement) {
    setTimeout(() => {
        alertElement.classList.add('d-none');  // Hide the alert after 3 seconds
    }, 3000);  // 3000 milliseconds = 3 seconds
}

// Handle form submission
document.getElementById('donation-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const fundraiserId = getFundraiserId();
    const giverName = document.getElementById('giver-name').value.trim();
    const donationAmount = parseFloat(document.getElementById('donation-amount').value);

    const errorAlert = document.getElementById('errorAlert');
    const errorMessageElement = document.getElementById('errorMessage');

    // Clear any previous errors
    errorMessageElement.textContent = '';
    errorAlert.classList.add('d-none');  // Hide alert initially

    let errorMessages = [];  // Array to collect all error messages

    // Validate form fields

    // 1. Check if the name is missing
    if (!giverName) {
        errorMessages.push('-Name is required.');
    }

    // 2. Check if the donation amount is missing or below the minimum value
    if (!donationAmount || isNaN(donationAmount)) {
        errorMessages.push('-Enter your donation amount.');
    } else if (donationAmount < 5) {
        errorMessages.push('-The minimum donation is 5 AUD.');
    }

    // If there are any error messages, show the alert with all messages
    if (errorMessages.length > 0) {
        errorMessageElement.innerHTML = errorMessages.join('<br>');  // Join all error messages with a line break
        errorAlert.classList.remove('d-none');  // Show the alert
        hideAlertAfterTimeout(errorAlert);  // Hide after timeout
        return;  // Stop form submission
    }

    // If validation passes, proceed with form submission
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
            const message = `Thank you for your donation to ${data.fundraiserCaption}`;
            document.getElementById('thankYouMessage').textContent = message;
            const thankYouAlert = document.getElementById('thankYouAlert');
            thankYouAlert.classList.remove('d-none');  // Show the success alert

            // Automatically redirect after 3 seconds
            setTimeout(() => {
                window.location.href = `/fundraiser.html?id=${fundraiserId}`;
            }, 3000);
        } else {
            errorMessageElement.textContent = data.message;
            errorAlert.classList.remove('d-none');  // Show the alert
            hideAlertAfterTimeout(errorAlert);  // Hide after timeout
        }
    })
    .catch(error => console.error('Error submitting donation:', error));
});

// Fetch the fundraiser details when the page loads
window.onload = fetchFundraiserDetails;
