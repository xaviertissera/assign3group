// Fetch categories and populate the selector
fetch('/api/concertsx/categories')
    .then(response => response.json())
    .then(categories => {
        const categorySelect = document.getElementById('category');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.CATEGORY_ID;
            option.textContent = category.NAME;
            categorySelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching categories:', error));

// Handle form submission
document.getElementById('addFundraiserForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const formData = {
        organizer: document.getElementById('organizer').value,
        caption: document.getElementById('caption').value,
        target_funding: document.getElementById('target_funding').value,
        current_funding: document.getElementById('current_funding').value,
        city: document.getElementById('city').value,
        active: document.getElementById('active').value,
        category_id: document.getElementById('category').value
    };
    
    fetch('/api/concertsx/add-fundraiser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message);
        // Optionally, redirect to another page or reset the form
    })
    .catch(error => console.error('Error adding fundraiser:', error));
});
