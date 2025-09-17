// SAIEC Website JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Material Design components
    initializeMaterialComponents();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize admin functionality
    initializeAdmin();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize gallery
    initializeGallery();
});

// Initialize all Material Design components
function initializeMaterialComponents() {
    // Initialize sidenav for mobile
    var sidenavElems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenavElems);
    
    // Initialize tabs
    var tabElems = document.querySelectorAll('.tabs');
    M.Tabs.init(tabElems);
    
    // Initialize select dropdowns
    var selectElems = document.querySelectorAll('select');
    M.FormSelect.init(selectElems);
    
    // Initialize material box for gallery images
    var materialboxElems = document.querySelectorAll('.materialboxed');
    M.Materialbox.init(materialboxElems);
    
    // Initialize tooltips
    var tooltipElems = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(tooltipElems);
}

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile sidenav if open
                const sidenavInstance = M.Sidenav.getInstance(document.querySelector('.sidenav'));
                if (sidenavInstance) {
                    sidenavInstance.close();
                }
            }
        });
    });
    
    // Active section highlighting
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop && scrollY <= sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// Admin functionality
function initializeAdmin() {
    let students = JSON.parse(localStorage.getItem('saiec_students')) || [];
    let isLoggedIn = sessionStorage.getItem('saiec_admin_logged_in') === 'true';
    
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLogin = document.getElementById('admin-login');
    const adminDashboard = document.getElementById('admin-dashboard');
    const studentForm = document.getElementById('student-form');
    const logoutBtn = document.getElementById('logout-btn');
    const paymentStatusSelect = document.getElementById('payment-status');
    const balanceField = document.getElementById('balance-field');
    
    // Check if already logged in
    if (isLoggedIn) {
        showAdminDashboard();
    }
    
    // Admin login form submission
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        
        // Simple authentication (in real application, use proper backend authentication)
        if (username === 'admin' && password === 'saiec2025') {
            sessionStorage.setItem('saiec_admin_logged_in', 'true');
            showAdminDashboard();
            M.toast({html: 'Login successful!', classes: 'green'});
        } else {
            M.toast({html: 'Invalid credentials!', classes: 'red'});
        }
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('saiec_admin_logged_in');
        hideAdminDashboard();
        M.toast({html: 'Logged out successfully!', classes: 'blue'});
    });
    
    // Payment status change handler
    paymentStatusSelect.addEventListener('change', function() {
        if (this.value === 'Partially Paid') {
            balanceField.style.display = 'block';
        } else {
            balanceField.style.display = 'none';
            document.getElementById('balance-amount').value = '';
        }
    });
    
    // Student form submission
    studentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const studentData = {
            id: Date.now(), // Simple ID generation
            admissionNumber: document.getElementById('admission-number').value,
            name: document.getElementById('student-name').value,
            dateOfBirth: document.getElementById('date-of-birth').value,
            guardianName: document.getElementById('guardian-name').value,
            admissionDate: document.getElementById('admission-date').value,
            studentClass: document.getElementById('student-class').value,
            admissionFee: parseFloat(document.getElementById('admission-fee').value),
            paymentStatus: document.getElementById('payment-status').value,
            balanceAmount: document.getElementById('balance-amount').value ? 
                          parseFloat(document.getElementById('balance-amount').value) : 0
        };
        
        // Validation
        if (students.some(student => student.admissionNumber === studentData.admissionNumber)) {
            M.toast({html: 'Admission number already exists!', classes: 'red'});
            return;
        }
        
        students.push(studentData);
        localStorage.setItem('saiec_students', JSON.stringify(students));
        
        // Reset form
        studentForm.reset();
        M.FormSelect.init(document.querySelectorAll('select'));
        balanceField.style.display = 'none';
        
        // Refresh students table
        displayStudents();
        
        M.toast({html: 'Student added successfully!', classes: 'green'});
    });
    
    function showAdminDashboard() {
        adminLogin.style.display = 'none';
        adminDashboard.style.display = 'block';
        displayStudents();
    }
    
    function hideAdminDashboard() {
        adminLogin.style.display = 'block';
        adminDashboard.style.display = 'none';
        adminLoginForm.reset();
    }
    
    function displayStudents() {
        const studentsTable = document.getElementById('students-table');
        const studentCount = document.getElementById('student-count');
        studentsTable.innerHTML = '';
        
        if (studentCount) {
            studentCount.textContent = students.length;
        }
        
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.admissionNumber}</td>
                <td>${student.name}</td>
                <td>${student.studentClass}</td>
                <td>${student.guardianName}</td>
                <td>
                    <span class="chip ${student.paymentStatus === 'Full Paid' ? 'green' : 'orange'} white-text">
                        ${student.paymentStatus}
                    </span>
                </td>
                <td>${student.balanceAmount > 0 ? '₹' + student.balanceAmount : '-'}</td>
                <td>
                    <button class="btn-small red waves-effect waves-light" onclick="deleteStudent(${student.id})" title="Delete Student">
                        <i class="material-icons">delete</i>
                    </button>
                    <button class="btn-small blue waves-effect waves-light" onclick="editStudent(${student.id})" title="Edit Student">
                        <i class="material-icons">edit</i>
                    </button>
                </td>
            `;
            studentsTable.appendChild(row);
        });
    }
    
    // Global functions for student management
    window.deleteStudent = function(id) {
        if (confirm('Are you sure you want to delete this student record?')) {
            students = students.filter(student => student.id !== id);
            localStorage.setItem('saiec_students', JSON.stringify(students));
            displayStudents();
            M.toast({html: 'Student record deleted!', classes: 'red'});
        }
    };
    
    window.editStudent = function(id) {
        const student = students.find(s => s.id === id);
        if (student) {
            // Populate form with student data
            document.getElementById('admission-number').value = student.admissionNumber;
            document.getElementById('student-name').value = student.name;
            document.getElementById('date-of-birth').value = student.dateOfBirth;
            document.getElementById('guardian-name').value = student.guardianName;
            document.getElementById('admission-date').value = student.admissionDate;
            document.getElementById('student-class').value = student.studentClass;
            document.getElementById('admission-fee').value = student.admissionFee;
            document.getElementById('payment-status').value = student.paymentStatus;
            document.getElementById('balance-amount').value = student.balanceAmount;
            
            // Show balance field if partially paid
            if (student.paymentStatus === 'Partially Paid') {
                balanceField.style.display = 'block';
            }
            
            // Re-initialize select elements
            M.FormSelect.init(document.querySelectorAll('select'));
            M.updateTextFields();
            
            // Remove the student from array temporarily (will be re-added on form submit)
            students = students.filter(s => s.id !== id);
            localStorage.setItem('saiec_students', JSON.stringify(students));
            displayStudents();
            
            // Scroll to form
            document.querySelector('#student-form').scrollIntoView({ behavior: 'smooth' });
        }
    };
}

// Animation functionality
function initializeAnimations() {
    // Fade in elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all cards and sections
    document.querySelectorAll('.card, .section').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-section');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Gallery functionality
function initializeGallery() {
    // Add lazy loading to gallery images
    const galleryImages = document.querySelectorAll('.card-image img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    galleryImages.forEach(img => imageObserver.observe(img));
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name')?.trim();
            const email = formData.get('email')?.trim();
            const phone = formData.get('phone')?.trim();
            const message = formData.get('message')?.trim();
            
            // Validation
            if (!name || !email || !phone || !message) {
                M.toast({html: 'Please fill in all required fields!', classes: 'red'});
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                M.toast({html: 'Please enter a valid email address!', classes: 'red'});
                return;
            }
            
            // Phone number validation
            const cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.length < 7 || cleanPhone.length > 15) {
                M.toast({html: 'Please enter a valid phone number (7-15 digits)!', classes: 'red'});
                return;
            }
            
            if (/^(.)\1+$/.test(cleanPhone)) {
                M.toast({html: 'Please enter a valid phone number!', classes: 'red'});
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="material-icons">refresh</i> Sending...';
            submitBtn.disabled = true;
            
            // Prepare email content
            const emailSubject = `New Contact Form Message from ${name}`;
            const emailBody = `Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

