// Fetch categories
function fetchCategories() {
    fetch('/api/concertsx/categories')
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById('category');
            categorySelect.innerHTML = '<option value="">Select Category</option>'; // Default option

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.CATEGORY_ID;
                option.text = category.NAME;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
}


function searchFundraisers() {
    const organizer = document.getElementById('organizer').value.trim();
    const city = document.getElementById('city').value.trim();
    const category = document.getElementById('category').value;

    const errorMessage = document.getElementById('error-message');
    const searchResults = document.getElementById('search-results');

    // Clear previous messages and results
    errorMessage.innerHTML = '';
    searchResults.innerHTML = '';

    // Validate if at least one search criterion is provided
    if (!organizer && !city && !category) {
        alert('Please select at least one search criterion.');
        return;
    }

    // Show loading state
    searchResults.innerHTML = '<p class="text-center">Searching...</p>';

    fetch(`/api/concertsx/search-fundraisers?organizer=${organizer}&city=${city}&category=${category}`)
        .then(response => response.json())
        .then(fundraisers => {
            searchResults.innerHTML = ''; // Clear loading message

            if (fundraisers.length === 0) {
                errorMessage.innerHTML = '<p class="text-center text-danger fw-bold">No fundraisers found.</p>';
                return;
            }

            fundraisers.forEach(fundraiser => {
                const fundraiserItem = document.createElement('div');
                fundraiserItem.classList.add('col-md-4', 'mb-4'); // Bootstrap classes for 3 cards per row

                // Creating a Bootstrap card for each fundraiser and wrapping it in a link
                fundraiserItem.innerHTML = `
                    <a href="fundraiser.html?id=${fundraiser.FUNDRAISER_ID}" class="text-decoration-none">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${fundraiser.CAPTION}</h5>
                                <p class="card-text">Organizer: ${fundraiser.ORGANIZER}</p>
                                <p class="card-text">City: ${fundraiser.CITY}</p>
                                <p class="card-text">Category: ${fundraiser.CATEGORY}</p>
                                <p class="card-text"><strong>Status:</strong> Active</p>
                            </div>
                            <div class="card-footer text-center">
                                <small class="text-muted"><b>Click here to make a Donation</b></small>
                            </div>
                        </div>
                    </a>
                `;

                searchResults.appendChild(fundraiserItem);
            });
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
            searchResults.innerHTML = '<p class="text-center text-danger">Error loading results. Please try again.</p>';
        });
}


// Clear the form inputs
function clearCheckboxes() {
    document.getElementById('search-form').reset();
}

// Fetch categories on page load
window.onload = fetchCategories;
