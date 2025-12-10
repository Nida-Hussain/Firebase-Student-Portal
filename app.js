
        import { 
    auth, 
    db,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    deleteDoc, 
    doc 
} from './firebase.js';


const loadingScreen = document.getElementById('loading-screen');
const authSection = document.getElementById('auth-section');
const registrationSection = document.getElementById('registration-section');
const dashboard = document.getElementById('dashboard');

const authForm = document.getElementById('auth-form');
const authBtn = document.getElementById('auth-btn');
const authLoader = document.getElementById('auth-loader');
const switchToLogin = document.getElementById('switch-to-login');
const passwordToggle = document.querySelector('.password-toggle');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');

const backToAuth = document.getElementById('back-to-auth');
const registrationProgress = document.getElementById('registration-progress');
const saveBtn = document.getElementById('save-btn');
const saveLoader = document.getElementById('save-loader');


const logoutBtn = document.getElementById('logout-btn');
const editProfileBtn = document.getElementById('edit-profile-btn');
const deleteProfileBtn = document.getElementById('delete-profile-btn');
const navStudentName = document.getElementById('nav-student-name');
const studentName = document.getElementById('student-name');
const studentId = document.getElementById('student-id');
const studentCourse = document.getElementById('student-course');
const welcomeTitle = document.getElementById('welcome-title');
const welcomeSubtitle = document.getElementById('welcome-subtitle');


const infoEmail = document.getElementById('info-email');
const infoPhone = document.getElementById('info-phone');
const infoDob = document.getElementById('info-dob');
const infoAddress = document.getElementById('info-address');
const infoCourse = document.getElementById('info-course');
const infoYear = document.getElementById('info-year');
const infoYearFull = document.getElementById('info-year-full');
const infoEmergency = document.getElementById('info-emergency');
const infoParent = document.getElementById('info-parent');
const infoCreated = document.getElementById('info-created');


const reviewName = document.getElementById('review-name');
const reviewId = document.getElementById('review-id');
const reviewDob = document.getElementById('review-dob');
const reviewPhone = document.getElementById('review-phone');
const reviewAddress = document.getElementById('review-address');
const reviewCourse = document.getElementById('review-course');
const reviewYear = document.getElementById('review-year');
const reviewEmergency = document.getElementById('review-emergency');
const reviewParent = document.getElementById('review-parent');

let isLoginMode = false;
let currentUser = null;
let currentStep = 1;
let userEmail = '';

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);

    initEventListeners();
});

function initEventListeners() {
    authForm.addEventListener('submit', handleAuth);
    
    switchToLogin.addEventListener('click', toggleAuthMode);
    
    passwordToggle.addEventListener('click', togglePasswordVisibility);
    
    backToAuth.addEventListener('click', goBackToAuth);
    
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', goToNextStep);
    });
    
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', goToPrevStep);
    });
    
    saveBtn.addEventListener('click', saveRegistrationData);
    
    logoutBtn.addEventListener('click', handleLogout);
    editProfileBtn.addEventListener('click', editProfile);
    deleteProfileBtn.addEventListener('click', deleteProfile);
    
    document.getElementById('fullName').addEventListener('input', updateReview);
    document.getElementById('studentId').addEventListener('input', updateReview);
    document.getElementById('dob').addEventListener('input', updateReview);
    document.getElementById('phone').addEventListener('input', updateReview);
    document.getElementById('address').addEventListener('input', updateReview);
    document.getElementById('course').addEventListener('change', updateReview);
    document.getElementById('year').addEventListener('change', updateReview);
    document.getElementById('emergencyContact').addEventListener('input', updateReview);
    document.getElementById('parentName').addEventListener('input', updateReview);
}

async function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    userEmail = email;
    
    if (!email || !password) {
        showErrorAlert('Error', 'Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showErrorAlert('Error', 'Password must be at least 6 characters long');
        return;
    }
    
    setButtonLoading(authBtn, authLoader, true);
    
    try {
        if (isLoginMode) {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            currentUser = userCredential.user;
            showSuccessAlert('Welcome Back!', 'Successfully logged in to your account');
            
            await checkUserProfile();
            
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            currentUser = userCredential.user;
            showSuccessAlert('Account Created!', 'Please complete your student profile');
            
            authSection.style.display = 'none';
            registrationSection.style.display = 'block';
        }
    } catch (error) {
        console.error('Authentication error:', error);
        showErrorAlert('Authentication Failed', error.message);
    }
    
    setButtonLoading(authBtn, authLoader, false);
}

