document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault(); 
            const targetId = this.getAttribute('href').slice(1);  // Get target section ID
            const targetElement = document.getElementById(targetId);

            // Smooth scroll to the target element
            window.scrollTo({
                top: targetElement.offsetTop - 50, // Adjust scroll position
                behavior: 'smooth'
            });
        });
    });

    // Navbar background color change on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('nav');
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = '#444'; // Darker color on scroll
        } else {
            navbar.style.backgroundColor = '#333'; // Default background color
        }
    });


    // Responsive mobile menu toggle
    const toggleButton = document.querySelector('#toggle-btn');
    const navList = document.querySelector('#nav-list');
    if (toggleButton && navList) {
        toggleButton.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }
});
    // Sign-in form handling
    const form = document.getElementById('sign-in-form');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent form from refreshing the page
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Call sign-in function from firebase.js
            try {
                await signInUser(email, password); // Sign in the user
                window.location.href = 'index.html'; // Redirect to home page after sign-in
            } catch (error) {
                document.getElementById('error-message').textContent = "Invalid credentials. Please try again.";
            }
        });
    }

    import { db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "./firebase.js";

    // 🔹 Funkcija za unos poruke u Firestore
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();  // Sprečava osvežavanje stranice
            const nameInput = document.querySelector('#name');
            const emailInput = document.querySelector('#email');
            const messageInput = document.querySelector('#message');
    
            // Proveri da li su svi podaci uneti
            if (nameInput.value === '' || emailInput.value === '' || messageInput.value === '') {
                alert('Please fill out all fields.');
                return;
            }
    
            // Unesi podatke u Firestore
            try {
                await addDoc(collection(db, "messages"), {
                    name: nameInput.value,
                    email: emailInput.value,
                    message: messageInput.value,
                    timestamp: serverTimestamp()
                });
                alert("Message sent!");
                // Očisti formu
                nameInput.value = '';
                emailInput.value = '';
                messageInput.value = '';
                loadMessages();  // Ponovno učitaj poruke nakon slanja
            } catch (error) {
                console.error('Error adding document: ', error);
            }
        });
    }
    
    //  Funkcija za učitavanje svih poruka
