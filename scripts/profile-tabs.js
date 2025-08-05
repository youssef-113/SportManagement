// Profile Tabs JavaScript
document.addEventListener("DOMContentLoaded", () => {
    initializeProfileTabs();
    setupProfileEventListeners();
    loadProfileData();
});

function initializeProfileTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Add click event listeners to all tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Show the first tab by default
    if (tabButtons.length > 0) {
        const firstTab = tabButtons[0].getAttribute('data-tab');
        switchTab(firstTab);
    }
}

function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Remove active class from all buttons and contents
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Add active class to the selected button
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Show the corresponding content
    const activeContent = document.getElementById(`${tabName}-tab`);
    if (activeContent) {
        activeContent.classList.add('active');

        // Add fade-in animation
        activeContent.style.opacity = '0';
        activeContent.style.transform = 'translateY(10px)';

        setTimeout(() => {
            activeContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            activeContent.style.opacity = '1';
            activeContent.style.transform = 'translateY(0)';
        }, 50);
    }
}

function setupProfileEventListeners() {
    // Edit personal information
    const editPersonalBtn = document.getElementById('editPersonalBtn');
    const cancelPersonalEdit = document.getElementById('cancelPersonalEdit');
    const savePersonalBtn = document.getElementById('savePersonal');
    const personalForm = document.getElementById('personalForm');
    const personalInfo = document.querySelectorAll('.info-grid .info-value');

    if (editPersonalBtn) {
        editPersonalBtn.addEventListener('click', () => {
            showEditForm(personalForm, personalInfo, editPersonalBtn);
        });
    }

    if (cancelPersonalEdit) {
        cancelPersonalEdit.addEventListener('click', () => {
            hideEditForm(personalForm, personalInfo, editPersonalBtn);
        });
    }

    if (savePersonalBtn) {
        savePersonalBtn.addEventListener('click', handleProfileUpdate);
    }

    // Password change functionality
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const newPasswordInput = document.getElementById('newPassword');
    const passwordStrength = document.getElementById('passwordStrength');

    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }

    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handlePasswordChange);
    }

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // User menu dropdown
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', toggleUserMenu);
    }
}

function showEditForm(form, infoElements, editBtn) {
    if (form) {
        form.style.display = 'block';
        form.style.opacity = '0';
        form.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            form.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            form.style.opacity = '1';
            form.style.transform = 'translateY(0)';
        }, 50);
    }

    infoElements.forEach(item => {
        if (item.parentElement) {
            item.parentElement.style.display = 'none';
        }
    });

    if (editBtn) {
        editBtn.style.display = 'none';
    }
}

function hideEditForm(form, infoElements, editBtn) {
    if (form) {
        form.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        form.style.opacity = '0';
        form.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            form.style.display = 'none';
        }, 300);
    }

    infoElements.forEach(item => {
        if (item.parentElement) {
            item.parentElement.style.display = 'block';
        }
    });

    if (editBtn) {
        editBtn.style.display = 'flex';
    }
}

function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const passwordStrength = document.getElementById('passwordStrength');

    if (!passwordStrength) return;

    let strength = 0;

    // Reset rules
    document.querySelectorAll('.password-rules li').forEach(li => {
        li.classList.remove('valid');
    });

    // Check password rules
    if (password.length >= 8) {
        const ruleLength = document.getElementById('ruleLength');
        if (ruleLength) {
            ruleLength.classList.add('valid');
            strength += 25;
        }
    }

    if (/[A-Z]/.test(password)) {
        const ruleUppercase = document.getElementById('ruleUppercase');
        if (ruleUppercase) {
            ruleUppercase.classList.add('valid');
            strength += 25;
        }
    }

    if (/\d/.test(password)) {
        const ruleNumber = document.getElementById('ruleNumber');
        if (ruleNumber) {
            ruleNumber.classList.add('valid');
            strength += 25;
        }
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        const ruleSpecial = document.getElementById('ruleSpecial');
        if (ruleSpecial) {
            ruleSpecial.classList.add('valid');
            strength += 25;
        }
    }

    // Update strength indicator
    passwordStrength.className = 'password-strength';
    if (strength < 50) {
        passwordStrength.classList.add('weak');
    } else if (strength < 75) {
        passwordStrength.classList.add('medium');
    } else {
        passwordStrength.classList.add('strong');
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();

    const formData = {
        full_name: document.getElementById('editFullName').value,
        phone_number: document.getElementById('editPhone').value,
        nationality: document.getElementById('editNationality').value,
        dob: document.getElementById('editDob').value,
        national_id: document.getElementById('editNationalId').value
    };

    // Validate form
    if (!validateProfileForm(formData)) {
        return;
    }

    try {
        showNotification('Updating profile...', 'info');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the display
        updateProfileDisplay(formData);

        // Hide form
        const personalForm = document.getElementById('personalForm');
        const personalInfo = document.querySelectorAll('.info-grid .info-value');
        const editPersonalBtn = document.getElementById('editPersonalBtn');

        hideEditForm(personalForm, personalInfo, editPersonalBtn);

        showNotification('Profile updated successfully!', 'success');

    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile. Please try again.', 'error');
    }
}