async function checkUserProfile() {
    try {
        const q = query(collection(db, "students"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            authSection.style.display = 'none';
            registrationSection.style.display = 'none';
            dashboard.style.display = 'block';
            loadStudentData();
        } else {
            authSection.style.display = 'none';
            registrationSection.style.display = 'block';
        }
    } catch (error) {
        console.error('Error checking profile:', error);
        showErrorAlert('Error', 'Failed to check user profile');
    }
}

function toggleAuthMode(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        authTitle.textContent = 'Welcome Back!';
        authSubtitle.textContent = 'Sign in to your student dashboard';
        document.querySelector('.auth-btn .btn-text').textContent = 'Sign In';
        switchToLogin.textContent = 'Sign Up';
        document.querySelector('.auth-footer p').innerHTML = 'Don\'t have an account? <a href="#" id="switch-to-login">Sign Up</a>';
    } else {
        authTitle.textContent = 'Create Your Account';
        authSubtitle.textContent = 'Sign up to start your student journey';
        document.querySelector('.auth-btn .btn-text').textContent = 'Create Account';
        switchToLogin.textContent = 'Sign In';
        document.querySelector('.auth-footer p').innerHTML = 'Already have an account? <a href="#" id="switch-to-login">Sign In</a>';
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const icon = passwordToggle.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function goToNextStep(e) {
    const nextStep = parseInt(e.target.dataset.next);
    
    if (!validateStep(currentStep)) {
        showErrorAlert('Validation Error', 'Please fill in all required fields');
        return;
    }
    
    updateProgress(nextStep);
    
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById(`step-${nextStep}`).classList.add('active');
    currentStep = nextStep;
    
    if (nextStep === 3) {
        updateReview();
    }
}

function goToPrevStep(e) {
    const prevStep = parseInt(e.target.dataset.prev);
    
    updateProgress(prevStep);
    
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById(`step-${prevStep}`).classList.add('active');
    currentStep = prevStep;
}

function updateProgress(step) {
    const progress = (step / 3) * 100;
    registrationProgress.style.width = `${progress}%`;
    
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        if (index + 1 <= step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });
}

function validateStep(step) {
    const stepElement = document.getElementById(`step-${step}`);
    const inputs = stepElement.querySelectorAll('input[required], select[required], textarea[required]');
    
    for (let input of inputs) {
        if (!input.value.trim()) {
            input.focus();
            return false;
        }
    }
    return true;
}

function updateReview() {
    reviewName.textContent = document.getElementById('fullName').value || '-';
    reviewId.textContent = document.getElementById('studentId').value || '-';
    
    const dob = document.getElementById('dob').value;
    reviewDob.textContent = dob ? new Date(dob).toLocaleDateString() : '-';
    
    reviewPhone.textContent = document.getElementById('phone').value || '-';
    reviewAddress.textContent = document.getElementById('address').value || '-';
    reviewCourse.textContent = document.getElementById('course').value || '-';
    
    const year = document.getElementById('year').value;
    reviewYear.textContent = year ? `Year ${year}` : '-';
    
    reviewEmergency.textContent = document.getElementById('emergencyContact').value || '-';
    reviewParent.textContent = document.getElementById('parentName').value || '-';
}

async function saveRegistrationData(e) {
    e.preventDefault();
    
    if (!validateStep(3)) {
        showErrorAlert('Validation Error', 'Please complete all required fields');
        return;
    }
    
    if (!currentUser) {
        showErrorAlert('Error', 'User not authenticated');
        return;
    }
    
    setButtonLoading(saveBtn, saveLoader, true);
    
    const studentData = {
        fullName: document.getElementById('fullName').value,
        studentId: document.getElementById('studentId').value,
        dob: document.getElementById('dob').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        course: document.getElementById('course').value,
        year: document.getElementById('year').value,
        emergencyContact: document.getElementById('emergencyContact').value,
        parentName: document.getElementById('parentName').value,
        userId: currentUser.uid,
        email: userEmail || currentUser.email,
        createdAt: new Date().toISOString(),
        profileCompleted: true
    };
    
    try {
        const q = query(collection(db, "students"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            await updateDoc(doc(db, "students", docId), studentData);
        } else {
            await addDoc(collection(db, "students"), studentData);
        }
        
        setButtonLoading(saveBtn, saveLoader, false);
        showStudentProfileDirectly();
        
    } catch (error) {
        console.error('Save error:', error);
        showErrorAlert('Save Failed', 'There was an error saving your profile: ' + error.message);
        setButtonLoading(saveBtn, saveLoader, false);
    }
}

function showStudentProfileDirectly() {
    registrationSection.style.display = 'none';
    dashboard.style.display = 'block';
    loadStudentData();
    
    const welcomeBanner = document.querySelector('.welcome-banner');
    welcomeBanner.style.animation = 'celebrate 1s ease-in-out';
    
    setTimeout(() => {
        welcomeBanner.style.animation = '';
    }, 1000);
    
    showQuickSuccess('🎉 Profile Created Successfully!');
}

function showQuickSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'quick-success';
    notification.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

async function loadStudentData() {
    try {
        const q = query(collection(db, "students"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const studentData = querySnapshot.docs[0].data();
            
            studentName.textContent = studentData.fullName;
            navStudentName.textContent = studentData.fullName;
            studentId.textContent = `ID: ${studentData.studentId}`;
            studentCourse.textContent = studentData.course;
            
            welcomeTitle.textContent = `Welcome, ${studentData.fullName.split(' ')[0]}!`;
            welcomeSubtitle.textContent = `Great to have you in ${studentData.course} - Year ${studentData.year}`;
            
            infoEmail.textContent = studentData.email;
            infoPhone.textContent = studentData.phone;
            infoDob.textContent = studentData.dob ? new Date(studentData.dob).toLocaleDateString() : '-';
            infoAddress.textContent = studentData.address;
            infoCourse.textContent = studentData.course;
            infoYear.textContent = studentData.year;
            infoYearFull.textContent = `Year ${studentData.year}`;
            infoEmergency.textContent = studentData.emergencyContact;
            infoParent.textContent = studentData.parentName || 'Not provided';
            infoCreated.textContent = studentData.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : '-';
            
            updateProfileAvatar(studentData.fullName);
        }
    } catch (error) {
        console.error('Error loading student data:', error);
    }
}

function updateProfileAvatar(fullName) {
    const profileAvatar = document.querySelector('.profile-avatar');
    const userAvatar = document.querySelector('.user-avatar');
    
    if (fullName && fullName.trim() !== '') {
        const firstLetter = fullName.trim().charAt(0).toUpperCase();
        profileAvatar.innerHTML = `<span style="font-size: 2rem; font-weight: 700;">${firstLetter}</span>`;
        userAvatar.innerHTML = `<span style="font-size: 1.2rem; font-weight: 700;">${firstLetter}</span>`;
    }
}

function editProfile() {
    console.log('Edit profile clicked!'); 
    
    Swal.fire({
        title: 'Edit Profile?',
        text: 'You will be redirected to update your information.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, Edit Profile',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            dashboard.style.display = 'none';
            registrationSection.style.display = 'block';
            loadStudentDataToForm();
        }
    });
}

async function loadStudentDataToForm() {
    try {
        const q = query(collection(db, "students"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const studentData = querySnapshot.docs[0].data();
            
            document.getElementById('fullName').value = studentData.fullName || '';
            document.getElementById('studentId').value = studentData.studentId || '';
            document.getElementById('dob').value = studentData.dob || '';
            document.getElementById('phone').value = studentData.phone || '';
            document.getElementById('address').value = studentData.address || '';
            document.getElementById('course').value = studentData.course || '';
            document.getElementById('year').value = studentData.year || '';
            document.getElementById('emergencyContact').value = studentData.emergencyContact || '';
            document.getElementById('parentName').value = studentData.parentName || '';
            
            updateReview();
            document.querySelector('.btn-submit .btn-text').textContent = 'Update Profile';
        }
    } catch (error) {
        console.error('Error loading data to form:', error);
    }
}

function deleteProfile() {
    console.log('Delete profile clicked!'); 
    
    Swal.fire({
        title: 'Delete Profile?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteStudentData();
        }
    });
}

async function deleteStudentData() {
    try {
        const q = query(collection(db, "students"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            await deleteDoc(doc(db, "students", docId));
            
            showSuccessAlert('Profile Deleted', 'Your profile has been deleted successfully');
            
            dashboard.style.display = 'none';
            registrationSection.style.display = 'block';
            
            document.querySelectorAll('.step-form input, .step-form select, .step-form textarea').forEach(element => {
                element.value = '';
            });
            currentStep = 1;
            updateProgress(1);
            document.querySelector('.btn-submit .btn-text').textContent = 'Complete Registration';
        }
    } catch (error) {
        console.error('Delete error:', error);
        showErrorAlert('Delete Failed', 'There was an error deleting your profile');
    }
}

async function handleLogout() {
    const result = await Swal.fire({
        title: 'Logout?',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, Logout',
        cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
        try {
            await signOut(auth);
            showSuccessAlert('Logged Out', 'You have been successfully logged out');
            
            dashboard.style.display = 'none';
            registrationSection.style.display = 'none';
            authSection.style.display = 'block';
            authForm.reset();
            
            document.querySelectorAll('.step-form input, .step-form select, .step-form textarea').forEach(element => {
                element.value = '';
            });
            currentStep = 1;
            updateProgress(1);
            document.querySelector('.btn-submit .btn-text').textContent = 'Complete Registration';
            
        } catch (error) {
            showErrorAlert('Logout Failed', error.message);
        }
    }
}

function goBackToAuth() {
    registrationSection.style.display = 'none';
    authSection.style.display = 'block';
}
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log('User signed in:', user.email);
        
        if (isLoginMode) {
            checkUserProfile();
        }
    } else {
        currentUser = null;
        console.log('User signed out');
        authSection.style.display = 'block';
        registrationSection.style.display = 'none';
        dashboard.style.display = 'none';
    }
});

function setButtonLoading(button, loader, isLoading) {
    const btnText = button.querySelector('.btn-text');
    
    if (isLoading) {
        btnText.style.opacity = '0';
        loader.style.display = 'block';
        button.disabled = true;
    } else {
        btnText.style.opacity = '1';
        loader.style.display = 'none';
        button.disabled = false;
    }
}

function showSuccessAlert(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        confirmButtonColor: '#6366f1',
        timer: 3000
    });
}

function showErrorAlert(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonColor: '#6366f1'
    });
}   