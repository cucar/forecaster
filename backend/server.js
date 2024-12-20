const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Forecast endpoint
app.post('/api/forecast', (req, res) => {
    const { timeSeriesData } = req.body;
    
    // For now, just return 0 as the forecast
    // We'll implement the actual algorithm later
    const forecast = 0;
    
    res.json({ forecast });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 