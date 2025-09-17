// Admission Form JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Material Design components
    initializeMaterialComponents();
    
    // Initialize admission form
    initializeAdmissionForm();
});

// Initialize all Material Design components
function initializeMaterialComponents() {
    // Initialize sidenav for mobile
    var sidenavElems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenavElems);
    
    // Initialize select dropdowns with better positioning
    var selectElems = document.querySelectorAll('select');
    M.FormSelect.init(selectElems, {
        dropdownOptions: {
            container: document.body,
            constrainWidth: false,
            coverTrigger: false,
            alignment: 'left'
        }
    });
    
    // Initialize tooltips
    var tooltipElems = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(tooltipElems);
    
    // Initialize date picker
    var datepickerElems = document.querySelectorAll('.datepicker');
    M.Datepicker.init(datepickerElems, {
        maxDate: new Date(),
        yearRange: 20,
        format: 'yyyy-mm-dd',
        showClearBtn: true
    });
    
    // Fix dropdown positioning issues
    fixDropdownPositioning();
}

// Fix dropdown positioning to prevent overlap
function fixDropdownPositioning() {
    const selectWrappers = document.querySelectorAll('.select-wrapper');
    
    selectWrappers.forEach(wrapper => {
        const input = wrapper.querySelector('input.select-dropdown');
        if (input) {
            input.addEventListener('click', function() {
                setTimeout(() => {
                    const dropdown = wrapper.querySelector('.dropdown-content');
                    if (dropdown && dropdown.style.display !== 'none') {
                        // Calculate optimal position
                        const rect = wrapper.getBoundingClientRect();
                        const dropdownHeight = dropdown.offsetHeight;
                        const viewportHeight = window.innerHeight;
                        const spaceBelow = viewportHeight - rect.bottom;
                        const spaceAbove = rect.top;
                        
                        // Position dropdown based on available space
                        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                            dropdown.style.top = 'auto';
                            dropdown.style.bottom = '100%';
                            dropdown.style.marginBottom = '5px';
                            dropdown.style.marginTop = '0';
                        } else {
                            dropdown.style.top = '100%';
                            dropdown.style.bottom = 'auto';
                            dropdown.style.marginTop = '5px';
                            dropdown.style.marginBottom = '0';
                        }
                        
                        // Ensure proper z-index
                        dropdown.style.zIndex = '10000';
                        dropdown.style.position = 'absolute';
                    }
                }, 10);
            });
        }
    });
}

// Initialize admission form functionality
function initializeAdmissionForm() {
    const admissionForm = document.querySelector('#admission-form');
    
    if (admissionForm) {
        // Add real-time validation
        addRealTimeValidation();
        
        admissionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const applicationData = {};
            
            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                applicationData[key] = value.trim();
            }
            
            // Validation
            if (!validateAdmissionForm(applicationData)) {
                return;
            }
            
            // Add submission timestamp and application ID
            applicationData.submission_date = new Date().toISOString();
            applicationData.application_id = generateApplicationId();
            applicationData.status = 'Pending Review';
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="material-icons">refresh</i> Submitting...';
            submitBtn.disabled = true;
            
            // Save application to localStorage (simulating database)
            saveAdmissionApplication(applicationData);
            
            // Show success message and redirect
            setTimeout(() => {
                M.toast({html: 'Application submitted successfully!', classes: 'green'});
                
                // Show application ID modal
                showApplicationSuccessModal(applicationData.application_id);
                
                // Reset form
                this.reset();
                M.FormSelect.init(document.querySelectorAll('select'));
                
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
            }, 2000);
        });
    }
}

