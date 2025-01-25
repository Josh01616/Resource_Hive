import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuehkyhTTGuNFXyNEQqkERTXVkg3R6eDo",
  authDomain: "visual-visionaries.firebaseapp.com",
  projectId: "visual-visionaries",
  storageBucket: "visual-visionaries.firebasestorage.app",
  messagingSenderId: "24641645399",
  appId: "1:24641645399:web:21e2549cf65843f09a2c12",
  measurementId: "G-TQRQKBESP5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility function for styling
function createStyledElement(type, text, styles = {}) {
  const element = document.createElement(type);
  element.textContent = text;
  Object.assign(element.style, styles);
  return element;
}

// Fetch and display user details
async function fetchUserDetails() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user is logged in");
      redirectToLogin();
      return;
    }

    const userEmail = user.email;
    const q = query(collection(db, "accountDetails"), where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("No user document found");
      return;
    }

    const userData = querySnapshot.docs[0].data();
    const docId = querySnapshot.docs[0].id;
    renderProfileView(userData, docId);
  } catch (error) {
    console.error("Error fetching user details:", error);
    alert("Failed to load profile. Please try again.");
  }
}

// Render profile view
function renderProfileView(userData, docId) {
  const profileCard = document.querySelector('.profile-card');
  profileCard.innerHTML = ''; // Clear previous content

  const styles = {
    header: {
      fontSize: '36px',
      fontWeight: 'bold',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #006666 0%, #008080 50%, #40E0D0 100%)',
      color: '#ffffff',
      padding: '10px',
      borderRadius: '5px',
      width: '50%',
      margin: '0 auto'
    },
    text: {
      fontSize: '20px',
      marginTop: '15px'
    },
    button: {
      marginTop: '20px',
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #006666 0%, #008080 50%, #40E0D0 100%)',
      color: 'white',
      border: 'none',
      cursor: 'pointer'
    }
  };

  const profileHeader = createStyledElement('h2', 'PROFILE', styles.header);
  const profileName = createStyledElement('p', `Full Name: ${userData.fullname || 'Not Available'}`, styles.text);
  const profileEmail = createStyledElement('p', `Email: ${userData.email}`, styles.text);
  const profileContact = createStyledElement('p', `Contact: ${userData.contact || 'Not Available'}`, styles.text);

  const editButton = createStyledElement('button', 'Edit Profile', styles.button);
  editButton.addEventListener('click', () => renderEditView(userData, docId));

  profileCard.append(profileHeader, profileName, profileEmail, profileContact, editButton);
}

// Render edit view
function renderEditView(userData, docId) {
  const profileCard = document.querySelector('.profile-card');
  profileCard.innerHTML = ''; // Clear previous content

  const styles = {
    header: {
      fontSize: '36px',
      fontWeight: 'bold',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #006666 0%, #008080 50%, #40E0D0 100%)',
      color: '#ffffff',
      padding: '10px',
      borderRadius: '5px',
      width: '50%',
      margin: '0 auto'
    },
    input: {
      width: '50%',
      padding: '10px',
      margin: '10px 0',
      border: '1px solid #ddd',
      borderRadius: '4px'
    },
    button: {
      width: '50%',
      padding: '10px',
      background: 'linear-gradient(135deg, #006666 0%, #008080 50%, #40E0D0 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  };

  const editHeader = createStyledElement('h2', 'Edit Profile', styles.header);

  const fullnameInput = document.createElement('input');
  fullnameInput.type = 'text';
  fullnameInput.value = userData.fullname || '';
  fullnameInput.placeholder = 'Full Name';
  Object.assign(fullnameInput.style, styles.input);

  const contactInput = document.createElement('input');
  contactInput.type = 'text';
  contactInput.value = userData.contact || '';
  contactInput.placeholder = 'Contact Number';
  Object.assign(contactInput.style, styles.input);

  const saveButton = createStyledElement('button', 'Save Changes', styles.button);
  saveButton.addEventListener('click', () => updateProfile(docId, fullnameInput.value, contactInput.value));

  profileCard.append(editHeader, fullnameInput, contactInput, saveButton);
}

// Update profile in Firestore
async function updateProfile(docId, fullname, contact) {
  try {
    // Validate inputs
    if (!fullname || !contact) {
      alert('Please fill in all fields');
      return;
    }

    await updateDoc(doc(db, "accountDetails", docId), {
      fullname,
      contact
    });

    alert('Profile updated successfully!');
    fetchUserDetails(); // Refresh profile view
  } catch (error) {
    console.error("Error updating profile:", error);
    alert('Failed to update profile. Please try again.');
  }
}

// Logout functionality
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'login.html';
    } catch (error) {
      console.error("Logout error:", error);
    }
  });
}

// Prevent back navigation for logged-in users
function preventBackNavigation() {
  history.pushState(null, null, location.href);
  window.onpopstate = function() {
    history.pushState(null, null, location.href);
  };
}

// Redirect to login if not authenticated
function redirectToLogin() {
  window.location.href = 'login.html';
}

// Initialize authentication state listener
function initAuthListener() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserDetails();
      setupLogoutButton();
      preventBackNavigation();
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      redirectToLogin();
    }
  });
}

// Profile menu toggle
function setupProfileMenuToggle() {
  const profileLink = document.querySelector('.profile-link');
  const profileMenu = document.getElementById('profileMenu');

  profileLink.addEventListener('click', () => {
    profileMenu.classList.toggle('show');
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initAuthListener();
  setupProfileMenuToggle();
});
