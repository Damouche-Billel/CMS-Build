// public/js/profile.js
document.addEventListener('DOMContentLoaded', function() {
    // Load user profile data
    loadUserProfile();
    
    // Setup profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Setup password form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordUpdate);
    }
    
    /**
     * Load user profile data from API
     */
    function loadUserProfile() {
        fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Populate profile form
                document.getElementById('profile-username').value = data.data.username;
                document.getElementById('profile-email').value = data.data.email;
                document.getElementById('profile-role').value = data.data.role;
            } else {
                console.error('Failed to load profile:', data.message);
                alert('Failed to load profile. Please try again later.');
            }
        })
        .catch(error => {
            console.error('Error loading profile:', error);
            alert('Error loading profile. Please try again later.');
        });
    }
    
    /**
     * Handle profile update form submission
     * @param {Event} event - Form submit event
     */
    function handleProfileUpdate(event) {
        event.preventDefault();
        
        // Get form data
        const username = document.getElementById('profile-username').value;
        const email = document.getElementById('profile-email').value;
        
        // Validate form
        if (!username || !email) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Send update request to API
        fetch('/api/auth/update-details', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Profile updated successfully');
                
                // Update display name in header
                const usernameDisplay = document.getElementById('username-display');
                if (usernameDisplay) {
                    usernameDisplay.textContent = data.data.username;
                }
                
                // Update local storage if available
                const userData = localStorage.getItem('fennec_user');
                if (userData) {
                    const user = JSON.parse(userData);
                    user.username = data.data.username;
                    user.email = data.data.email;
                    localStorage.setItem('fennec_user', JSON.stringify(user));
                }
            } else {
                alert('Failed to update profile: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again later.');
        });
    }
    
    /**
     * Handle password update form submission
     * @param {Event} event - Form submit event
     */
    function handlePasswordUpdate(event) {
        event.preventDefault();
        
        // Get form data
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate form
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        // Send update request to API
        fetch('/api/auth/update-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                currentPassword,
                newPassword
            }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Password updated successfully');
                
                // Reset form
                document.getElementById('password-form').reset();
            } else {
                alert('Failed to update password: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating password:', error);
            alert('Error updating password. Please try again later.');
        });
    }
});