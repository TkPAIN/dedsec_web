const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('website'));

// Endpoint para guardar progreso
app.post('/api/save', (req, res) => {
    const { userId, data } = req.body;
    const userFile = path.join(__dirname, 'data', `${userId}.json`);
    fs.writeFileSync(userFile, JSON.stringify(data));
    res.json({ success: true });
});

// Endpoint para cargar progreso
app.get('/api/load/:userId', (req, res) => {
    const userFile = path.join(__dirname, 'data', `${req.params.userId}.json`);
    if (fs.existsSync(userFile)) {
        const data = fs.readFileSync(userFile, 'utf8');
        res.json(JSON.parse(data));
    } else {
        res.json(null);
    }
});

app.listen(3000, () => {
    console.log('⎈ Servidor DedSec corriendo en http://localhost:3000');
});
