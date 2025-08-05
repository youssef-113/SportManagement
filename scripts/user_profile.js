// Global variables
let currentProfile = {};
let csrfToken = document.querySelector('meta[name="csrf-token"]').content;
let authToken = localStorage.getItem('jwt'); // Get JWT from storage

// DOM Elements
const profileNameEl = document.getElementById('profileName');
const profileEmailEl = document.getElementById('profileEmail');
const profilePhoneEl = document.getElementById('profilePhone');
const fullNameEl = document.getElementById('fullName');
const emailEl = document.getElementById('email');
const phoneEl = document.getElementById('phone');
const nationalityEl = document.getElementById('nationality');
const dobEl = document.getElementById('dob');
const nationalIdEl = document.getElementById('nationalId');
const genderEl = document.getElementById('gender');
const sportEl = document.getElementById('sport');
const positionEl = document.getElementById('position');
const teamEl = document.getElementById('team');
const joinDateEl = document.getElementById('joinDate');
const contractStartEl = document.getElementById('contractStart');
const contractEndEl = document.getElementById('contractEnd');
const heightEl = document.getElementById('height');
const weightEl = document.getElementById('weight');
const lastCheckupEl = document.getElementById('lastCheckup');
const medicalStatusEl = document.getElementById('medicalStatus');
const treatmentEl = document.getElementById('treatment');
const nextAppointmentEl = document.getElementById('nextAppointment');
const sidebarNameEl = document.getElementById('sidebarName');
const sidebarRoleEl = document.getElementById('sidebarRole');
const roleEl = document.getElementById('roleText');
const createdAtEl = document.getElementById('createdAt');
const lastLoginEl = document.getElementById('lastLogin');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Redirect to login if no token
    if (!authToken) {
        showNotification('Please login to access your profile', 'error');
        setTimeout(() => window.location.href = '/login', 2000);
        return;
    }

    // Set up event listeners
    setupEventListeners();

    // Fetch profile data
    fetchProfileData();

    // Set up tab switching
    setupTabs();
});

// Set up event listeners
function setupEventListeners() {
    // Edit/Save personal info
    document.getElementById('editPersonalBtn').addEventListener('click', () => toggleEditMode(true));
    document.getElementById('cancelPersonalEdit').addEventListener('click', () => toggleEditMode(false));
    document.getElementById('savePersonal').addEventListener('click', updateProfile);

    // Password change
    document.getElementById('changePasswordBtn').addEventListener('click', changePassword);

    // Password strength meter
    document.getElementById('newPassword').addEventListener('input', checkPasswordStrength);

    // File input change
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);

    // Upload photo button
    document.getElementById('uploadPhotoBtn').addEventListener('click', uploadPhoto);
}