function validateProfileForm(data) {
    if (!data.full_name || data.full_name.trim() === '') {
        showNotification('Full name is required', 'error');
        return false;
    }

    if (data.phone_number && !isValidPhone(data.phone_number)) {
        showNotification('Please enter a valid phone number', 'error');
        return false;
    }

    if (data.dob && !isValidDate(data.dob)) {
        showNotification('Please enter a valid date of birth', 'error');
        return false;
    }

    return true;
}

async function handlePasswordChange() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all password fields', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }

    try {
        showNotification('Changing password...', 'info');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        showNotification('Password changed successfully!', 'success');

        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        const passwordStrength = document.getElementById('passwordStrength');
        if (passwordStrength) {
            passwordStrength.className = 'password-strength';
        }

        document.querySelectorAll('.password-rules li').forEach(li => {
            li.classList.remove('valid');
        });

    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Failed to change password. Please try again.', 'error');
    }
}

function updateProfileDisplay(data) {
    // Update profile header information
    const profileNameElement = document.getElementById('profileName');
    const profileEmailElement = document.getElementById('profileEmail');
    const profilePhoneElement = document.getElementById('profilePhone');
    const profileRoleElement = document.getElementById('profileRole');
    const profileAvatarElement = document.getElementById('profileAvatar');

    if (profileNameElement && data.full_name) {
        profileNameElement.textContent = data.full_name;
    }

    if (profileEmailElement && data.email) {
        profileEmailElement.textContent = data.email;
    }

    if (profilePhoneElement && data.phone_number) {
        profilePhoneElement.textContent = data.phone_number;
    }

    if (profileRoleElement && data.role) {
        profileRoleElement.textContent = data.role;
    }

    if (profileAvatarElement) {
        profileAvatarElement.innerHTML = `<i class="fas fa-user"></i>`;
    }

    // Update personal information display
    const fullNameElement = document.getElementById('fullName');
    const phoneElement = document.getElementById('phone');
    const nationalityElement = document.getElementById('nationality');
    const dobElement = document.getElementById('dob');
    const nationalIdElement = document.getElementById('nationalId');

    if (fullNameElement && data.full_name) {
        fullNameElement.textContent = data.full_name;
    }

    if (phoneElement && data.phone_number) {
        phoneElement.textContent = data.phone_number;
    }

    if (nationalityElement && data.nationality) {
        nationalityElement.textContent = data.nationality;
    }

    if (dobElement && data.dob) {
        dobElement.textContent = formatDate(data.dob);
    }

    if (nationalIdElement && data.national_id) {
        nationalIdElement.textContent = data.national_id;
    }
}

function loadProfileData() {
    // Load profile data from API or localStorage
    const savedData = localStorage.getItem('profileData');
    if (savedData) {
        const data = JSON.parse(savedData);
        updateProfileDisplay(data);
    } else {
        // Load default sample data
        const sampleData = getSampleUserData();
        updateProfileDisplay(sampleData);
        localStorage.setItem('profileData', JSON.stringify(sampleData));
    }

    // Load tab-specific data
    loadTabData();
}

function loadTabData() {
    // Load medical data
    loadMedicalData();

    // Load training data
    loadTrainingData();

    // Load schedule data
    loadScheduleData();
}

function loadMedicalData() {
    const medicalData = [
        { date: '2023-03-12', diagnosis: 'Minor Ankle Sprain', treatment: 'Rest, Ice, Compression, Elevation', status: 'Recovered' },
        { date: '2022-11-05', diagnosis: 'Shoulder Strain', treatment: 'Physical Therapy', status: 'Recovered' },
        { date: '2022-06-20', diagnosis: 'Knee Inflammation', treatment: 'Anti-inflammatory medication', status: 'Recovered' },
        { date: '2021-09-15', diagnosis: 'Concussion', treatment: 'Rest, Cognitive Therapy', status: 'Recovered' }
    ];

    updateMedicalTable(medicalData);
}

function loadTrainingData() {
    const trainingData = [
        { date: '2023-06-15', sessionType: 'Goalkeeping', drills: 'Reflex Training, Crosses', coach: 'Michelle Alves', rating: '8.5' },
        { date: '2023-06-14', sessionType: 'Strength', drills: 'Upper Body, Core', coach: 'Ricardo Ferreira', rating: '8.0' },
        { date: '2023-06-13', sessionType: 'Tactical', drills: 'Defensive Positioning', coach: 'Marcelo Gallardo', rating: '9.0' },
        { date: '2023-06-12', sessionType: 'Recovery', drills: 'Pool Session, Stretching', coach: 'Ricardo Ferreira', rating: '8.0' }
    ];

    updateTrainingTable(trainingData);
}

function loadScheduleData() {
    const scheduleData = [
        { date: '2023-06-18', time: '18:00', event: 'Training Session', location: 'Main Training Ground', type: 'Training' },
        { date: '2023-06-19', time: '10:00', event: 'Medical Checkup', location: 'Medical Center', type: 'Medical' },
        { date: '2023-06-20', time: '20:00', event: 'Match vs Zamalek', location: 'Cairo International Stadium', type: 'Match' },
        { date: '2023-06-22', time: '16:00', event: 'Team Meeting', location: 'Conference Room', type: 'Meeting' }
    ];

    updateScheduleTable(scheduleData);
}

