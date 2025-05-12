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
    // Initialize Supabase client
    const supabaseUrl = 'https://your-supabase-url.supabase.co';
    const supabaseKey = 'your-supabase-key';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);
    
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
    
    // Sample data for development/demo purposes
    // In a real application, this would come from the Supabase database
    const sampleUsers = [
        {
            id: 1,
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            username: 'johndoe',
            role: 'superuser',
            isActive: true,
            lastLogin: '2023-06-10T14:30:45Z',
            createdAt: '2023-01-15T09:20:30Z',
            notes: 'Main administrator'
        },
        {
            id: 2,
            fullName: 'Jane Smith',
            email: 'jane.smith@example.com',
            username: 'janesmith',
            role: 'admin',
            isActive: true,
            lastLogin: '2023-06-08T11:45:22Z',
            createdAt: '2023-02-20T10:15:40Z',
            notes: 'Finance department'
        },
        {
            id: 3,
            fullName: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            username: 'mikejohnson',
            role: 'basic',
            isActive: true,
            lastLogin: '2023-06-09T16:20:10Z',
            createdAt: '2023-03-05T14:30:50Z',
            notes: 'Sales team'
        },
        {
            id: 4,
            fullName: 'Sarah Williams',
            email: 'sarah.williams@example.com',
            username: 'sarahw',
            role: 'admin',
            isActive: false,
            lastLogin: '2023-05-20T09:15:30Z',
            createdAt: '2023-03-15T08:45:20Z',
            notes: 'On leave'
        },
        {
            id: 5,
            fullName: 'David Brown',
            email: 'david.brown@example.com',
            username: 'davidb',
            role: 'basic',
            isActive: true,
            lastLogin: '2023-06-07T13:40:15Z',
            createdAt: '2023-04-10T11:10:05Z',
            notes: ''
        }
    ];
    
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
    
    // Load users from Supabase or mock data for development
    function loadUsers() {
        // In a real application, this would fetch data from Supabase
        // For now, we'll use the sample data
        users = [...sampleUsers];
        filteredUsers = [...users];
        
        updateUserMetrics();
        updatePagination();
        renderUsers();
    }
    
    // Update the user metrics cards
    function updateUserMetrics() {
        const totalUsers = users.length;
        const activeUsers = users.filter(user => user.isActive).length;
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
            results = results.filter(user => user.isActive === isActiveStatus);
        }
        
        // Then apply search term
        results = results.filter(user => 
            user.fullName.toLowerCase().includes(searchTerm) ||
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
            results = results.filter(user => user.isActive === isActiveStatus);
        }
        
        // Apply search if there's a search term
        const searchTerm = userSearchInput.value.toLowerCase().trim();
        if (searchTerm !== '') {
            results = results.filter(user => 
                user.fullName.toLowerCase().includes(searchTerm) ||
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
            const formattedLastLogin = formatDate(user.lastLogin);
            const formattedCreatedAt = formatDate(user.createdAt);
            
            row.innerHTML = `
                <td>
                    <div class="user-name">${user.fullName}</div>
                    <div class="user-username" style="font-size: 0.8rem; color: #777;">@${user.username}</div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge ${user.role}">${capitalizeFirstLetter(user.role)}</span>
                </td>
                <td>
                    <div class="user-status">
                        <span class="status-indicator ${user.isActive ? 'active' : 'inactive'}"></span>
                        <span class="status-text">${user.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                </td>
                <td>${formattedLastLogin}</td>
                <td>${formattedCreatedAt}</td>
                <td>
                    <div class="user-actions">
                        <button class="user-action-btn edit-user-btn" data-id="${user.id}" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.isActive 
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
            const firstBtn = document.createElement('button');
            firstBtn.className = 'pagination-btn';
            firstBtn.textContent = '1';
            firstBtn.addEventListener('click', () => {
                currentPage = 1;
                updatePagination();
                renderUsers();
            });
            paginationControls.appendChild(firstBtn);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                paginationControls.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
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
            
            const lastBtn = document.createElement('button');
            lastBtn.className = 'pagination-btn';
            lastBtn.textContent = totalPages;
            lastBtn.addEventListener('click', () => {
                currentPage = totalPages;
                updatePagination();
                renderUsers();
            });
            paginationControls.appendChild(lastBtn);
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
        
        // Show password field for new users
        document.getElementById('passwordGroup').style.display = 'block';
        
        // Set default values
        isActive.checked = true;
        updateStatusText();
        updateUserRoleDescription();
        
        // Clear validation messages
        clearValidationMessages();
        
        // Reset password strength meter
        strengthMeter.className = 'strength-meter-fill';
        strengthMeter.style.width = '0%';
        strengthText.textContent = 'Password strength';
        
        // Set modal mode
        currentAction = 'create';
        document.getElementById('userId').value = '';
        
        // Show the modal
        userModal.style.display = 'block';
        userModalOverlay.style.display = 'block';
        
        // Focus on the first input
        document.getElementById('fullName').focus();
    }
    
    // Open the edit user modal
    function openEditUserModal(user) {
        modalTitle.textContent = 'Edit User';
        
        // Hide password field for existing users to prevent accidental changes
        document.getElementById('passwordGroup').style.display = 'none';
        
        // Populate the form with user data
        document.getElementById('userId').value = user.id;
        document.getElementById('fullName').value = user.fullName;
        document.getElementById('email').value = user.email;
        document.getElementById('username').value = user.username;
        document.getElementById('userRole').value = user.role;
        document.getElementById('isActive').checked = user.isActive;
        document.getElementById('notes').value = user.notes || '';
        
        updateStatusText();
        updateUserRoleDescription();
        
        // Clear validation messages
        clearValidationMessages();
        
        // Set modal mode
        currentAction = 'edit';
        currentUser = user;
        
        // Show the modal
        userModal.style.display = 'block';
        userModalOverlay.style.display = 'block';
        
        // Focus on the first input
        document.getElementById('fullName').focus();
    }
    
    // Open the deactivate user confirmation modal
    function openDeactivateUserConfirmation(user) {
        document.getElementById('confirmTitle').textContent = 'Deactivate User';
        document.getElementById('confirmMessage').textContent = 
            `Are you sure you want to deactivate the user "${user.fullName}"? They will no longer be able to access the system.`;
        
        // Set current action and user
        currentAction = 'deactivate';
        currentUser = user;
        
        // Show the confirmation modal
        confirmModal.style.display = 'block';
        confirmModalOverlay.style.display = 'block';
    }
    
    // Close the user modal
    function closeModal() {
        userModal.style.display = 'none';
        userModalOverlay.style.display = 'none';
        
        // Reset form and current action
        userForm.reset();
        currentAction = null;
        currentUser = null;
    }
    
    // Close the confirmation modal
    function closeConfirmationModal() {
        confirmModal.style.display = 'none';
        confirmModalOverlay.style.display = 'none';
        
        // Reset current action
        currentAction = null;
        currentUser = null;
    }
    
    // Save a new or updated user
    function saveUser(event) {
        event.preventDefault();
        
        // Validate the form
        if (!validateUserForm()) {
            return;
        }
        
        const userId = document.getElementById('userId').value;
        const user = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            username: document.getElementById('username').value.trim(),
            role: document.getElementById('userRole').value,
            isActive: document.getElementById('isActive').checked,
            notes: document.getElementById('notes').value.trim(),
            lastLogin: currentAction === 'edit' ? currentUser.lastLogin : null,
            createdAt: currentAction === 'edit' ? currentUser.createdAt : new Date().toISOString()
        };
        
        if (currentAction === 'create') {
            // Add password for new users
            user.password = document.getElementById('password').value;
            
            // Generate a new ID (in a real app, this would be handled by the database)
            user.id = Math.max(...users.map(u => u.id), 0) + 1;
            
            // Add the new user to the array
            users.push(user);
            
            // Show success message (in a real app, this would come after API success)
            showNotification('User created successfully', 'success');
        } else if (currentAction === 'edit') {
            // Update existing user
            const index = users.findIndex(u => u.id === parseInt(userId));
            if (index !== -1) {
                // Preserve properties not in the form
                users[index] = { ...users[index], ...user };
                
                // Show success message
                showNotification('User updated successfully', 'success');
            }
        }
        
        // Update data and UI
        filteredUsers = [...users];
        applyFilters(); // Re-apply any active filters
        updateUserMetrics();
        
        // Close the modal
        closeModal();
    }
    
    // Validate the user form before saving
    function validateUserForm() {
        let isValid = true;
        clearValidationMessages();
        
        // Validate required fields
        const fullName = document.getElementById('fullName');
        if (!fullName.value.trim()) {
            document.getElementById('fullNameError').textContent = 'Full name is required';
            isValid = false;
        }
        
        const email = document.getElementById('email');
        if (!email.value.trim()) {
            document.getElementById('emailError').textContent = 'Email is required';
            isValid = false;
        } else if (!isValidEmail(email.value.trim())) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            isValid = false;
        }
        
        const username = document.getElementById('username');
        if (!username.value.trim()) {
            document.getElementById('usernameError').textContent = 'Username is required';
            isValid = false;
        } else if (username.value.trim().length < 3) {
            document.getElementById('usernameError').textContent = 'Username must be at least 3 characters';
            isValid = false;
        }
        
        const role = document.getElementById('userRole');
        if (!role.value) {
            document.getElementById('userRoleError').textContent = 'Please select a user role';
            isValid = false;
        }
        
        // Validate password for new users
        if (currentAction === 'create') {
            const password = document.getElementById('password');
            if (!password.value) {
                document.getElementById('passwordError').textContent = 'Password is required';
                isValid = false;
            } else if (password.value.length < 8) {
                document.getElementById('passwordError').textContent = 'Password must be at least 8 characters';
                isValid = false;
            }
        }
        
        // Check for duplicate username (except when editing the same user)
        const duplicateUsername = users.find(u => 
            u.username.toLowerCase() === username.value.trim().toLowerCase() && 
            (currentAction !== 'edit' || u.id !== parseInt(document.getElementById('userId').value))
        );
        
        if (duplicateUsername) {
            document.getElementById('usernameError').textContent = 'This username is already taken';
            isValid = false;
        }
        
        // Check for duplicate email (except when editing the same user)
        const duplicateEmail = users.find(u => 
            u.email.toLowerCase() === email.value.trim().toLowerCase() && 
            (currentAction !== 'edit' || u.id !== parseInt(document.getElementById('userId').value))
        );
        
        if (duplicateEmail) {
            document.getElementById('emailError').textContent = 'This email is already in use';
            isValid = false;
        }
        
        return isValid;
    }
    
    // Handle confirmed actions (deactivate, etc.)
    function handleConfirmAction() {
        if (currentAction === 'deactivate' && currentUser) {
            deactivateUser(currentUser);
        }
        
        closeConfirmationModal();
    }
    
    // Deactivate a user
    function deactivateUser(user) {
        // Find and update the user
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index].isActive = false;
            
            // Update data and UI
            filteredUsers = applyCurrentFilters();
            updateUserMetrics();
            updatePagination();
            renderUsers();
            
            // Show success message
            showNotification(`User '${user.fullName}' has been deactivated`, 'success');
        }
    }
    
    // Reactivate a user
    function reactivateUser(user) {
        // Find and update the user
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index].isActive = true;
            
            // Update data and UI
            filteredUsers = applyCurrentFilters();
            updateUserMetrics();
            updatePagination();
            renderUsers();
            
            // Show success message
            showNotification(`User '${user.fullName}' has been reactivated`, 'success');
        }
    }
    
    // Helper function to apply current filters without changing the filter UI
    function applyCurrentFilters() {
        const roleValue = roleFilter.value;
        const statusValue = statusFilter.value;
        const searchTerm = userSearchInput.value.toLowerCase().trim();
        
        let results = [...users];
        
        if (roleValue !== 'all') {
            results = results.filter(user => user.role === roleValue);
        }
        
        if (statusValue !== 'all') {
            const isActiveStatus = statusValue === 'active';
            results = results.filter(user => user.isActive === isActiveStatus);
        }
        
        if (searchTerm !== '') {
            results = results.filter(user => 
                user.fullName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.username.toLowerCase().includes(searchTerm)
            );
        }
        
        return results;
    }
    
    // Update the user role description
    function updateUserRoleDescription() {
        const selectedRole = userRole.value;
        roleDescription.className = 'role-description';
        
        if (selectedRole) {
            roleDescription.classList.add(selectedRole);
            roleDescription.textContent = roleDescriptions[selectedRole];
        } else {
            roleDescription.textContent = 'Please select a role to see its permissions';
        }
    }
    
    // Update the status text based on the toggle state
    function updateStatusText() {
        statusText.textContent = isActive.checked ? 'Active' : 'Inactive';
        statusText.style.color = isActive.checked ? '#3bb077' : '#e55353';
    }
    
    // Toggle password visibility
    function togglePasswordVisibility() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    }
    
    // Update the password strength meter
    function updatePasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        let status = '';
        
        if (password.length === 0) {
            strengthMeter.style.width = '0%';
            strengthMeter.className = 'strength-meter-fill';
            strengthText.textContent = 'Password strength';
            return;
        }
        
        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
        // Complexity checks
        if (password.match(/[a-z]/)) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
        
        // Determine strength level
        if (strength <= 2) {
            status = 'weak';
            strengthText.textContent = 'Weak - Use a longer password with symbols';
            strengthText.style.color = '#e55353';
        } else if (strength <= 4) {
            status = 'medium';
            strengthText.textContent = 'Medium - Consider adding more variety';
            strengthText.style.color = '#f0ad4e';
        } else if (strength <= 6) {
            status = 'strong';
            strengthText.textContent = 'Strong - Good password!';
            strengthText.style.color = '#3bb077';
        } else {
            status = 'very-strong';
            strengthText.textContent = 'Very Strong - Excellent password!';
            strengthText.style.color = '#4f46e5';
        }
        
        strengthMeter.className = `strength-meter-fill ${status}`;
    }
    
    // Clear all validation messages
    function clearValidationMessages() {
        const validationMessages = document.querySelectorAll('.validation-message');
        validationMessages.forEach(msg => {
            msg.textContent = '';
        });
    }
    
    // Show a notification (would be implemented with a toast library in a real app)
    function showNotification(message, type) {
        // For demonstration, we'll use alert, but in a real app
        // this would use a proper notification system
        alert(message);
    }
    
    // Utility function to format dates
    function formatDate(dateString) {
        if (!dateString) return 'Never';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Utility function to check if an email is valid
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
    }
    
    // Utility function to capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Handle sidebar menu toggle for mobile
    document.querySelector('.menu-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
});
