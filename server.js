const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to fetch product data
const fetchProducts = async () => {
    try {
        const response = await axios.get('https://dummyjson.com/products');
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

// API endpoint to get products
app.get('/products', async (req, res) => {
    const products = await fetchProducts();
    res.json(products);
});

// Serve `compare.html`
app.get('/compare.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'compare.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});