function updateMedicalTable(data) {
    const tbody = document.querySelector('#medical-tab .info-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(item.date)}</td>
                <td>${item.diagnosis}</td>
                <td>${item.treatment}</td>
                <td>${item.status}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

function updateTrainingTable(data) {
    const tbody = document.querySelector('#training-tab .info-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(item.date)}</td>
                <td>${item.sessionType}</td>
                <td>${item.drills}</td>
                <td>${item.coach}</td>
                <td>${item.rating}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

function updateScheduleTable(data) {
    const tbody = document.querySelector('#schedule-tab .info-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(item.date)}</td>
                <td>${item.time}</td>
                <td>${item.event}</td>
                <td>${item.location}</td>
                <td>${item.type}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

function getSampleUserData() {
    return {
        full_name: 'Youssef Bassiony',
        email: 'm.elshenawy@alahly.com',
        phone_number: '+20 100 123 4567',
        nationality: 'Egyptian',
        dob: '1988-12-18',
        national_id: '28812181234567',
        gender: 'Male',
        role: 'Player',
        sport: 'Football',
        position: 'Goalkeeper',
        teamID: 'First Team',
        joinDate: '2016-07-15',
        contractStart: '2022-07-01',
        contractEnd: '2025-06-30',
        playerHeight: '191',
        playerWeight: '88',
        lastCheckup: '2023-05-15',
        medicalStatus: 'Fit to Play',
        treatment: 'None',
        nextAppointment: '2023-06-30'
    };
}

// Utility functions
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function formatDate(dateString) {
    if (!dateString) return 'Not provided';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'block';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
}

function toggleUserMenu() {
    const dropdown = document.querySelector('.dropdown-menu');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Initialize theme on page load
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    }
}

// Avatar upload modal function
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Reset modal state
        resetUploadModal();

        // Setup drag and drop
        setupDragAndDrop();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetUploadModal();
    }
}

function resetUploadModal() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadPreview = document.getElementById('uploadPreview');
    const fileInput = document.getElementById('fileInput');
    const uploadMessage = document.querySelector('.upload-message');

    if (uploadArea) uploadArea.style.display = 'block';
    if (uploadPreview) uploadPreview.style.display = 'none';
    if (fileInput) fileInput.value = '';
    if (uploadMessage) uploadMessage.style.display = 'none';

    // Remove dragover class
    if (uploadArea) uploadArea.classList.remove('dragover');
}

function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    if (!uploadArea || !fileInput) return;

    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file
    if (!validateFile(file)) {
        return;
    }

    // Show preview
    showFilePreview(file);
}

function validateFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
        showUploadMessage('Please select a valid image file (JPG, PNG, GIF)', 'error');
        return false;
    }

    if (file.size > maxSize) {
        showUploadMessage('File size must be less than 5MB', 'error');
        return false;
    }

    return true;
}

function showFilePreview(file) {
    const uploadArea = document.getElementById('uploadArea');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');

    if (!uploadArea || !uploadPreview || !previewImage) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        uploadPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function cancelUpload() {
    resetUploadModal();
}

function uploadPhoto() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        showUploadMessage('Please select a file first', 'error');
        return;
    }

    // Show progress
    showUploadProgress();

    // Simulate upload process
    simulateUpload(file);
}

function showUploadProgress() {
    const progressBar = document.querySelector('.upload-progress');
    const progressFill = document.querySelector('.upload-progress-fill');

    if (progressBar && progressFill) {
        progressBar.style.display = 'block';
        progressFill.style.width = '0%';

        // Animate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    progressBar.style.display = 'none';
                    completeUpload();
                }, 500);
            }
            progressFill.style.width = progress + '%';
        }, 200);
    }
}

function simulateUpload(file) {
    // In a real application, you would send the file to your server here
    // For now, we'll simulate the upload process

    setTimeout(() => {
        // Update the profile avatar
        updateProfileAvatar(file);
        showUploadMessage('Photo uploaded successfully!', 'success');

        setTimeout(() => {
            closeModal('avatarModal');
        }, 1500);
    }, 2000);
}

function updateProfileAvatar(file) {
    const profileAvatar = document.getElementById('profileAvatar');
    const reader = new FileReader();

    reader.onload = function (e) {
        if (profileAvatar) {
            profileAvatar.innerHTML = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            profileAvatar.appendChild(img);
        }
    };

    reader.readAsDataURL(file);
}

function showUploadMessage(message, type) {
    const existingMessage = document.querySelector('.upload-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `upload-message ${type}`;
    messageDiv.textContent = message;

    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
        modalBody.appendChild(messageDiv);
        messageDiv.style.display = 'block';
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('avatarModal');
    if (e.target === modal) {
        closeModal('avatarModal');
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal('avatarModal');
    }
});

// Call theme initialization
initializeTheme(); 