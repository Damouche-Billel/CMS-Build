// public/js/merchandise.js
document.addEventListener('DOMContentLoaded', function() {
    // Check for action parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    // If action is 'add', open the add merchandise modal
    if (action === 'add') {
        openAddMerchandiseModal();
    }
    
    // Load merchandise items
    loadMerchandise();
    
    // Setup filters
    setupFilters();
    
    // Setup add merchandise button
    const addMerchandiseBtn = document.getElementById('add-merchandise-btn');
    if (addMerchandiseBtn) {
        addMerchandiseBtn.addEventListener('click', openAddMerchandiseModal);
    }
    
    // Setup merchandise form
    const merchandiseForm = document.getElementById('merchandise-form');
    if (merchandiseForm) {
        merchandiseForm.addEventListener('submit', handleMerchandiseFormSubmit);
    }
    
    // Setup cancel button
    const cancelMerchandiseBtn = document.getElementById('cancel-merchandise');
    if (cancelMerchandiseBtn) {
        cancelMerchandiseBtn.addEventListener('click', closeMerchandiseModal);
    }
    
    // Setup modal close button
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeMerchandiseModal);
    }
    
    // Add click handlers for view buttons
    document.querySelectorAll('.btn-view').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const merchandiseId = button.getAttribute('data-id');
            handleViewMerchandise(merchandiseId);
        });
    });
    
    // Handle modal close
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            document.getElementById('merchandise-modal').style.display = 'none';
            // Reset form to editable state
            const form = document.getElementById('merchandise-form');
            form.querySelectorAll('input, select, textarea').forEach(input => {
                input.removeAttribute('readonly');
                input.style.backgroundColor = '';
            });
            form.querySelector('button[type="submit"]').style.display = '';
        });
    });
    
    // Attach event listeners to view buttons
    document.body.addEventListener('click', function(e) {
        if (e.target.closest('.btn-view')) {
            e.preventDefault();
            const id = e.target.closest('.btn-view').getAttribute('data-id');
            handleViewMerchandise(id);
        }
    });

    /**
     * Load merchandise items from the API
     * @param {Object} filters - Optional filter parameters
     */
    function loadMerchandise(filters = {}) {
        // Construct API URL with filters
        let apiUrl = '/api/merchandise';
        const queryParams = [];
        
        // Add filters to query params
        if (filters.category && filters.category !== 'all') {
            queryParams.push(`category=${filters.category}`);
        }
        
        if (filters.search) {
            queryParams.push(`search=${encodeURIComponent(filters.search)}`);
        }
        
        // Add pagination
        if (filters.page) {
            queryParams.push(`page=${filters.page}`);
        }
        
        // Add limit
        queryParams.push('limit=10');
        
        // Append query params to URL
        if (queryParams.length > 0) {
            apiUrl += '?' + queryParams.join('&');
        }
        
        // Show loading state
        const tableBody = document.querySelector('.content-table tbody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading">Loading merchandise...</td></tr>';
        }
        
        // Fetch merchandise from API
        fetch(apiUrl, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayMerchandise(data.data, data.pagination);
            } else {
                console.error('Failed to load merchandise:', data.message);
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="6" class="error">Failed to load merchandise</td></tr>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading merchandise:', error);
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" class="error">Error loading merchandise</td></tr>';
            }
        });
    }
    
    /**
     * Display merchandise items in the table
     * @param {Array} items - List of merchandise items
     * @param {Object} pagination - Pagination information
     */
    function displayMerchandise(items, pagination) {
        const tableBody = document.querySelector('.content-table tbody');
        if (!tableBody) return;
        
        // Clear table
        tableBody.innerHTML = '';
        
        if (items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="no-results">No merchandise found</td></tr>';
            return;
        }
        
        // Add items to table
        items.forEach(item => {
            const tr = document.createElement('tr');
            
            // Format price
            const formattedPrice = `£${item.price.toFixed(2)}`;
            
            // Create row
            tr.innerHTML = `
                <td class="title-cell">${item.name}</td>
                <td>${item.category}</td>
                <td>${formattedPrice}</td>
                <td>${item.stock}</td>
                <td>${item.featured ? '<span class="featured-badge">Featured</span>' : ''}</td>
                <td class="actions-cell">
                    <button class="btn-edit" data-id="${item._id}"><i class="icon-edit"></i></button>
                    <button class="btn-view" data-id="${item._id}"><i class="icon-view"></i></button>
                    <button class="btn-delete" data-id="${item._id}"><i class="icon-delete"></i></button>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
        
        // Add event listeners to action buttons
        setupActionButtons();
        
        // Setup pagination
        setupPagination(pagination);
    }
    
    /**
     * Setup action buttons for each merchandise item
     */
    function setupActionButtons() {
        // Edit buttons
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = button.getAttribute('data-id');
                editMerchandiseItem(itemId);
            });
        });
        
        // View buttons
        document.querySelectorAll('.btn-view').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const itemId = button.getAttribute('data-id');
                handleViewMerchandise(itemId); // <-- This opens the modal
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = button.getAttribute('data-id');
                deleteMerchandiseItem(itemId);
            });
        });
    }
    
    /**
     * Setup pagination controls
     * @param {Object} pagination - Pagination information
     */
    function setupPagination(pagination) {
        const paginationElement = document.querySelector('.pagination');
        if (!paginationElement) return;
        
        // Clear pagination element
        paginationElement.innerHTML = '';
        
        // Add previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'btn-page';
        prevButton.innerHTML = '&laquo;';
        
        if (pagination && pagination.prev) {
            prevButton.addEventListener('click', function() {
                loadMerchandise({ page: pagination.prev.page });
            });
        } else {
            prevButton.disabled = true;
            prevButton.classList.add('disabled');
        }
        
        paginationElement.appendChild(prevButton);
        
        // Add page numbers (simplified for now)
        if (pagination) {
            const currentPage = pagination.next ? pagination.next.page - 1 : pagination.prev ? pagination.prev.page + 1 : 1;
            
            // Calculate total pages (roughly)
            const totalPages = Math.max(currentPage, pagination && pagination.next ? pagination.next.page : 1);
            
            // Show at most 5 pages
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, startPage + 4);
            
            for (let i = startPage; i <= endPage; i++) {
                const pageButton = document.createElement('button');
                pageButton.className = 'btn-page';
                pageButton.textContent = i;
                
                if (i === currentPage) {
                    pageButton.classList.add('active');
                } else {
                    pageButton.addEventListener('click', function() {
                        loadMerchandise({ page: i });
                    });
                }
                
                paginationElement.appendChild(pageButton);
            }
        } else {
            // If no pagination info, just show page 1 as active
            const pageButton = document.createElement('button');
            pageButton.className = 'btn-page active';
            pageButton.textContent = '1';
            paginationElement.appendChild(pageButton);
        }
        
        // Add next button
        const nextButton = document.createElement('button');
        nextButton.className = 'btn-page';
        nextButton.innerHTML = '&raquo;';
        
        if (pagination && pagination.next) {
            nextButton.addEventListener('click', function() {
                loadMerchandise({ page: pagination.next.page });
            });
        } else {
            nextButton.disabled = true;
            nextButton.classList.add('disabled');
        }
        
        paginationElement.appendChild(nextButton);
    }
    
    /**
     * Setup filter controls
     */
    function setupFilters() {
        const filterCategory = document.getElementById('filter-category');
        const searchContent = document.getElementById('search-content');
        const btnSearch = document.querySelector('.btn-search');
        
        // Category filter
        if (filterCategory) {
            filterCategory.addEventListener('change', applyFilters);
        }
        
        // Search button
        if (btnSearch) {
            btnSearch.addEventListener('click', applyFilters);
        }
        
        // Search input (on enter key)
        if (searchContent) {
            searchContent.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    applyFilters();
                }
            });
        }
    }
    
    /**
     * Apply filters and reload merchandise
     */
    function applyFilters() {
        const filterCategory = document.getElementById('filter-category');
        const searchContent = document.getElementById('search-content');
        
        const filters = {};
        
        if (filterCategory && filterCategory.value !== 'all') {
            filters.category = filterCategory.value;
        }
        
        if (searchContent && searchContent.value.trim() !== '') {
            filters.search = searchContent.value.trim();
        }
        
        // Reset to page 1 when applying filters
        filters.page = 1;
        
        loadMerchandise(filters);
    }
    
    /**
     * Open the add merchandise modal
     */
    function openAddMerchandiseModal() {
        const modal = document.getElementById('merchandise-modal');
        if (!modal) return;
        
        // Reset form
        const merchandiseForm = document.getElementById('merchandise-form');
        if (merchandiseForm) {
            merchandiseForm.reset();
        }
        
        // Update modal title
        const modalTitle = modal.querySelector('.modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Add Merchandise Item';
        }
        
        // Set form mode to 'add'
        merchandiseForm.setAttribute('data-mode', 'add');
        merchandiseForm.removeAttribute('data-id');
        
        // Show modal
        modal.style.display = 'block';
    }
    
    /**
     * Close the merchandise modal
     */
    function closeMerchandiseModal() {
        const modal = document.getElementById('merchandise-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Handle merchandise form submission
     * @param {Event} event - Form submit event
     */
    function handleMerchandiseFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const mode = form.getAttribute('data-mode') || 'add';
        const itemId = form.getAttribute('data-id');
        
        // Get form data
        const name = document.getElementById('merchandise-name').value;
        const category = document.getElementById('merchandise-category').value;
        const price = parseFloat(document.getElementById('merchandise-price').value);
        const stock = parseInt(document.getElementById('merchandise-stock').value);
        const description = document.getElementById('merchandise-description').value;
        const featured = document.getElementById('merchandise-featured').checked;
        
        // Validate form
        if (!name || !category || isNaN(price) || isNaN(stock) || !description) {
            alert('Please fill in all required fields with valid values');
            return;
        }
        
        // Prepare merchandise data
        const merchandiseData = {
            name,
            category,
            price,
            stock,
            description,
            featured
        };
        
        // Handle image file (if present)
        const imageFile = document.getElementById('merchandise-image').files[0];
        if (imageFile && mode === 'add') {
            // For new items, the image will be handled separately after the item is created
            merchandiseData.imageUrl = '/uploads/merchandise/default.jpg'; // Default image
        }
        
        // Determine API endpoint and method
        let apiUrl = '/api/merchandise';
        let method = 'POST';
        
        if (mode === 'edit' && itemId) {
            apiUrl = `/api/merchandise/${itemId}`;
            method = 'PUT';
        }
        
        // Send request to API
        fetch(apiUrl, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(merchandiseData),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Handle image upload if there is a file
                if (imageFile) {
                    const formData = new FormData();
                    formData.append('image', imageFile);
                    
                    // Get the item ID (either from response for new items or from the form for edits)
                    const uploadItemId = mode === 'add' ? data.data._id : itemId;
                    
                    // Upload the image
                    fetch(`/api/merchandise/${uploadItemId}/image`, {
                        method: 'PUT',
                        body: formData,
                        credentials: 'include'
                    })
                    .then(res => res.json())
                    .then(imgData => {
                        if (!imgData.success) {
                            console.error('Image upload failed:', imgData.message);
                            alert('Item saved but image upload failed');
                        }
                        
                        closeMerchandiseModal();
                        loadMerchandise();
                    })
                    .catch(imgError => {
                        console.error('Image upload error:', imgError);
                        alert('Item saved but image upload failed');
                        closeMerchandiseModal();
                        loadMerchandise();
                    });
                } else {
                    closeMerchandiseModal();
                    
                    // Show success message
                    alert(`Merchandise item ${mode === 'add' ? 'created' : 'updated'} successfully`);
                    
                    // Reload merchandise
                    loadMerchandise();
                }
            } else {
                alert(`Failed to ${mode} merchandise item: ${data.message}`);
            }
        })
        .catch(error => {
            console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} merchandise item:`, error);
            alert(`Error ${mode === 'add' ? 'creating' : 'updating'} merchandise item`);
        });
    }
    
    /**
     * Edit a merchandise item
     * @param {string} itemId - Merchandise item ID
     */
    function editMerchandiseItem(itemId) {
        fetch(`/api/merchandise/${itemId}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const item = data.data;
                const modal = document.getElementById('merchandise-modal');
                const form = document.getElementById('merchandise-form');
                
                // Update modal title
                const modalTitle = modal.querySelector('.modal-header h3');
                modalTitle.textContent = 'Edit Merchandise Item';
                
                // Set form mode and ID
                form.setAttribute('data-mode', 'edit');
                form.setAttribute('data-id', itemId);
                
                // Make fields editable
                form.querySelectorAll('input, select, textarea').forEach(input => {
                    input.removeAttribute('readonly');
                    input.style.backgroundColor = '';
                });
                
                // Restore form actions
                const formActions = form.querySelector('.form-actions');
                formActions.innerHTML = `
                    <button type="button" class="btn-secondary" id="cancel-merchandise">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                `;
                
                // Add cancel button handler
                document.getElementById('cancel-merchandise').addEventListener('click', closeMerchandiseModal);
                
                // Show modal
                modal.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error loading merchandise item:', error);
            alert('Error loading merchandise item');
        });
    }
    
    /**
     * View a merchandise item
     * @param {string} itemId - Merchandise item ID
     */
    
    /**
     * Delete a merchandise item
     * @param {string} itemId - Merchandise item ID
     */
    function deleteMerchandiseItem(itemId) {
        if (!confirm('Are you sure you want to delete this merchandise item?')) {
            return;
        }
        
        // Send delete request to API
        fetch(`/api/merchandise/${itemId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                alert('Merchandise item deleted successfully');
                
                // Reload merchandise
                loadMerchandise();
            } else {
                alert('Failed to delete merchandise item: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting merchandise item:', error);
            alert('Error deleting merchandise item');
        });
    }
    
    /**
     * Handle view merchandise
     * @param {string} id - Merchandise item ID
     */
    function handleViewMerchandise(id) {
        event.preventDefault();
        
        fetch(`/api/merchandise/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const merchandise = data.data;
                    const modal = document.getElementById('merchandise-modal');
                    const form = document.getElementById('merchandise-form');
                    
                    // Update modal title
                    const modalTitle = modal.querySelector('.modal-header h3');
                    modalTitle.textContent = 'View Merchandise';
                    
                    // Set form mode
                    form.setAttribute('data-mode', 'view');
                    form.setAttribute('data-id', id);
                    
                    // Populate form fields
                    document.getElementById('merchandise-name').value = merchandise.name;
                    document.getElementById('merchandise-category').value = merchandise.category;
                    document.getElementById('merchandise-price').value = merchandise.price;
                    document.getElementById('merchandise-stock').value = merchandise.stock;
                    document.getElementById('merchandise-description').value = merchandise.description;
                    document.getElementById('merchandise-featured').checked = merchandise.featured;
                    
                    // Show current image if available
                    const currentImageContainer = document.getElementById('current-image-container');
                    if (currentImageContainer && merchandise.imageUrl) {
                        currentImageContainer.innerHTML = `
                            <p>Current Image:</p>
                            <img src="${merchandise.imageUrl}" alt="${merchandise.name}" style="max-width:100px; max-height:100px;">
                        `;
                        currentImageContainer.style.display = 'block';
                    }
                    
                    // Add Edit button
                    const formActions = form.querySelector('.form-actions');
                    formActions.innerHTML = `
                        <button type="button" class="btn-secondary" id="cancel-merchandise">Close</button>
                        <button type="button" class="btn-primary" id="edit-merchandise">Edit</button>
                    `;
                    
                    // Add edit button handler
                    document.getElementById('edit-merchandise').addEventListener('click', () => {
                        editMerchandiseItem(id);
                    });
                    
                    // Add close button handler
                    document.getElementById('cancel-merchandise').addEventListener('click', closeMerchandiseModal);
                    
                    // Make fields readonly
                    form.querySelectorAll('input, select, textarea').forEach(input => {
                        input.setAttribute('readonly', true);
                        input.style.backgroundColor = '#333';
                    });
                    
                    // Show modal
                    modal.style.display = 'block';
                }
            })
            .catch(error => console.error('Error:', error));
    }
});

// filepath: c:\Users\bille\OneDrive\Desktop\FENNEC-FC-SMS - Copy\models\Merchandise.js
const mongoose = require('mongoose');

const MerchandiseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    description: { type: String, required: true },
    featured: { type: Boolean, default: false },
    imageUrl: { type: String, default: '' }
});

module.exports = mongoose.model('Merchandise', MerchandiseSchema);