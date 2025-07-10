// Get references to elements
const card = document.getElementById('card');
const loginFace = document.getElementById('loginFace');
const signupFace = document.getElementById('signupFace');
const switchLinks = document.querySelectorAll('.switch-link');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const googleSignupBtn = document.getElementById('googleSignupBtn');
const appleSignupBtn = document.getElementById('appleSignupBtn');
const createAccountBtn = document.getElementById('createAccountBtn');
const signupOptionsContainer = document.getElementById('signupOptionsContainer');
const manualSignupFormContainer = document.getElementById('manualSignupFormContainer');
const backToOptionsLink = document.getElementById('backToOptionsLink');

// Custom alert function to replace window.alert
function alert(message) {
    const existingAlert = document.getElementById('customAlert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertBox = document.createElement('div');
    alertBox.id = 'customAlert';
    alertBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #333;
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        z-index: 1000;
        font-size: 18px;
        text-align: center;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    `;
    alertBox.textContent = message;

    document.body.appendChild(alertBox);

    // Fade in
    setTimeout(() => {
        alertBox.style.opacity = '1';
    }, 10);

    // Fade out and remove after 3 seconds
    setTimeout(() => {
        alertBox.style.opacity = '0';
        alertBox.addEventListener('transitionend', () => {
            alertBox.remove();
        }, { once: true });
    }, 3000);
}


// Function to handle link clicks for switching forms (Login/Sign Up card faces)
function handleSwitchLinkClick(event) {
    const clickedLink = event.target;
    const targetForm = clickedLink.dataset.target; // 'login' or 'signup'

    // Toggle the 'is-flipped' class on the card based on the target form
    if (targetForm === 'signup') {
        card.classList.add('is-flipped');
        // Ensure initial signup options are visible when first going to signup page
        signupOptionsContainer.classList.remove('hidden');
        manualSignupFormContainer.classList.remove('active'); // Hide manual form
        signupForm.reset(); // Clear manual signup form fields when switching to options
    } else {
        card.classList.remove('is-flipped');
    }
}

// Add event listeners to each switch link
switchLinks.forEach(link => {
    link.addEventListener('click', handleSwitchLinkClick);
});

// Handle Google Sign Up button click
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', function() {
        alert('Simulating Google Sign Up: User credentials would autofill here.');
        console.log('Google Sign Up clicked. In a real app, this would initiate Google OAuth.');
        // In a real application, you would typically redirect to Google's OAuth consent screen
        // or use a Firebase/Auth0 SDK for social login.
    });
}

// Handle Apple Sign Up button click
if (appleSignupBtn) {
    appleSignupBtn.addEventListener('click', function() {
        alert('Simulating Apple Sign Up: User credentials would autofill here.');
        console.log('Apple Sign Up clicked. In a real app, this would initiate Apple OAuth.');
        // Similar to Google, this would involve Apple's authentication flow.
    });
}

// Handle "Create Account" button click
if (createAccountBtn) {
    createAccountBtn.addEventListener('click', function() {
        signupOptionsContainer.classList.add('hidden'); // Hide social buttons and create account button
        manualSignupFormContainer.classList.add('active'); // Show manual signup form
    });
}

// Handle "Back to Options" link click
if (backToOptionsLink) {
    backToOptionsLink.addEventListener('click', function() {
        manualSignupFormContainer.classList.remove('active'); // Hide manual signup form
        signupOptionsContainer.classList.remove('hidden'); // Show social buttons and create account button
        signupForm.reset(); // Optionally clear the manual signup form fields
    });
}

// Optional: Handle form submissions (for demonstration, just log data)
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    const emailUsername = document.getElementById('loginEmailUsername').value;
    const password = document.getElementById('loginPassword').value;
    console.log('Login Attempt:');
    console.log('Email/Username:', emailUsername);
    console.log('Password:', password);
    alert('Login form submitted! (Check console for data)');
    // In a real application, you would send this data to a server
});

signupForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    const email = document.getElementById('signupEmail').value;
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    console.log('Sign Up Attempt (Create Account):');
    console.log('Email:', email);
    console.log('Username:', username);
    console.log('Password:', password);
    alert('Account created successfully! Redirecting to Login...');

    // After successful sign-up, automatically switch back to the login page
    card.classList.remove('is-flipped'); // This will trigger the transition back to login
    signupForm.reset(); // Clear the sign-up form fields
    // Also reset the view on the signup page itself to show initial options
    manualSignupFormContainer.classList.remove('active');
    signupOptionsContainer.classList.remove('hidden');
});
