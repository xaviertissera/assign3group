// Fetch and display all fundraisers
function fetchFundraisers() {
    fetch('/api/concertsx/fundraisers')
        .then(response => response.json())
        .then(fundraisers => {
            const fundraiserTable = document.getElementById('fundraiser-table-body');
            fundraiserTable.innerHTML = ''; // Clear the table before appending new items

            fundraisers.forEach(fundraiser => {
                const row = document.createElement('tr');

                // Create cells for each column
                row.innerHTML = `
                    <td>${fundraiser.FUNDRAISER_ID}</td>
                    <td>${fundraiser.CAPTION}</td>
                    <td>${fundraiser.ORGANIZER}</td>
                    <td>${fundraiser.ACTIVE ? 'Active' : 'Inactive'}</td>
                    <td><button class="btn btn-primary" onclick="redirectToEdit(${fundraiser.FUNDRAISER_ID})">Edit</button></td>
                `;

                fundraiserTable.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching fundraisers:', error));
}

// Redirect to the update page with the fundraiser ID
function redirectToEdit(fundraiserId) {
    window.location.href = `/admin/update.html?id=${fundraiserId}`;
}

// Call the fetch function when the page loads
window.onload = fetchFundraisers;
