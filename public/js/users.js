// public/js/users.js
document.addEventListener('DOMContentLoaded', function() {
    // Load users
    loadUsers();
    
    // Setup add user button
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', openAddUserModal);
    }
    
    // Setup user form
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }
    
    // Setup cancel button
    const cancelUserBtn = document.getElementById('cancel-user');
    if (cancelUserBtn) {
        cancelUserBtn.addEventListener('click', closeUserModal);
    }
    
    // Setup modal close button
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeUserModal);
    }
    
    /**
     * Load users from the API
     */
    function loadUsers() {
        // Show loading state
        const tableBody = document.querySelector('.content-table tbody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading">Loading users...</td></tr>';
        }
        
        // Fetch users from API
        fetch('/api/auth/users', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayUsers(data.data);
            } else {
                console.error('Failed to load users:', data.message);
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="6" class="error">Failed to load users</td></tr>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading users:', error);
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" class="error">Error loading users</td></tr>';
            }
        });
    }
    
    /**
     * Display users in the table
     * @param {Array} users - List of users
     */
    function displayUsers(users) {
        const tableBody = document.querySelector('.content-table tbody');
        if (!tableBody) return;
        
        // Clear table
        tableBody.innerHTML = '';
        
        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="no-results">No users found</td></tr>';
            return;
        }
        
        // Add users to table
        users.forEach(user => {
            const tr = document.createElement('tr');
            
            // Format date
            const date = new Date(user.dateCreated);
            const formattedDate = date.toLocaleDateString();
            
            // Create row
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><span class="status-badge ${user.isVerified ? 'published' : 'draft'}">${user.isVerified ? 'Verified' : 'Unverified'}</span></td>
                <td>${formattedDate}</td>
                <td class="actions-cell">
                    <button class="btn-edit" data-id="${user._id}"><i class="icon-edit"></i></button>
                    <button class="btn-delete" data-id="${user._id}"><i class="icon-delete"></i></button>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
        
        // Add event listeners to action buttons
        setupActionButtons();
    }
    
    /**
     * Setup action buttons for each user
     */
    function setupActionButtons() {
        // Edit buttons
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const userId = button.getAttribute('data-id');
                editUser(userId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const userId = button.getAttribute('data-id');
                deleteUser(userId);
            });
        });
    }
    
    /**
     * Open the add user modal
     */
    function openAddUserModal() {
        const modal = document.getElementById('user-modal');
        if (!modal) return;
        
        // Reset form
        const userForm = document.getElementById('user-form');
        if (userForm) {
            userForm.reset();
        }
        
        // Update modal title
        const modalTitle = modal.querySelector('.modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Add User';
        }
        
        // Set form mode to 'add'
        userForm.setAttribute('data-mode', 'add');
        userForm.removeAttribute('data-id');
        
        // Show password field as required
        const passwordField = document.getElementById('user-password');
        if (passwordField) {
            passwordField.required = true;
        }
        
        // Show modal
        modal.style.display = 'block';
    }
    
    /**
     * Close the user modal
     */
    function closeUserModal() {
        const modal = document.getElementById('user-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Handle user form submission
     * @param {Event} event - Form submit event
     */
    function handleUserFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const mode = form.getAttribute('data-mode') || 'add';
        const userId = form.getAttribute('data-id');
        
        // Get form data
        const username = document.getElementById('user-username').value;
        const email = document.getElementById('user-email').value;
        const password = document.getElementById('user-password').value;
        const role = document.getElementById('user-role').value;
        
        // Validate form
        if (!username || !email || !role) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (mode === 'add' && !password) {
            alert('Password is required for new users');
            return;
        }
        
        // Prepare user data
        const userData = {
            username,
            email,
            role
        };
        
        // Add password if provided
        if (password) {
            userData.password = password;
        }
        
        // Determine API endpoint and method
        let apiUrl = '/api/auth/register';
        let method = 'POST';
        
        if (mode === 'edit' && userId) {
            apiUrl = `/api/auth/users/${userId}`;
            method = 'PUT';
        }
        
        // Send request to API
        fetch(apiUrl, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                closeUserModal();
                
                // Show success message
                alert(`User ${mode === 'add' ? 'created' : 'updated'} successfully`);
                
                // Reload users
                loadUsers();
            } else {
                alert(`Failed to ${mode} user: ${data.message}`);
            }
        })
        .catch(error => {
            console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} user:`, error);
            alert(`Error ${mode === 'add' ? 'creating' : 'updating'} user`);
        });
    }
    
    /**
     * Edit a user
     * @param {string} userId - User ID
     */
    function editUser(userId) {
        // Fetch user details
        fetch(`/api/auth/users/${userId}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.data;
                // Open modal and populate form
                const modal = document.getElementById('user-modal');
                if (!modal) return;
                
                // Update modal title
                const modalTitle = modal.querySelector('.modal-header h3');
                if (modalTitle) {
                    modalTitle.textContent = 'Edit User';
                }
                
                // Set form mode to 'edit'
                const userForm = document.getElementById('user-form');
                if (userForm) {
                    userForm.setAttribute('data-mode', 'edit');
                    userForm.setAttribute('data-id', userId);
                    
                    // Populate form fields
                    document.getElementById('user-username').value = user.username;
                    document.getElementById('user-email').value = user.email;
                    document.getElementById('user-role').value = user.role;
                    
                    // Password field is not required for editing
                    const passwordField = document.getElementById('user-password');
                    if (passwordField) {
                        passwordField.required = false;
                        passwordField.value = '';
                    }
                }
                
                // Show modal
                modal.style.display = 'block';
            } else {
                alert('Failed to load user: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error loading user:', error);
            alert('Error loading user');
        });
    }
    
    /**
     * Delete a user
     * @param {string} userId - User ID
     */
    function deleteUser(userId) {
        // First, get the username to confirm deletion
        fetch(`/api/auth/users/${userId}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.data;
                
                // Confirm deletion
                if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
                    return;
                }
                
                // Send delete request to API
                fetch(`/api/auth/users/${userId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Show success message
                        alert('User deleted successfully');
                        
                        // Reload users
                        loadUsers();
                    } else {
                        alert('Failed to delete user: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                    alert('Error deleting user');
                });
            } else {
                alert('Failed to load user: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error loading user:', error);
            alert('Error loading user');
        });
    }
});
                
                