// Add real-time validation to form fields
function addRealTimeValidation() {
    // Email validation
    const emailField = document.getElementById('guardian_email');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.classList.add('invalid');
                this.classList.remove('valid');
            } else if (this.value) {
                this.classList.remove('invalid');
                this.classList.add('valid');
            }
        });
    }
    
    // Phone validation
    const phoneField = document.getElementById('guardian_phone');
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            // Allow only numbers, spaces, hyphens, parentheses, and plus sign
            this.value = this.value.replace(/[^+\d\s\-\(\)]/g, '');
        });
        
        phoneField.addEventListener('blur', function() {
            const cleanPhone = this.value.replace(/\D/g, '');
            if (this.value && (cleanPhone.length < 10 || cleanPhone.length > 15)) {
                this.classList.add('invalid');
                this.classList.remove('valid');
            } else if (this.value) {
                this.classList.remove('invalid');
                this.classList.add('valid');
            }
        });
    }
    
    // PIN code validation
    const pincodeField = document.getElementById('pincode');
    if (pincodeField) {
        pincodeField.addEventListener('input', function() {
            // Allow only numbers
            this.value = this.value.replace(/\D/g, '');
            // Limit to 6 digits
            if (this.value.length > 6) {
                this.value = this.value.substring(0, 6);
            }
        });
        
        pincodeField.addEventListener('blur', function() {
            if (this.value && this.value.length !== 6) {
                this.classList.add('invalid');
                this.classList.remove('valid');
            } else if (this.value) {
                this.classList.remove('invalid');
                this.classList.add('valid');
            }
        });
    }
    
    // Name field validation (no numbers)
    const nameFields = ['student_name', 'father_name', 'mother_name'];
    nameFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                // Remove numbers and special characters, allow letters and spaces
                this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
            });
            
            field.addEventListener('blur', function() {
                if (this.value && this.value.trim().length < 2) {
                    this.classList.add('invalid');
                    this.classList.remove('valid');
                } else if (this.value) {
                    this.classList.remove('invalid');
                    this.classList.add('valid');
                }
            });
        }
    });
    
    // Age validation for date of birth
    const dobField = document.getElementById('date_of_birth');
    if (dobField) {
        dobField.addEventListener('change', function() {
            if (this.value) {
                const dob = new Date(this.value);
                const today = new Date();
                const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
                
                if (dob >= today) {
                    this.classList.add('invalid');
                    this.classList.remove('valid');
                    M.toast({html: 'Date of birth must be in the past', classes: 'orange'});
                } else if (age < 2 || age > 18) {
                    this.classList.add('invalid');
                    this.classList.remove('valid');
                    M.toast({html: `Age should be between 2-18 years (Currently: ${age} years)`, classes: 'orange'});
                } else {
                    this.classList.remove('invalid');
                    this.classList.add('valid');
                    M.toast({html: `Student age: ${age} years`, classes: 'blue'});
                }
            }
        });
    }
    
    // Required field validation on blur
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (!this.value || this.value.trim() === '') {
                this.classList.add('invalid');
                this.classList.remove('valid');
            } else {
                this.classList.remove('invalid');
                this.classList.add('valid');
            }
        });
    });
}

// Validate admission form
function validateAdmissionForm(data) {
    let isValid = true;
    const errors = [];

    // Check required fields
    const requiredFields = [
        { field: 'student_name', name: 'Student Name' },
        { field: 'date_of_birth', name: 'Date of Birth' },
        { field: 'gender', name: 'Gender' },
        { field: 'class_applying', name: 'Class Applying For' },
        { field: 'father_name', name: 'Father\'s Name' },
        { field: 'mother_name', name: 'Mother\'s Name' },
        { field: 'guardian_phone', name: 'Contact Number' },
        { field: 'guardian_email', name: 'Email Address' },
        { field: 'address', name: 'Address' },
        { field: 'city', name: 'City' },
        { field: 'state', name: 'State' },
        { field: 'pincode', name: 'PIN Code' },
        { field: 'declaration', name: 'Declaration' }
    ];
    
    // Validate required fields
    for (let fieldInfo of requiredFields) {
        const fieldValue = data[fieldInfo.field];
        const fieldElement = document.getElementById(fieldInfo.field);
        
        if (!fieldValue || fieldValue === '' || fieldValue === 'on') {
            // Special handling for checkbox
            if (fieldInfo.field === 'declaration' && !fieldValue) {
                errors.push(`Please accept the ${fieldInfo.name}`);
                isValid = false;
                continue;
            }
            
            if (fieldValue === '' || !fieldValue) {
                errors.push(`${fieldInfo.name} is required`);
                isValid = false;
                
                // Add visual feedback
                if (fieldElement) {
                    fieldElement.classList.add('invalid');
                    const label = fieldElement.nextElementSibling;
                    if (label && label.classList.contains('required-field')) {
                        label.classList.add('error');
                        setTimeout(() => label.classList.remove('error'), 3000);
                    }
                }
            }
        } else {
            // Remove invalid class if field is now valid
            if (fieldElement) {
                fieldElement.classList.remove('invalid');
                fieldElement.classList.add('valid');
            }
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.guardian_email && !emailRegex.test(data.guardian_email)) {
        errors.push('Please enter a valid email address');
        isValid = false;
        
        const emailField = document.getElementById('guardian_email');
        if (emailField) {
            emailField.classList.add('invalid');
        }
    }
    
    // Validate phone number
    const cleanPhone = data.guardian_phone ? data.guardian_phone.replace(/\D/g, '') : '';
    if (data.guardian_phone && (cleanPhone.length < 10 || cleanPhone.length > 15)) {
        errors.push('Please enter a valid phone number (10-15 digits)');
        isValid = false;
        
        const phoneField = document.getElementById('guardian_phone');
        if (phoneField) {
            phoneField.classList.add('invalid');
        }
    }
    
    // Validate PIN code
    const pinRegex = /^[0-9]{6}$/;
    if (data.pincode && !pinRegex.test(data.pincode)) {
        errors.push('Please enter a valid 6-digit PIN code');
        isValid = false;
        
        const pincodeField = document.getElementById('pincode');
        if (pincodeField) {
            pincodeField.classList.add('invalid');
        }
    }
    
    // Validate date of birth (should be in the past)
    if (data.date_of_birth) {
        const dob = new Date(data.date_of_birth);
        const today = new Date();
        
        if (dob >= today) {
            errors.push('Date of birth must be in the past');
            isValid = false;
        } else {
            // Calculate age
            const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 2 || age > 18) {
                errors.push('Student age should be between 2 and 18 years');
                isValid = false;
            }
        }
        
        if (!isValid) {
            const dobField = document.getElementById('date_of_birth');
            if (dobField) {
                dobField.classList.add('invalid');
            }
        }
    }
    
    // Show validation errors
    if (!isValid) {
        const errorMessage = errors.length > 1 
            ? `Please fix the following errors:\n• ${errors.join('\n• ')}`
            : errors[0];
        
        M.toast({
            html: `<i class="material-icons left">error</i>${errorMessage}`, 
            classes: 'red darken-2',
            displayLength: 6000
        });
        
        // Scroll to first invalid field
        const firstInvalidField = document.querySelector('.invalid');
        if (firstInvalidField) {
            firstInvalidField.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            firstInvalidField.focus();
        }
    }
    
    return isValid;
}