// Set up tab switching
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));

            // Show selected tab content
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Fetch profile data from API
async function fetchProfileData() {
    try {
        // Show loading state
        profileNameEl.textContent = 'Loading...';

        const response = await fetch('/api/user_profile.php?action=getProfile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-CSRF-Token': csrfToken
            }
        });

        // Handle unauthorized
        if (response.status === 401) {
            showNotification('Session expired. Please login again', 'error');
            setTimeout(() => window.location.href = '/login', 2000);
            return;
        }

        // Handle other errors
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load profile');
        }

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to load profile');
        }

        // Update current profile
        currentProfile = data.data;

        // Render the profile data
        renderProfileData();

        // Show success notification
        showNotification('Profile loaded successfully', 'success');

    } catch (error) {
        console.error('Error fetching profile:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Render profile data to the UI
function renderProfileData() {
    // Profile header
    profileNameEl.textContent = currentProfile.full_name || 'N/A';
    profileEmailEl.textContent = currentProfile.email || 'N/A';
    profilePhoneEl.textContent = currentProfile.phone_number || 'N/A';

    // Personal info
    fullNameEl.textContent = currentProfile.full_name || 'N/A';
    emailEl.textContent = currentProfile.email || 'N/A';
    phoneEl.textContent = currentProfile.phone_number || 'N/A';
    nationalityEl.textContent = currentProfile.nationality || 'N/A';
    dobEl.textContent = formatDate(currentProfile.dob) || 'N/A';
    nationalIdEl.textContent = maskSensitiveData(currentProfile.national_id, 4) || 'N/A';
    genderEl.textContent = currentProfile.gender ?
        currentProfile.gender.charAt(0).toUpperCase() + currentProfile.gender.slice(1) : 'N/A';

    // Account info
    roleEl.textContent = currentProfile.role || 'N/A';
    createdAtEl.textContent = formatDate(currentProfile.created_at) || 'N/A';
    lastLoginEl.textContent = currentProfile.last_login ?
        formatDateTime(currentProfile.last_login) : 'Never';

    // Hide sports/medical data if not player
    if (currentProfile.role !== 'player') {
        document.getElementById('sports-tab').style.display = 'none';
        document.getElementById('medical-tab').style.display = 'none';
    } else {
        // Sports info (if available)
        sportEl.textContent = currentProfile.sport || 'N/A';
        positionEl.textContent = currentProfile.position || 'N/A';
        teamEl.textContent = currentProfile.teamID || 'N/A';
        joinDateEl.textContent = formatDate(currentProfile.joinDate) || 'N/A';
        contractStartEl.textContent = formatDate(currentProfile.contractStart) || 'N/A';
        contractEndEl.textContent = formatDate(currentProfile.contractEnd) || 'N/A';
        heightEl.textContent = currentProfile.playerHeight ?
            `${currentProfile.playerHeight} cm` : 'N/A';
        weightEl.textContent = currentProfile.playerWeight ?
            `${currentProfile.playerWeight} kg` : 'N/A';

        // Medical info (if available)
        lastCheckupEl.textContent = formatDate(currentProfile.lastCheckup) || 'N/A';
        medicalStatusEl.textContent = currentProfile.medicalStatus || 'N/A';
        treatmentEl.textContent = currentProfile.treatment || 'N/A';
        nextAppointmentEl.textContent = formatDate(currentProfile.nextAppointment) || 'N/A';
    }

    // Status
    document.getElementById('statusText').textContent = currentProfile.status || 'Active';
    const statusColor = currentProfile.status === 'Active' ? '#10b981' : '#ef4444';
    document.getElementById('statusIcon').style.color = statusColor;

    // Sidebar
    sidebarNameEl.textContent = currentProfile.full_name || 'User';
    sidebarRoleEl.textContent = currentProfile.role ?
        `${currentProfile.role.charAt(0).toUpperCase() + currentProfile.role.slice(1)}` : 'User';
}

// Toggle edit mode for personal information
function toggleEditMode(editMode) {
    const staticInfo = document.querySelector('.info-grid');
    const editForm = document.getElementById('personalForm');

    if (editMode) {
        // Populate form with current data
        document.getElementById('editFullName').value = currentProfile.full_name || '';
        document.getElementById('editPhone').value = currentProfile.phone_number || '';
        document.getElementById('editNationality').value = currentProfile.nationality || '';
        document.getElementById('editDob').value = currentProfile.dob || '';
        document.getElementById('editNationalId').value = currentProfile.national_id || '';

        // Set gender radio button
        if (currentProfile.gender) {
            document.querySelector(`input[name="editGender"][value="${currentProfile.gender}"]`).checked = true;
        }

        staticInfo.style.display = 'none';
        editForm.style.display = 'block';
    } else {
        staticInfo.style.display = 'grid';
        editForm.style.display = 'none';
    }
}

// Update profile data
async function updateProfile() {
    const saveBtn = document.getElementById('savePersonal');
    const saveText = document.getElementById('savePersonalText');
    const spinner = document.getElementById('savePersonalSpinner');

    saveText.style.display = 'none';
    spinner.style.display = 'inline-block';
    saveBtn.disabled = true;

    try {
        // Get updated values
        const updateData = {
            full_name: document.getElementById('editFullName').value,
            phone_number: document.getElementById('editPhone').value,
            nationality: document.getElementById('editNationality').value,
            dob: document.getElementById('editDob').value,
            national_id: document.getElementById('editNationalId').value,
            gender: document.querySelector('input[name="editGender"]:checked')?.value || ''
        };

        // API call to update profile
        const response = await fetch('/api/user_profile.php?action=updateProfile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(updateData)
        });

        // Handle unauthorized
        if (response.status === 401) {
            showNotification('Session expired. Please login again', 'error');
            setTimeout(() => window.location.href = '/login', 2000);
            return;
        }

        // Handle other errors
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Profile update failed');
        }

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(data.message || 'Profile update failed');
        }

        // Update current profile with new data
        currentProfile = { ...currentProfile, ...updateData };

        // Re-render the profile
        renderProfileData();

        // Switch back to view mode
        toggleEditMode(false);

        // Show success notification
        showNotification('Profile updated successfully!', 'success');

    } catch (error) {
        console.error('Update error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        // Restore button state
        saveText.style.display = 'inline-block';
        spinner.style.display = 'none';
        saveBtn.disabled = false;
    }
}

