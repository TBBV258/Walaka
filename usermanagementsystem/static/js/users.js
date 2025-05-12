/**
 * User Management System
 * 
 * This script handles the user management functionality including:
 * - Listing, creating, editing, and deactivating users
 * - Role-based permissions management
 * - Search and filter capabilities
 * - Form validation and user feedback
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const usersTableBody = document.getElementById('usersTableBody');
    const userSearchInput = document.getElementById('userSearchInput');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const createUserBtn = document.getElementById('createUserBtn');
    const userModal = document.getElementById('userModal');
    const userModalOverlay = document.getElementById('userModalOverlay');
    const closeUserModal = document.getElementById('closeUserModal');
    const userForm = document.getElementById('userForm');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalOverlay = document.getElementById('confirmModalOverlay');
    const closeConfirmModal = document.getElementById('closeConfirmModal');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    const modalTitle = document.getElementById('modalTitle');
    const userRole = document.getElementById('userRole');
    const roleDescription = document.getElementById('roleDescription');
    const isActive = document.getElementById('isActive');
    const statusText = document.getElementById('statusText');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.getElementById('strengthMeter');
    const strengthText = document.getElementById('strengthText');
    
    // Pagination elements
    const startRecord = document.getElementById('startRecord');
    const endRecord = document.getElementById('endRecord');
    const totalRecords = document.getElementById('totalRecords');
    const paginationControls = document.getElementById('paginationControls');
    
    // Metrics elements
    const totalUsersValue = document.getElementById('totalUsersValue');
    const activeUsersValue = document.getElementById('activeUsersValue');
    const superusersValue = document.getElementById('superusersValue');
    const adminUsersValue = document.getElementById('adminUsersValue');
    
    // State variables
    let users = [];
    let filteredUsers = [];
    let currentPage = 1;
    let recordsPerPage = 10;
    let currentAction = null;
    let currentUser = null;
    
    // Role descriptions
    const roleDescriptions = {
        superuser: 'Full access to all system features including user management, deleting records, and system configuration.',
        admin: 'Can create invoices, clients, and products. Can edit existing records but cannot delete anything or manage users.',
        basic: 'Limited to creating and managing invoices only. Can set invoice status as paid or pending.'
    };
    
    // Initialize the page
    init();
    
    // Initialize the page with data and event listeners
    function init() {
        loadUsers();
        setupEventListeners();
        updateUserRoleDescription();
    }
    
    // Load users from the API
    function loadUsers() {
        fetch('/api/users')
            .then(response => response.json())
            .then(data => {
                users = data.users || [];
                filteredUsers = [...users];
                
                updateUserMetrics();
                updatePagination();
                renderUsers();
            })
            .catch(error => {
                console.error('Error loading users:', error);
                showNotification('Failed to load users. Please try again.', 'error');
            });
    }
    
    // Update the user metrics cards
    function updateUserMetrics() {
        const totalUsers = users.length;
        const activeUsers = users.filter(user => user.is_active).length;
        const superusers = users.filter(user => user.role === 'superuser').length;
        const adminUsers = users.filter(user => user.role === 'admin').length;
        
        totalUsersValue.textContent = totalUsers;
        activeUsersValue.textContent = activeUsers;
        superusersValue.textContent = superusers;
        adminUsersValue.textContent = adminUsers;
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Search and filter events
        userSearchInput.addEventListener('input', handleSearch);
        roleFilter.addEventListener('change', applyFilters);
        statusFilter.addEventListener('change', applyFilters);
        resetFiltersBtn.addEventListener('click', resetFilters);
        
        // Modal events
        createUserBtn.addEventListener('click', openCreateUserModal);
        closeUserModal.addEventListener('click', closeModal);
        userModalOverlay.addEventListener('click', closeModal);
        cancelUserBtn.addEventListener('click', closeModal);
        saveUserBtn.addEventListener('click', saveUser);
        
        // Confirmation modal events
        closeConfirmModal.addEventListener('click', closeConfirmationModal);
        confirmModalOverlay.addEventListener('click', closeConfirmationModal);
        cancelConfirmBtn.addEventListener('click', closeConfirmationModal);
        confirmActionBtn.addEventListener('click', handleConfirmAction);
        
        // Form events
        userRole.addEventListener('change', updateUserRoleDescription);
        isActive.addEventListener('change', updateStatusText);
        
        // Password events
        togglePassword.addEventListener('click', togglePasswordVisibility);
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Handle user search
    function handleSearch() {
        const searchTerm = userSearchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            applyFilters(); // Reset to filtered state without search
            return;
        }
        
        // Filter based on current role and status filters first
        let results = [...users];
        
        const roleValue = roleFilter.value;
        if (roleValue !== 'all') {
            results = results.filter(user => user.role === roleValue);
        }
        
        const statusValue = statusFilter.value;
        if (statusValue !== 'all') {
            const isActiveStatus = statusValue === 'active';
            results = results.filter(user => user.is_active === isActiveStatus);
        }
        
        // Then apply search term
        results = results.filter(user => 
            user.full_name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm)
        );
        
        filteredUsers = results;
        currentPage = 1;
        updatePagination();
        renderUsers();
    }
    
    // Apply role and status filters
    function applyFilters() {
        const roleValue = roleFilter.value;
        const statusValue = statusFilter.value;
        
        let results = [...users];
        
        if (roleValue !== 'all') {
            results = results.filter(user => user.role === roleValue);
        }
        
        if (statusValue !== 'all') {
            const isActiveStatus = statusValue === 'active';
            results = results.filter(user => user.is_active === isActiveStatus);
        }
        
        // Apply search if there's a search term
        const searchTerm = userSearchInput.value.toLowerCase().trim();
        if (searchTerm !== '') {
            results = results.filter(user => 
                user.full_name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.username.toLowerCase().includes(searchTerm)
            );
        }
        
        filteredUsers = results;
        currentPage = 1;
        updatePagination();
        renderUsers();
    }
    
    // Reset all filters and search
    function resetFilters() {
        userSearchInput.value = '';
        roleFilter.value = 'all';
        statusFilter.value = 'all';
        
        filteredUsers = [...users];
        currentPage = 1;
        updatePagination();
        renderUsers();
    }
    
    // Render users in the table
    function renderUsers() {
        usersTableBody.innerHTML = '';
        
        const start = (currentPage - 1) * recordsPerPage;
        const end = Math.min(start + recordsPerPage, filteredUsers.length);
        const pageUsers = filteredUsers.slice(start, end);
        
        if (pageUsers.length === 0) {
            // Show empty state
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-users-slash"></i>
                        <h3>No users found</h3>
                        <p>Try adjusting your search or filter criteria, or create a new user.</p>
                    </div>
                </td>
            `;
            usersTableBody.appendChild(emptyRow);
            return;
        }
        
        // Render each user row
        pageUsers.forEach(user => {
            const row = document.createElement('tr');
            
            // Format dates
            const formattedLastLogin = user.last_login ? formatDate(user.last_login) : 'Never';
            const formattedCreatedAt = formatDate(user.created_at);
            
            row.innerHTML = `
                <td>
                    <div class="user-name">${user.full_name}</div>
                    <div class="user-username" style="font-size: 0.8rem; color: #777;">@${user.username}</div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge ${user.role}">${capitalizeFirstLetter(user.role)}</span>
                </td>
                <td>
                    <div class="user-status">
                        <span class="status-indicator ${user.is_active ? 'active' : 'inactive'}"></span>
                        <span class="status-text">${user.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                </td>
                <td>${formattedLastLogin}</td>
                <td>${formattedCreatedAt}</td>
                <td>
                    <div class="user-actions">
                        <button class="user-action-btn edit-user-btn" data-id="${user.id}" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.is_active 
                            ? `<button class="user-action-btn deactivate-user-btn" data-id="${user.id}" title="Deactivate User">
                                <i class="fas fa-user-slash"></i>
                              </button>`
                            : `<button class="user-action-btn reactivate-user-btn" data-id="${user.id}" title="Reactivate User">
                                <i class="fas fa-user-check"></i>
                              </button>`
                        }
                    </div>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        // Add event listeners to the newly created buttons
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = parseInt(btn.getAttribute('data-id'));
                const user = users.find(u => u.id === userId);
                openEditUserModal(user);
            });
        });
        
        document.querySelectorAll('.deactivate-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = parseInt(btn.getAttribute('data-id'));
                const user = users.find(u => u.id === userId);
                openDeactivateUserConfirmation(user);
            });
        });
        
        document.querySelectorAll('.reactivate-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = parseInt(btn.getAttribute('data-id'));
                const user = users.find(u => u.id === userId);
                reactivateUser(user);
            });
        });
    }
    
    // Update pagination controls
    function updatePagination() {
        const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
        const start = (currentPage - 1) * recordsPerPage + 1;
        const end = Math.min(start + recordsPerPage - 1, filteredUsers.length);
        
        startRecord.textContent = filteredUsers.length > 0 ? start : 0;
        endRecord.textContent = end;
        totalRecords.textContent = filteredUsers.length;
        
        // Generate pagination controls
        paginationControls.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updatePagination();
                renderUsers();
            }
        });
        paginationControls.appendChild(prevBtn);
        
        // Page numbers
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
        
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
        
        if (startPage > 1) {
            const firstPageBtn = document.createElement('button');
            firstPageBtn.className = 'pagination-btn';
            firstPageBtn.textContent = '1';
            firstPageBtn.addEventListener('click', () => {
                currentPage = 1;
                updatePagination();
                renderUsers();
            });
            paginationControls.appendChild(firstPageBtn);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                paginationControls.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn${i === currentPage ? ' active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                updatePagination();
                renderUsers();
            });
            paginationControls.appendChild(pageBtn);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                paginationControls.appendChild(ellipsis);
            }
            
            const lastPageBtn = document.createElement('button');
            lastPageBtn.className = 'pagination-btn';
            lastPageBtn.textContent = totalPages;
            lastPageBtn.addEventListener('click', () => {
                currentPage = totalPages;
                updatePagination();
                renderUsers();
            });
            paginationControls.appendChild(lastPageBtn);
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updatePagination();
                renderUsers();
            }
        });
        paginationControls.appendChild(nextBtn);
    }
    
    // Open the create user modal
    function openCreateUserModal() {
        modalTitle.textContent = 'Create New User';
        userForm.reset();
        document.getElementById('userId').value = '';
        document.getElementById('statusSection').style.display = 'none';
        document.querySelector('.passwordRequired').style.display = 'inline';
        passwordInput.required = true;
        
        // Reset validation
        clearValidationMessages();
        
        // Reset password strength meter
        strengthMeter.className = 'strength-meter-fill';
        strengthMeter.style.width = '0';
        strengthText.textContent = 'Password strength';
        
        // Update role description
        updateUserRoleDescription();
        
        // Show modal
        userModal.style.display = 'block';
        userModalOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Open the edit user modal
    function openEditUserModal(user) {
        modalTitle.textContent = 'Edit User';
        document.getElementById('userId').value = user.id;
        document.getElementById('fullName').value = user.full_name;
        document.getElementById('email').value = user.email;
        document.getElementById('username').value = user.username;
        document.getElementById('username').readOnly = true; // Username cannot be changed
        document.getElementById('userRole').value = user.role;
        document.getElementById('isActive').checked = user.is_active;
        document.getElementById('password').value = '';
        document.getElementById('statusSection').style.display = 'block';
        document.querySelector('.passwordRequired').style.display = 'none';
        passwordInput.required = false;
        
        // Update status text
        updateStatusText();
        
        // Update role description
        updateUserRoleDescription();
        
        // Reset validation
        clearValidationMessages();
        
        // Reset password strength meter
        strengthMeter.className = 'strength-meter-fill';
        strengthMeter.style.width = '0';
        strengthText.textContent = 'Password strength';
        
        // Set current user
        currentUser = user;
        
        // Show modal
        userModal.style.display = 'block';
        userModalOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Open confirmation modal for deactivating a user
    function openDeactivateUserConfirmation(user) {
        document.getElementById('confirmMessage').textContent = `Are you sure you want to deactivate user "${user.full_name}"? They will not be able to log in to the system.`;
        currentAction = 'deactivate';
        currentUser = user;
        
        confirmModal.style.display = 'block';
        confirmModalOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Close the user modal
    function closeModal() {
        userModal.style.display = 'none';
        userModalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // Close the confirmation modal
    function closeConfirmationModal() {
        confirmModal.style.display = 'none';
        confirmModalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // Save user (create or update)
    function saveUser(event) {
        event.preventDefault();
        
        // Validate form
        if (!validateUserForm()) {
            return;
        }
        
        const userId = document.getElementById('userId').value;
        const isEditMode = userId !== '';
        
        // Prepare data
        const userData = {
            full_name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            username: document.getElementById('username').value,
            role: document.getElementById('userRole').value
        };
        
        // Add password if provided or in create mode
        const password = document.getElementById('password').value;
        if (password || !isEditMode) {
            userData.password = password;
        }
        
        // Add is_active only in edit mode
        if (isEditMode) {
            userData.is_active = document.getElementById('isActive').checked;
        }
        
        // Send to API
        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode ? `/api/users/${userId}` : '/api/users';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'Failed to save user');
                });
            }
            return response.json();
        })
        .then(data => {
            if (isEditMode) {
                // Update user in the list
                const index = users.findIndex(u => u.id === parseInt(userId));
                if (index !== -1) {
                    users[index] = data.user;
                }
                showNotification('User updated successfully', 'success');
            } else {
                // Add new user to the list
                users.push(data.user);
                showNotification('User created successfully', 'success');
            }
            
            // Close modal and refresh
            closeModal();
            applyFilters();
            updateUserMetrics();
        })
        .catch(error => {
            console.error('Error saving user:', error);
            showNotification(error.message, 'error');
        });
    }
    
    // Validate the user form
    function validateUserForm() {
        let isValid = true;
        clearValidationMessages();
        
        const fullName = document.getElementById('fullName');
        const email = document.getElementById('email');
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        const userRole = document.getElementById('userRole');
        
        // Full Name validation
        if (!fullName.value.trim()) {
            document.getElementById('fullNameError').textContent = 'Full name is required';
            isValid = false;
        }
        
        // Email validation
        if (!email.value.trim()) {
            document.getElementById('emailError').textContent = 'Email address is required';
            isValid = false;
        } else if (!isValidEmail(email.value.trim())) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            isValid = false;
        }
        
        // Username validation
        if (!username.value.trim()) {
            document.getElementById('usernameError').textContent = 'Username is required';
            isValid = false;
        }
        
        // Password validation (required only for new users)
        if (password.required && !password.value) {
            document.getElementById('passwordError').textContent = 'Password is required for new users';
            isValid = false;
        } else if (password.value && password.value.length < 8) {
            document.getElementById('passwordError').textContent = 'Password must be at least 8 characters';
            isValid = false;
        }
        
        // Role validation
        if (!userRole.value) {
            document.getElementById('userRoleError').textContent = 'Please select a user role';
            isValid = false;
        }
        
        return isValid;
    }
    
    // Handle confirm action button click
    function handleConfirmAction() {
        if (currentAction === 'deactivate') {
            deactivateUser(currentUser);
        }
        closeConfirmationModal();
    }
    
    // Deactivate a user
    function deactivateUser(user) {
        fetch(`/api/users/${user.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_active: false })
        })
        .then(response => response.json())
        .then(data => {
            // Update user in the list
            const index = users.findIndex(u => u.id === user.id);
            if (index !== -1) {
                users[index] = data.user;
            }
            
            showNotification(`User "${user.full_name}" has been deactivated`, 'success');
            applyFilters();
            updateUserMetrics();
        })
        .catch(error => {
            console.error('Error deactivating user:', error);
            showNotification('Failed to deactivate user. Please try again.', 'error');
        });
    }
    
    // Reactivate a user
    function reactivateUser(user) {
        fetch(`/api/users/${user.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_active: true })
        })
        .then(response => response.json())
        .then(data => {
            // Update user in the list
            const index = users.findIndex(u => u.id === user.id);
            if (index !== -1) {
                users[index] = data.user;
            }
            
            showNotification(`User "${user.full_name}" has been reactivated`, 'success');
            applyFilters();
            updateUserMetrics();
        })
        .catch(error => {
            console.error('Error reactivating user:', error);
            showNotification('Failed to reactivate user. Please try again.', 'error');
        });
    }
    
    // Update user role description
    function updateUserRoleDescription() {
        const selectedRole = userRole.value;
        const roleDescriptionElement = document.getElementById('roleDescription');
        
        if (selectedRole) {
            roleDescriptionElement.textContent = roleDescriptions[selectedRole];
            roleDescriptionElement.className = `role-description ${selectedRole}`;
        } else {
            roleDescriptionElement.textContent = 'Select a role to see its permissions';
            roleDescriptionElement.className = 'role-description';
        }
    }
    
    // Update status text based on checkbox
    function updateStatusText() {
        const statusText = document.getElementById('statusText');
        if (isActive.checked) {
            statusText.textContent = 'Active';
            statusText.style.color = '#3bb077';
        } else {
            statusText.textContent = 'Inactive';
            statusText.style.color = '#e55353';
        }
    }
    
    // Toggle password visibility
    function togglePasswordVisibility() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    }
    
    // Update password strength meter
    function updatePasswordStrength() {
        const password = passwordInput.value;
        
        if (!password) {
            strengthMeter.style.width = '0';
            strengthMeter.className = 'strength-meter-fill';
            strengthText.textContent = 'Password strength';
            return;
        }
        
        // Calculate password strength
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
        // Character type checks
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        // Update meter based on strength
        if (strength <= 2) {
            strengthMeter.className = 'strength-meter-fill weak';
            strengthText.textContent = 'Weak';
        } else if (strength <= 4) {
            strengthMeter.className = 'strength-meter-fill medium';
            strengthText.textContent = 'Medium';
        } else if (strength <= 5) {
            strengthMeter.className = 'strength-meter-fill strong';
            strengthText.textContent = 'Strong';
        } else {
            strengthMeter.className = 'strength-meter-fill very-strong';
            strengthText.textContent = 'Very Strong';
        }
        
        // Set width based on strength (out of 6 possible points)
        strengthMeter.style.width = `${(strength / 6) * 100}%`;
    }
    
    // Clear form validation messages
    function clearValidationMessages() {
        const validationMessages = document.querySelectorAll('.validation-message');
        validationMessages.forEach(element => {
            element.textContent = '';
        });
    }
    
    // Show notification
    function showNotification(message, type) {
        // You can implement a toast notification system here
        alert(`${type.toUpperCase()}: ${message}`);
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if email is valid
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
    }
    
    // Capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});