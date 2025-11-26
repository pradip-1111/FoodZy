// Test script to fetch admin users API endpoint
const fetch = require('node-fetch');
(async () => {
    try {
        const res = await fetch('http://localhost:3000/api/admin/users');
        const data = await res.json();
        console.log('Response status:', res.status);
        console.log('Data:', data);
    } catch (err) {
        console.error('Error fetching admin users:', err);
    }
})();