---
Sent from SAIEC Website Contact Form`;
            
            // Create mailto link
            const mailtoLink = `mailto:saiecdharmagarh@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            
            // Try to send email
            try {
                // Open email client
                window.open(mailtoLink, '_blank');
                
                // Show success message
                setTimeout(() => {
                    M.toast({html: 'Email client opened! Please send the email to complete your message.', classes: 'green'});
                    this.reset();
                    
                    // Reset button
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }, 1000);
                
            } catch (error) {
                console.error('Error opening email client:', error);
                
                // Fallback: Copy to clipboard
                const textToCopy = `To: saiecdharmagarh@gmail.com
Subject: ${emailSubject}

${emailBody}`;
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        M.toast({html: 'Email details copied to clipboard! Please paste in your email client.', classes: 'orange'});
                    }).catch(() => {
                        showEmailModal(emailSubject, emailBody);
                    });
                } else {
                    showEmailModal(emailSubject, emailBody);
                }
                
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Show email modal when other methods fail
function showEmailModal(subject, body) {
    const modalHtml = `
        <div id="email-modal" class="modal">
            <div class="modal-content">
                <h4><i class="material-icons left">email</i>Send Email Manually</h4>
                <p>Please copy the information below and send it to <strong>saiecdharmagarh@gmail.com</strong>:</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #26a69a;">
                    <p><strong>To:</strong> saiecdharmagarh@gmail.com</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <pre style="white-space: pre-wrap; font-family: inherit;">${body}</pre>
                </div>
                <div class="center-align">
                    <button class="btn waves-effect waves-light" onclick="copyEmailContent('${subject}', '${body.replace(/'/g, "\\'")}')">
                        <i class="material-icons left">content_copy</i>Copy Email Content
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-close btn-flat">Close</button>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.querySelector('#email-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Initialize and open modal
    const modal = document.querySelector('#email-modal');
    const modalInstance = M.Modal.init(modal, {
        dismissible: true,
        onCloseEnd: function() {
            modal.remove();
        }
    });
    modalInstance.open();
}

// Copy email content function
function copyEmailContent(subject, body) {
    const textToCopy = `To: saiecdharmagarh@gmail.com
Subject: ${subject}

${body}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            M.toast({html: 'Email content copied to clipboard!', classes: 'green'});
        }).catch(() => {
            M.toast({html: 'Unable to copy. Please select and copy manually.', classes: 'orange'});
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            M.toast({html: 'Email content copied to clipboard!', classes: 'green'});
        } catch (err) {
            M.toast({html: 'Unable to copy. Please select and copy manually.', classes: 'orange'});
        }
        document.body.removeChild(textArea);
    }
}

