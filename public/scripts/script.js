// Fetch and display active fundraisers
function fetchActiveFundraisers() {
    fetch('/api/concertsx/active-fundraisers')
        .then(response => response.json())
        .then(fundraisers => {
            const fundraiserList = document.getElementById('fundraiser-list');
            fundraiserList.innerHTML = ''; // Clear the list before appending new items

            fundraisers.forEach(fundraiser => {
                const fundraiserItem = document.createElement('div');
                fundraiserItem.classList.add('col-md-4', 'mb-4');

                // Creating a Bootstrap card for each fundraiser
                fundraiserItem.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${fundraiser.CAPTION}</h5>
                            <p class="card-text">Organizer: ${fundraiser.ORGANIZER}</p>
                            <p class="card-text">City: ${fundraiser.CITY}</p>
                            <p class="card-text">Category: ${fundraiser.CATEGORY}</p>
                            <p class="card-text"><strong>Status:</strong> Active</p>
                        </div>
                        <div class="card-footer text-center">
                            <small class="text-muted">Current: $${fundraiser.CURRENT_FUNDING} | Target: $${fundraiser.TARGET_FUNDING}</small>
                        </div>
                    </div>
                `;

                fundraiserList.appendChild(fundraiserItem);
            });
        })
        .catch(error => console.error('Error fetching fundraisers:', error));
}

// Call the fetch function when the page loads
window.onload = fetchActiveFundraisers;
