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
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const message = formData.get('message');
            
            // Simple validation
            if (!name || !email || !message) {
                M.toast({html: 'Please fill in all required fields!', classes: 'red'});
                return;
            }
            
            // Simulate form submission
            M.toast({html: 'Thank you for your message! We will get back to you soon.', classes: 'green'});
            this.reset();
        });
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
});