// Utility functions
function showLoading(element) {
    element.innerHTML = '<div class="loading"></div>';
}

function hideLoading(element, originalContent) {
    element.innerHTML = originalContent;
}

// Search functionality for admin dashboard
function searchStudents() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const rows = document.querySelectorAll('#students-table tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Export functionality for admin
function exportStudentsData() {
    const students = JSON.parse(localStorage.getItem('saiec_students')) || [];
    
    if (students.length === 0) {
        M.toast({html: 'No student data to export!', classes: 'orange'});
        return;
    }
    
    // Convert to CSV
    const headers = ['Admission Number', 'Name', 'Date of Birth', 'Guardian Name', 'Admission Date', 'Class', 'Admission Fee', 'Payment Status', 'Balance Amount'];
    const csvContent = [
        headers.join(','),
        ...students.map(student => [
            student.admissionNumber,
            student.name,
            student.dateOfBirth,
            student.guardianName,
            student.admissionDate,
            student.studentClass,
            student.admissionFee,
            student.paymentStatus,
            student.balanceAmount
        ].join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saiec_students_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    M.toast({html: 'Student data exported successfully!', classes: 'green'});
}

// Print functionality for admin
function printStudentList() {
    const students = JSON.parse(localStorage.getItem('saiec_students')) || [];
    
    if (students.length === 0) {
        M.toast({html: 'No student data to print!', classes: 'orange'});
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const printContent = `
        <html>
        <head>
            <title>SAIEC Student List</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #26a69a; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #26a69a; color: white; }
                .header { text-align: center; margin-bottom: 30px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Sri Aurobindo Integral Education Centre (SAIEC)</h1>
                <p>Student List - Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Admission No.</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Guardian</th>
                        <th>Payment Status</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => `
                        <tr>
                            <td>${student.admissionNumber}</td>
                            <td>${student.name}</td>
                            <td>${student.studentClass}</td>
                            <td>${student.guardianName}</td>
                            <td>${student.paymentStatus}</td>
                            <td>${student.balanceAmount > 0 ? '₹' + student.balanceAmount : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
    
    // Initialize admission applications management if on main page
    if (document.getElementById('applications-table')) {
        initializeAdmissionApplications();
    }
});

// Admission Applications Management
function initializeAdmissionApplications() {
    displayAdmissionApplications();
    
    // Refresh applications every 30 seconds
    setInterval(displayAdmissionApplications, 30000);
}

// Display admission applications in admin dashboard
function displayAdmissionApplications() {
    try {
        const applications = JSON.parse(localStorage.getItem('admissionApplications')) || [];
        const applicationsTable = document.getElementById('applications-table');
        const applicationsCount = document.getElementById('applications-count');
        
        if (!applicationsTable || !applicationsCount) return;
        
        // Update count
        applicationsCount.textContent = `${applications.length} Application${applications.length !== 1 ? 's' : ''}`;
        
        // Clear existing rows
        applicationsTable.innerHTML = '';
        
        if (applications.length === 0) {
            applicationsTable.innerHTML = `
                <tr>
                    <td colspan="7" class="center-align grey-text">
                        <i class="material-icons">inbox</i><br>
                        No admission applications yet
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort applications by submission date (newest first)
        applications.sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));
        
        applications.forEach(application => {
            const row = document.createElement('tr');
            const submissionDate = new Date(application.submission_date).toLocaleDateString();
            const statusColor = getStatusColor(application.status);
            
            row.innerHTML = `
                <td>
                    <span class="tooltipped" data-position="top" data-tooltip="Click to copy">
                        <code style="cursor: pointer;" onclick="copyToClipboard('${application.application_id}')">
                            ${application.application_id}
                        </code>
                    </span>
                </td>
                <td>${application.student_name}</td>
                <td>${application.class_applying}</td>
                <td>
                    <div>
                        <i class="material-icons tiny">phone</i> ${application.guardian_phone}
                    </div>
                    <div>
                        <i class="material-icons tiny">email</i> ${application.guardian_email}
                    </div>
                </td>
                <td>${submissionDate}</td>
                <td>
                    <span class="chip ${statusColor} white-text">
                        ${application.status}
                    </span>
                </td>
                <td>
                    <button class="btn-small blue waves-effect waves-light tooltipped" 
                            data-position="top" data-tooltip="View Details"
                            onclick="viewApplicationDetails('${application.application_id}')">
                        <i class="material-icons">visibility</i>
                    </button>
                    <button class="btn-small green waves-effect waves-light tooltipped" 
                            data-position="top" data-tooltip="Update Status"
                            onclick="updateApplicationStatus('${application.application_id}')">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="btn-small red waves-effect waves-light tooltipped" 
                            data-position="top" data-tooltip="Delete Application"
                            onclick="deleteApplication('${application.application_id}')">
                        <i class="material-icons">delete</i>
                    </button>
                </td>
            `;
            applicationsTable.appendChild(row);
        });
        
        // Reinitialize tooltips
        M.Tooltip.init(document.querySelectorAll('.tooltipped'));
        
    } catch (error) {
        console.error('Error displaying applications:', error);
    }
}

// Get status color based on application status
function getStatusColor(status) {
    switch (status) {
        case 'Pending Review': return 'orange';
        case 'Approved': return 'green';
        case 'Rejected': return 'red';
        case 'Waitlisted': return 'blue';
        default: return 'grey';
    }
}

// View application details
function viewApplicationDetails(applicationId) {
    try {
        const applications = JSON.parse(localStorage.getItem('admissionApplications')) || [];
        const application = applications.find(app => app.application_id === applicationId);
        
        if (!application) {
            M.toast({html: 'Application not found!', classes: 'red'});
            return;
        }
        
        const modalHtml = `
            <div id="application-details-modal" class="modal modal-fixed-footer">
                <div class="modal-content">
                    <h4>Application Details</h4>
                    <div class="row">
                        <div class="col s12">
                            <div class="card">
                                <div class="card-content">
                                    <span class="card-title">
                                        ${application.student_name}
                                        <span class="chip ${getStatusColor(application.status)} white-text right">
                                            ${application.status}
                                        </span>
                                    </span>
                                    
                                    <div class="divider" style="margin: 15px 0;"></div>
                                    
                                    <div class="row">
                                        <div class="col s12 m6">
                                            <h6><i class="material-icons tiny">person</i> Student Information</h6>
                                            <p><strong>Name:</strong> ${application.student_name}</p>
                                            <p><strong>Date of Birth:</strong> ${application.date_of_birth}</p>
                                            <p><strong>Gender:</strong> ${application.gender}</p>
                                            <p><strong>Class Applying For:</strong> ${application.class_applying}</p>
                                            <p><strong>Previous School:</strong> ${application.previous_school || 'Not provided'}</p>
                                        </div>
                                        <div class="col s12 m6">
                                            <h6><i class="material-icons tiny">family_restroom</i> Parent/Guardian Information</h6>
                                            <p><strong>Father's Name:</strong> ${application.father_name}</p>
                                            <p><strong>Mother's Name:</strong> ${application.mother_name}</p>
                                            <p><strong>Phone:</strong> ${application.guardian_phone}</p>
                                            <p><strong>Email:</strong> ${application.guardian_email}</p>
                                            <p><strong>Father's Occupation:</strong> ${application.father_occupation || 'Not provided'}</p>
                                            <p><strong>Mother's Occupation:</strong> ${application.mother_occupation || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col s12 m6">
                                            <h6><i class="material-icons tiny">location_on</i> Address Information</h6>
                                            <p><strong>Address:</strong> ${application.address}</p>
                                            <p><strong>City:</strong> ${application.city}</p>
                                            <p><strong>State:</strong> ${application.state}</p>
                                            <p><strong>PIN Code:</strong> ${application.pincode}</p>
                                        </div>
                                        <div class="col s12 m6">
                                            <h6><i class="material-icons tiny">info</i> Additional Information</h6>
                                            <p><strong>Religion:</strong> ${application.religion || 'Not provided'}</p>
                                            <p><strong>Category:</strong> ${application.category || 'Not provided'}</p>
                                            <p><strong>Medical Conditions:</strong> ${application.medical_conditions || 'None'}</p>
                                            <p><strong>Application ID:</strong> <code>${application.application_id}</code></p>
                                            <p><strong>Submitted on:</strong> ${new Date(application.submission_date).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-flat modal-close">Close</button>
                    <button class="btn waves-effect waves-light" onclick="updateApplicationStatus('${applicationId}')">
                        Update Status
                    </button>
                </div>
            </div>
        `;
        
        // Remove existing modal
        const existingModal = document.querySelector('#application-details-modal');
        if (existingModal) existingModal.remove();
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Initialize and open modal
        const modal = document.querySelector('#application-details-modal');
        const modalInstance = M.Modal.init(modal);
        modalInstance.open();
        
    } catch (error) {
        console.error('Error viewing application details:', error);
        M.toast({html: 'Error loading application details!', classes: 'red'});
    }
}

// Update application status
function updateApplicationStatus(applicationId) {
    try {
        const applications = JSON.parse(localStorage.getItem('admissionApplications')) || [];
        const applicationIndex = applications.findIndex(app => app.application_id === applicationId);
        
        if (applicationIndex === -1) {
            M.toast({html: 'Application not found!', classes: 'red'});
            return;
        }
        
        const application = applications[applicationIndex];
        
        const modalHtml = `
            <div id="status-update-modal" class="modal">
                <div class="modal-content">
                    <h4>Update Application Status</h4>
                    <p>Application ID: <strong>${applicationId}</strong></p>
                    <p>Student: <strong>${application.student_name}</strong></p>
                    
                    <div class="row">
                        <div class="input-field col s12">
                            <select id="new-status">
                                <option value="Pending Review" ${application.status === 'Pending Review' ? 'selected' : ''}>Pending Review</option>
                                <option value="Approved" ${application.status === 'Approved' ? 'selected' : ''}>Approved</option>
                                <option value="Rejected" ${application.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                                <option value="Waitlisted" ${application.status === 'Waitlisted' ? 'selected' : ''}>Waitlisted</option>
                            </select>
                            <label>Application Status</label>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="input-field col s12">
                            <textarea id="status-notes" class="materialize-textarea" placeholder="Add notes about this status change (optional)"></textarea>
                            <label for="status-notes">Notes</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-flat modal-close">Cancel</button>
                    <button class="btn waves-effect waves-light" onclick="saveStatusUpdate('${applicationId}')">
                        Update Status
                    </button>
                </div>
            </div>
        `;
        
        // Remove existing modal
        const existingModal = document.querySelector('#status-update-modal');
        if (existingModal) existingModal.remove();
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Initialize modal and select
        const modal = document.querySelector('#status-update-modal');
        const modalInstance = M.Modal.init(modal);
        M.FormSelect.init(document.querySelectorAll('#status-update-modal select'));
        modalInstance.open();
        
    } catch (error) {
        console.error('Error updating application status:', error);
        M.toast({html: 'Error updating application status!', classes: 'red'});
    }
}

// Save status update
function saveStatusUpdate(applicationId) {
    try {
        const newStatus = document.getElementById('new-status').value;
        const notes = document.getElementById('status-notes').value;
        
        const applications = JSON.parse(localStorage.getItem('admissionApplications')) || [];
        const applicationIndex = applications.findIndex(app => app.application_id === applicationId);
        
        if (applicationIndex === -1) {
            M.toast({html: 'Application not found!', classes: 'red'});
            return;
        }
        
        // Update application
        applications[applicationIndex].status = newStatus;
        applications[applicationIndex].last_updated = new Date().toISOString();
        if (notes) {
            applications[applicationIndex].notes = notes;
        }
        
        // Save to localStorage
        localStorage.setItem('admissionApplications', JSON.stringify(applications));
        
        // Close modal
        const modal = document.querySelector('#status-update-modal');
        const modalInstance = M.Modal.getInstance(modal);
        modalInstance.close();
        
        // Close details modal if open
        const detailsModal = document.querySelector('#application-details-modal');
        if (detailsModal) {
            const detailsModalInstance = M.Modal.getInstance(detailsModal);
            detailsModalInstance.close();
        }
        
        // Refresh display
        displayAdmissionApplications();
        
        M.toast({html: `Application status updated to: ${newStatus}`, classes: 'green'});
        
    } catch (error) {
        console.error('Error saving status update:', error);
        M.toast({html: 'Error saving status update!', classes: 'red'});
    }
}

// Delete application
function deleteApplication(applicationId) {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
        return;
    }
    
    try {
        let applications = JSON.parse(localStorage.getItem('admissionApplications')) || [];
        applications = applications.filter(app => app.application_id !== applicationId);
        
        localStorage.setItem('admissionApplications', JSON.stringify(applications));
        displayAdmissionApplications();
        
        M.toast({html: 'Application deleted successfully!', classes: 'red'});
        
    } catch (error) {
        console.error('Error deleting application:', error);
        M.toast({html: 'Error deleting application!', classes: 'red'});
    }
}

// Search applications
function searchApplications() {
    const searchTerm = document.getElementById('application-search').value.toLowerCase();
    const rows = document.querySelectorAll('#applications-table tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter applications by status
function filterApplicationsByStatus() {
    const statusFilter = document.getElementById('status-filter').value;
    const rows = document.querySelectorAll('#applications-table tr');
    
    rows.forEach(row => {
        if (!statusFilter) {
            row.style.display = '';
        } else {
            const statusChip = row.querySelector('.chip');
            if (statusChip && statusChip.textContent.trim() === statusFilter) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// Copy to clipboard utility
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            M.toast({html: 'Copied to clipboard!', classes: 'green'});
        }).catch(() => {
            M.toast({html: 'Unable to copy to clipboard!', classes: 'orange'});
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            M.toast({html: 'Copied to clipboard!', classes: 'green'});
        } catch (err) {
            M.toast({html: 'Unable to copy to clipboard!', classes: 'orange'});
        }
        document.body.removeChild(textArea);
    }
}