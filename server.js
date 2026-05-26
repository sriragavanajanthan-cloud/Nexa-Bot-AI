const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(express.static('dist'));

// Handle client-side routing - any request under /app should serve index.html
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'webapp', 'index.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'webapp', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
