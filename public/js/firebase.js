import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 🔹 Firebase konfiguracija
const firebaseConfig = {
    apiKey: "AIzaSyCUBbIOcLL881sDEi_PirHS0LcWrdUXiIg",
    authDomain: "compare-project-4c472.firebaseapp.com",
    projectId: "compare-project-4c472",
    storageBucket: "compare-project-4c472.appspot.com",
    messagingSenderId: "235402304861",
    appId: "1:235402304861:web:68bcf7f9dceb4d0d201cb4",
    measurementId: "G-0K7J17E5V4"
};

// 🔹 Inicijalizacija Firebase-a
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Funkcija za prijavu korisnika
export const signInUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in: ', userCredential.user);
        window.location.href = 'index.html';  // Preusmjeravanje nakon prijave
    } catch (error) {
        console.error('Error signing in: ', error);
        document.getElementById('error-message').textContent = "Invalid credentials. Please try again.";
    }
};

// 🔹 Sign-in form handling
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('sign-in-form');
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent form from refreshing the page
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            signInUser(email, password);  // Poziv funkcije za prijavu
        });
    }
});

// 🔹 Export Firestore-a za rad sa bazom
export { db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp };
