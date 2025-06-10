import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import cors from 'cors'; // Import CORS middleware

const app = express();
app.use(cors()); // Use CORS middleware
app.use(bodyParser.json());

app.post('/saveChequeData', (req, res) => {
    const { chequeDetails } = req.body;
    const filePath = path.join(process.cwd(), 'chequeFile', 'chequeDetails.json');

    if (!fs.existsSync(path.join(process.cwd(), 'chequeFile'))) {
        fs.mkdirSync(path.join(process.cwd(), 'chequeFile'));
    }

    fs.writeFile(filePath, JSON.stringify(chequeDetails, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).send('Error writing file');
        }
        res.status(200).send('File created successfully');
    });
});

const PORT = 5000; // Use port 5000 for the backend
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});