// ✅ Enable module-based imports for Firebase functions
import { db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "./firebase.js";

// Smooth scroll and navbar behavior
document.addEventListener('DOMContentLoaded', function () {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 50,
                    behavior: 'smooth'
                });
            }
        });
    });

    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('nav');
        navbar.style.backgroundColor = window.scrollY > 50 ? '#444' : '#333';
    });

    const toggleButton = document.querySelector('#toggle-btn');
    const navList = document.querySelector('#nav-list');
    if (toggleButton && navList) {
        toggleButton.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }

    const greetingElement = document.querySelector('#greeting');
    const currentHour = new Date().getHours();
    if (greetingElement) {
        greetingElement.textContent = currentHour < 12 ? 'Good morning!' :
            currentHour < 18 ? 'Good afternoon!' : 'Good evening!';
    }

    const messagesList = document.querySelector('#messagesList');
    if (messagesList) {
        loadMessages();
    }
});

// 🔐 Sign-in form
const form = document.getElementById('sign-in-form');
if (form) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            await signInUser(email, password);
            window.location.href = 'index.html';
        } catch (error) {
            document.getElementById('error-message').textContent = "Invalid credentials. Please try again.";
        }
    });
}

// 📬 Contact form Firestore handler
const contactForm = document.querySelector('#contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const name = document.querySelector('#name').value;
        const email = document.querySelector('#email').value;
        const message = document.querySelector('#message').value;

        if (!name || !email || !message) {
            alert('Please fill out all fields.');
            return;
        }

        try {
            await addDoc(collection(db, "messages"), {
                name, email, message, timestamp: serverTimestamp()
            });
            alert("Message sent!");
            contactForm.reset();
            loadMessages();
        } catch (error) {
            console.error('Error adding message:', error);
        }
    });
}

async function loadMessages() {
    const messagesList = document.querySelector('#messagesList');
    if (!messagesList) return;
    messagesList.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, "messages"));
    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <strong>${data.name} (${data.email})</strong><br>
            <p>${data.message}</p>
            <small>${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : 'No timestamp'}</small><br>
            <button class="btn btn-warning edit-btn" data-id="${docSnap.id}">Edit</button>
            <button class="btn btn-danger delete-btn" data-id="${docSnap.id}">Delete</button>
        `;
        messagesList.appendChild(li);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editMessage(btn.getAttribute('data-id')));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteMessage(btn.getAttribute('data-id')));
    });
}

async function editMessage(id) {
    const messageRef = doc(db, "messages", id);
    const docSnap = await getDoc(messageRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.querySelector('#name').value = data.name;
        document.querySelector('#email').value = data.email;
        document.querySelector('#message').value = data.message;

        contactForm.onsubmit = async function (event) {
            event.preventDefault();
            await updateDoc(messageRef, {
                name: document.querySelector('#name').value,
                email: document.querySelector('#email').value,
                message: document.querySelector('#message').value,
                timestamp: serverTimestamp()
            });
            contactForm.reset();
            loadMessages();
        };
    }
}

async function deleteMessage(id) {
    try {
        await deleteDoc(doc(db, "messages", id));
        loadMessages();
    } catch (err) {
        console.error("Delete error:", err);
    }
}

// 🔍 Price comparison
const searchBtn = document.getElementById("search-btn");
if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
        const query = document.getElementById("search").value.toLowerCase().trim();
        if (!query) {
            alert("Please enter a product name.");
            return;
        }

        localStorage.setItem('lastSearchQuery', query);

        try {
            const response = await fetch("/api/products");
            if (!response.ok) throw new Error("API error: " + response.status);
            const data = await response.json();
            const products = data.products;
            const bestMatches = findTwoSimilarProducts(products, query);
            displayResults(bestMatches);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    });

    window.onload = function () {
        const lastSearchQuery = localStorage.getItem('lastSearchQuery');
        if (lastSearchQuery) {
            document.getElementById("search").value = lastSearchQuery;
        }
    };
}

// ✅ Improved matching logic
function findTwoSimilarProducts(products, query) {
    const q = query.trim().toLowerCase();

    let exactMatches = products.filter(p =>
        p.title.toLowerCase() === q ||
        p.category.toLowerCase() === q
    );

    if (exactMatches.length < 2) {
        exactMatches = products.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    }

    if (exactMatches.length < 2) {
        const ranked = products.map(p => ({
            product: p,
            similarity: levenshteinDistance(p.title.toLowerCase(), q)
        })).sort((a, b) => a.similarity - b.similarity);

        exactMatches = ranked.slice(0, 2).map(r => r.product);
    }

    return exactMatches.slice(0, 2);
}

function levenshteinDistance(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => []);
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[a.length][b.length];
}

function displayResults(products) {
    const container = document.querySelector(".comparison-container");
    if (!container) return;
    container.innerHTML = "";
    if (products.length < 2) {
        container.innerHTML = "<p>Not enough similar products found.</p>";
        return;
    }

    products.forEach(product => {
        const box = document.createElement("div");
        box.classList.add("comparison-box");
        box.innerHTML = `
            <h3>${product.title}</h3>
            <img src="${product.thumbnail}" alt="${product.title}" width="100">
            <p>Price: <strong>$${product.price}</strong></p>
            <p>${product.description}</p>
        `;
        container.appendChild(box);
    });
}
