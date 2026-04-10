const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// [수정] 원하는 저장 경로로 변경하세요.
const SAVE_PATH = path.join(__dirname, 'reports'); 

if (!fs.existsSync(SAVE_PATH)) fs.mkdirSync(SAVE_PATH, { recursive: true });

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/save', (req, res) => {
    const { fileName, data } = req.body;
    const fullPath = path.join(SAVE_PATH, fileName);
    fs.writeFile(fullPath, JSON.stringify(data, null, 2), (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, path: fullPath });
    });
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