async function loadMessages() {
    const messagesList = document.querySelector('#messagesList');
    messagesList.innerHTML = '';  // Očisti prethodni sadržaj
    const querySnapshot = await getDocs(collection(db, "messages"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <strong>${data.name} (${data.email})</strong><br>
            <p>${data.message}</p>
            <small>${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : 'No timestamp'}</small><br>
            <!-- Dugmadi za editovanje i brisanje -->
            <button class="btn btn-warning edit-btn" data-id="${doc.id}">Edit</button>
            <button class="btn btn-danger delete-btn" data-id="${doc.id}">Delete</button>
        `;
        messagesList.appendChild(li);
    });

    //  event listener-i za edit i delete dugmadi
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');

    editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.getAttribute('data-id');
            editMessage(id);  // Poziv funkcije za editovanje
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.getAttribute('data-id');
            deleteMessage(id);  // Poziv funkcije za brisanje
        });
    });
}

// 🔹 Funkcija za editovanje poruke
async function editMessage(id) {
    const messageRef = doc(db, "messages", id);
    const messageDoc = await getDoc(messageRef);
    
    if (messageDoc.exists()) {
        const messageData = messageDoc.data();
        // Možete koristiti ove podatke da unapred popunite formu za editovanje
        document.querySelector('#name').value = messageData.name;
        document.querySelector('#email').value = messageData.email;
        document.querySelector('#message').value = messageData.message;

        // Podesite formu da ažurira podatke kada je poslata
        contactForm.onsubmit = async function(event) {
            event.preventDefault();
            const updatedName = document.querySelector('#name').value;
            const updatedEmail = document.querySelector('#email').value;
            const updatedMessage = document.querySelector('#message').value;

            await updateDoc(messageRef, {
                name: updatedName,
                email: updatedEmail,
                message: updatedMessage,
                timestamp: serverTimestamp()  
            });
            
            loadMessages();  // Ponovno učitavanje poruka
            document.querySelector('#name').value = '';
            document.querySelector('#email').value = '';
            document.querySelector('#message').value = '';
        };
    } else {
        console.log("No such document!");
    }
}

// 🔹 Funkcija za brisanje poruke
async function deleteMessage(id) {
    try {
        const messageRef = doc(db, "messages", id);
        await deleteDoc(messageRef);  // Brisanje poruke iz Firestore-a
        loadMessages();  // Ponovno učitavanje poruka
    } catch (error) {
        console.error("Error deleting message: ", error);
    }
}

// Učitaj poruke kada stranica bude učitana
document.addEventListener('DOMContentLoaded', loadMessages);


    // Dynamic Greeting- zavisno od doba dana kada se gleda stranica
    const greetingElement = document.querySelector('#greeting');
    const currentHour = new Date().getHours();
    if (greetingElement) {
        if (currentHour < 12) {
            greetingElement.textContent = 'Good morning!'; // jutro
        } else if (currentHour < 18) {
            greetingElement.textContent = 'Good afternoon!'; // dan
        } else {
            greetingElement.textContent = 'Good evening!'; // noc
        }
    }


    // Responsive-mobile meni toggle f.
    const toggleButton = document.querySelector('#toggle-btn');
    const navList = document.querySelector('#nav-list');
    if (toggleButton && navList) {
        toggleButton.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }


document.getElementById("search-btn").addEventListener("click", async function() {
    const query = document.getElementById("search").value.toLowerCase().trim();
  
    if (query.length === 0) {
        alert("Please enter a product name.");
        return;
    }
  
    localStorage.setItem('lastSearchQuery', query);

    try {
        const response = await fetch("http://localhost:3000/products");
  
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const products = await response.json();
  
        // Find two most similar products
        const bestMatches = findTwoSimilarProducts(products, query);
  
        displayResults(bestMatches);
    } catch (error) {
        console.error("Error fetching search results:", error);
    }
  });

  // Retrieve last search query from localStorage (if exists)
window.onload = function() {
    const lastSearchQuery = localStorage.getItem('lastSearchQuery');
    if (lastSearchQuery) {
        document.getElementById("search").value = lastSearchQuery;  // Set the input field to the last search
    }
};
  
  // Function to find two most similar products based on category + title match
  function findTwoSimilarProducts(products, query) {
    // Step 1: Find products that contain the query in the title
    let filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(query)
    );
  
    // Step 2: If no exact title match, search by category instead
    if (filteredProducts.length === 0) {
        const possibleCategories = products.map(product => product.category);
        const bestCategoryMatch = findBestCategoryMatch(possibleCategories, query);
        filteredProducts = products.filter(product => product.category === bestCategoryMatch);
    }
  
    // Step 3: Sort by similarity (Levenshtein Distance within filtered set)
    const rankedProducts = filteredProducts
        .map(product => ({
            product,
            similarity: levenshteinDistance(product.title.toLowerCase(), query)
        }))
        .sort((a, b) => a.similarity - b.similarity);
  
    return rankedProducts.slice(0, 2).map(item => item.product);
  }
  
  // Find the best-matching category based on the query
  function findBestCategoryMatch(categories, query) {
    const rankedCategories = categories
        .map(category => ({
            category,
            similarity: levenshteinDistance(category.toLowerCase(), query)
        }))
        .sort((a, b) => a.similarity - b.similarity);
  
    return rankedCategories[0]?.category || categories[0]; // Return the closest matching category
  }
  
  // Levenshtein Distance Algorithm (Measures how different two strings are)
  function levenshteinDistance(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => []);
  
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // Deletion
                matrix[i][j - 1] + 1, // Insertion
                matrix[i - 1][j - 1] + cost // Substitution
            );
        }
    }
  
    return matrix[a.length][b.length]; // Smaller value = more similar
  }
  
  // Display results side by side
  function displayResults(products) {
    const container = document.querySelector(".comparison-container");
    container.innerHTML = ""; // Clear previous results
  
    if (products.length < 2) {
        container.innerHTML = "<p>Not enough similar products found.</p>";
        return;
    }
  
    products.forEach(product => {
        const productBox = document.createElement("div");
        productBox.classList.add("comparison-box");
        productBox.innerHTML = `
            <h3>${product.title}</h3>
            <img src="${product.image}" alt="${product.title}" width="100">
            <p>Price: <strong>$${product.price}</strong></p>
            <p>${product.description}</p>
        `;
        container.appendChild(productBox);
    });
  }