// Generate unique application ID
function generateApplicationId() {
    const prefix = 'SAIEC';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${randomNum}`;
}

// Save admission application to localStorage
function saveAdmissionApplication(applicationData) {
    try {
        // Get existing applications
        let applications = JSON.parse(localStorage.getItem('admissionApplications')) || [];
        
        // Add new application
        applications.push(applicationData);
        
        // Save back to localStorage
        localStorage.setItem('admissionApplications', JSON.stringify(applications));
        
        console.log('Application saved successfully:', applicationData.application_id);
        
    } catch (error) {
        console.error('Error saving application:', error);
        M.toast({html: 'Error saving application. Please try again.', classes: 'red'});
    }
}

// Show application success modal
function showApplicationSuccessModal(applicationId) {
    const modalHtml = `
        <div id="success-modal" class="modal">
            <div class="modal-content center-align">
                <i class="material-icons large green-text">check_circle</i>
                <h4>Application Submitted Successfully!</h4>
                <p>Your application ID is:</p>
                <h5 class="teal-text"><strong>${applicationId}</strong></h5>
                <p>Please save this ID for future reference. We will contact you within 3-5 working days.</p>
                <div class="row" style="margin-top: 30px;">
                    <div class="col s12">
                        <button class="btn waves-effect waves-light" onclick="copyApplicationId('${applicationId}')">
                            <i class="material-icons left">content_copy</i>Copy Application ID
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-close btn-flat">Close</button>
                <a href="index.html" class="btn waves-effect waves-light">
                    <i class="material-icons left">home</i>Back to Home
                </a>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.querySelector('#success-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Initialize and open modal
    const modal = document.querySelector('#success-modal');
    const modalInstance = M.Modal.init(modal, {
        dismissible: false,
        onCloseEnd: function() {
            modal.remove();
        }
    });
    modalInstance.open();
}

// Copy application ID to clipboard
function copyApplicationId(applicationId) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(applicationId).then(() => {
            M.toast({html: 'Application ID copied to clipboard!', classes: 'green'});
        }).catch(() => {
            M.toast({html: 'Unable to copy. Please note down the ID manually.', classes: 'orange'});
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = applicationId;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            M.toast({html: 'Application ID copied to clipboard!', classes: 'green'});
        } catch (err) {
            M.toast({html: 'Unable to copy. Please note down the ID manually.', classes: 'orange'});
        }
        document.body.removeChild(textArea);
    }
}

// Calculate and display age based on date of birth
document.addEventListener('DOMContentLoaded', function() {
    const dobInput = document.querySelector('#date_of_birth');
    if (dobInput) {
        dobInput.addEventListener('change', function() {
            const dob = new Date(this.value);
            const today = new Date();
            const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
            
            if (age > 0 && age < 100) {
                M.toast({html: `Student age: ${age} years`, classes: 'blue'});
            }
        });
    }
});