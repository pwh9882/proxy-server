const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8082;

app.use(express.json());

app.use('/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).send('URL is required');
        
        const response = await axios({
            url: targetUrl,
            method: req.method,
            headers: req.headers,
            data: req.body,
        });

        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(500).send('Error while fetching data from target URL');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
