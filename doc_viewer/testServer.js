import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors()); // <-- This allows any origin (for dev/testing)
app.use(express.json());

app.post('/session-actions', (req, res) => {
    console.log('\n====== Session Actions Received ======');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('======================================\n');
    res.json({ status: 'success', received: true });
});

const PORT = 8002;
app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
});