// Change password
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const changeBtn = document.getElementById('changePasswordBtn');
    const changeText = document.getElementById('changePasswordText');
    const spinner = document.getElementById('changePasswordSpinner');

    changeText.style.display = 'none';
    spinner.style.display = 'inline-block';
    changeBtn.disabled = true;

    try {
        // API call to change password
        const response = await fetch('/api/user_profile.php?action=changePassword', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        });

        // Handle unauthorized
        if (response.status === 401) {
            showNotification('Session expired. Please login again', 'error');
            setTimeout(() => window.location.href = '/login', 2000);
            return;
        }

        // Handle other errors
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Password change failed');
        }

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(data.message || 'Password change failed');
        }

        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        // Reset password strength UI
        document.getElementById('passwordStrength').className = 'password-strength';
        document.querySelector('.password-strength-fill').style.width = '0%';

        // Reset rules
        document.getElementById('ruleLength').className = '';
        document.getElementById('ruleUppercase').className = '';
        document.getElementById('ruleNumber').className = '';
        document.getElementById('ruleSpecial').className = '';

        // Show success notification
        showNotification('Password updated successfully!', 'success');

    } catch (error) {
        console.error('Password change error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        // Restore button state
        changeText.style.display = 'inline-block';
        spinner.style.display = 'none';
        changeBtn.disabled = false;
    }
}

// Check password strength
function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthBar = document.querySelector('.password-strength-fill');
    const strengthContainer = document.getElementById('passwordStrength');
    const rules = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Update rules display
    document.getElementById('ruleLength').className = rules.length ? 'valid' : '';
    document.getElementById('ruleUppercase').className = rules.uppercase ? 'valid' : '';
    document.getElementById('ruleNumber').className = rules.number ? 'valid' : '';
    document.getElementById('ruleSpecial').className = rules.special ? 'valid' : '';

    // Calculate strength
    const passed = Object.values(rules).filter(Boolean).length;
    let strength = 'weak';

    if (passed === 4) {
        strength = 'strong';
        strengthBar.style.width = '100%';
        strengthBar.style.backgroundColor = 'var(--success)';
    } else if (passed >= 2) {
        strength = 'medium';
        strengthBar.style.width = '66%';
        strengthBar.style.backgroundColor = 'var(--warning)';
    } else {
        strengthBar.style.width = '33%';
        strengthBar.style.backgroundColor = 'var(--error)';
    }

    strengthContainer.className = `password-strength ${strength}`;
}

// Handle file selection for avatar
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
        showNotification('Please select an image file', 'error');
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size exceeds 5MB limit', 'error');
        return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('uploadPreview').style.display = 'block';
        document.getElementById('uploadArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Upload photo
function uploadPhoto() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        showNotification('Please select a file first', 'error');
        return;
    }

    // Show progress bar
    const progressBar = document.getElementById('progressFill');
    const uploadProgress = document.getElementById('uploadProgress');
    uploadProgress.style.display = 'block';
    progressBar.style.width = '0%';

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);

            // Update avatar
            const previewImg = document.getElementById('previewImage').src;
            document.getElementById('profileAvatar').innerHTML = `<img src="${previewImg}" alt="Profile" style="width:100%;height:100%;border-radius:50%;">`;

            // Close modal after success
            setTimeout(() => {
                closeModal('avatarModal');
                showNotification('Profile photo updated successfully!', 'success');
            }, 500);
        }
    }, 200);
}

// Cancel upload
function cancelUpload() {
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
}

// Helper functions
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

function maskSensitiveData(data, visibleChars = 4) {
    if (!data) return '';
    if (data.length <= visibleChars) return data;
    return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Reset upload UI
    cancelUpload();
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('uploadMessage').textContent = '';
}

// Close modal when clicking outside of it
window.onclick = function (event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
            // Reset upload UI
            cancelUpload();
            document.getElementById('uploadProgress').style.display = 'none';
            document.getElementById('uploadMessage').textContent = '';
        }
    }
}