// public/js/news.js
document.addEventListener('DOMContentLoaded', function() {
    // Check for action parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    // If action is 'add', open the add news modal
    if (action === 'add') {
        openAddNewsModal();
    }
    
    // Load news articles
    loadArticles();
    
    // Setup filters
    setupFilters();
    
    // Setup add news button
    const addNewsBtn = document.getElementById('add-news-btn');
    if (addNewsBtn) {
        addNewsBtn.addEventListener('click', openAddNewsModal);
    }
    
    // Setup news form
    const newsForm = document.getElementById('news-form');
    if (newsForm) {
        newsForm.addEventListener('submit', handleNewsFormSubmit);
    }
    
    // Setup cancel button
    const cancelNewsBtn = document.getElementById('cancel-news');
    if (cancelNewsBtn) {
        cancelNewsBtn.addEventListener('click', closeNewsModal);
    }
    
    // Setup modal close button
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeNewsModal);
    }
    
    /**
     * Load news articles from the API
     * @param {Object} filters - Optional filter parameters
     */
    function loadArticles(filters = {}) {
        // Construct API URL with filters
        let apiUrl = '/api/articles';
        const queryParams = [];
        
        // Add filters to query params
        if (filters.status && filters.status !== 'all') {
            queryParams.push(`status=${filters.status}`);
        }
        
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
            tableBody.innerHTML = '<tr><td colspan="6" class="loading">Loading articles...</td></tr>';
        }
        
        // Fetch articles from API
        fetch(apiUrl, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayArticles(data.data, data.pagination);
            } else {
                console.error('Failed to load articles:', data.message);
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="6" class="error">Failed to load articles</td></tr>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading articles:', error);
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" class="error">Error loading articles</td></tr>';
            }
        });
    }
    
    /**
     * Display articles in the table
     * @param {Array} articles - List of articles
     * @param {Object} pagination - Pagination information
     */
    function displayArticles(articles, pagination) {
        const tableBody = document.querySelector('.content-table tbody');
        if (!tableBody) return;
        
        // Clear table
        tableBody.innerHTML = '';
        
        if (articles.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="no-results">No articles found</td></tr>';
            return;
        }
        
        // Add articles to table
        articles.forEach(article => {
            const tr = document.createElement('tr');
            
            // Format date
            const date = new Date(article.createdAt);
            const formattedDate = `${date.toLocaleDateString()}`;
            
            // Create row
            tr.innerHTML = `
                <td class="title-cell">${article.title}</td>
                <td>${article.category}</td>
                <td>${article.author}</td>
                <td>${formattedDate}</td>
                <td><span class="status-badge ${article.status}">${article.status}</span></td>
                <td class="actions-cell">
                    <button class="btn-edit" data-id="${article._id}"><i class="icon-edit"></i></button>
                    <button class="btn-view" data-id="${article._id}"><i class="icon-view"></i></button>
                    <button class="btn-delete" data-id="${article._id}"><i class="icon-delete"></i></button>
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
     * Setup action buttons for each article
     */
    function setupActionButtons() {
        // Edit buttons
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const articleId = button.getAttribute('data-id');
                editArticle(articleId);
            });
        });
        
        // View buttons
        document.querySelectorAll('.btn-view').forEach(button => {
            button.addEventListener('click', function() {
                const articleId = button.getAttribute('data-id');
                viewArticle(articleId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const articleId = button.getAttribute('data-id');
                deleteArticle(articleId);
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
                loadArticles({ page: pagination.prev.page });
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
                        loadArticles({ page: i });
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
                loadArticles({ page: pagination.next.page });
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
        const filterStatus = document.getElementById('filter-status');
        const filterCategory = document.getElementById('filter-category');
        const searchContent = document.getElementById('search-content');
        const btnSearch = document.querySelector('.btn-search');
        
        // Status filter
        if (filterStatus) {
            filterStatus.addEventListener('change', applyFilters);
        }
        
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
     * Apply filters and reload articles
     */
    function applyFilters() {
        const filterStatus = document.getElementById('filter-status');
        const filterCategory = document.getElementById('filter-category');
        const searchContent = document.getElementById('search-content');
        
        const filters = {};
        
        if (filterStatus && filterStatus.value !== 'all') {
            filters.status = filterStatus.value;
        }
        
        if (filterCategory && filterCategory.value !== 'all') {
            filters.category = filterCategory.value;
        }
        
        if (searchContent && searchContent.value.trim() !== '') {
            filters.search = searchContent.value.trim();
        }
        
        // Reset to page 1 when applying filters
        filters.page = 1;
        
        loadArticles(filters);
    }
    
    /**
     * Open the add news modal
     */
    function openAddNewsModal() {
        const modal = document.getElementById('news-modal');
        if (!modal) return;
        
        // Reset form
        const newsForm = document.getElementById('news-form');
        if (newsForm) {
            newsForm.reset();
        }
        
        // Update modal title
        const modalTitle = modal.querySelector('.modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Add News Article';
        }
        
        // Set form mode to 'add'
        newsForm.setAttribute('data-mode', 'add');
        newsForm.removeAttribute('data-id');
        
        // Show modal
        modal.style.display = 'block';
    }
    
    /**
     * Close the news modal
     */
    function closeNewsModal() {
        const modal = document.getElementById('news-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Handle news form submission
     * @param {Event} event - Form submit event
     */
    function handleNewsFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const mode = form.getAttribute('data-mode') || 'add';
        const articleId = form.getAttribute('data-id');
        
        // Get form data
        const title = document.getElementById('news-title').value;
        const category = document.getElementById('news-category').value;
        const content = document.getElementById('news-content').value;
        const status = document.getElementById('news-status').value;
        
        // Validate form
        if (!title || !category || !content || !status) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Prepare article data
        const articleData = {
            title,
            category,
            content,
            status
        };
        
        // Determine API endpoint and method
        let apiUrl = '/api/articles';
        let method = 'POST';
        
        if (mode === 'edit' && articleId) {
            apiUrl = `/api/articles/${articleId}`;
            method = 'PUT';
        }
        
        // Send request to API
        fetch(apiUrl, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(articleData),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                closeNewsModal();
                
                // Show success message
                alert(`Article ${mode === 'add' ? 'created' : 'updated'} successfully`);
                
                // Reload articles
                loadArticles();
            } else {
                alert(`Failed to ${mode} article: ${data.message}`);
            }
        })
        .catch(error => {
            console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} article:`, error);
            alert(`Error ${mode === 'add' ? 'creating' : 'updating'} article`);
        });
    }
    
    /**
     * Edit an article
     * @param {string} articleId - Article ID
     */
    function editArticle(articleId) {
        // Fetch article details
        fetch(`/api/articles/${articleId}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const article = data.data;
                
                // Open modal and populate form
                const modal = document.getElementById('news-modal');
                if (!modal) return;
                
                // Update modal title
                const modalTitle = modal.querySelector('.modal-header h3');
                if (modalTitle) {
                    modalTitle.textContent = 'Edit News Article';
                }
                
                // Set form mode to 'edit'
                const newsForm = document.getElementById('news-form');
                if (newsForm) {
                    newsForm.setAttribute('data-mode', 'edit');
                    newsForm.setAttribute('data-id', articleId);
                    // Populate form fields
                    document.getElementById('news-title').value = article.title;
                    document.getElementById('news-category').value = article.category;
                    document.getElementById('news-content').value = article.content;
                    document.getElementById('news-status').value = article.status;
                }
                
                // Show modal
                modal.style.display = 'block';
            } else {
                alert('Failed to load article: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error loading article:', error);
            alert('Error loading article');
        });
    }
    
    /**
     * View an article
     * @param {string} articleId - Article ID
     */
    function viewArticle(articleId) {
        // Redirect to a detail page or open a view modal
        window.location.href = `news-detail.html?id=${articleId}`;
    }
    
    /**
     * Delete an article
     * @param {string} articleId - Article ID
     */
    function deleteArticle(articleId) {
        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }
        
        // Send delete request to API
        fetch(`/api/articles/${articleId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                alert('Article deleted successfully');
                
                // Reload articles
                loadArticles();
            } else {
                alert('Failed to delete article: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting article:', error);
            alert('Error deleting article');
        });
    }
});