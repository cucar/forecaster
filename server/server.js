import express from 'express';
import cors from 'cors';
import Brain from './Brain.js';
import SlopeEncoder from './SlopeEncoder.js';

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Forecast endpoint
app.post('/api/forecast', (req, res) => {
    const { timeSeriesData } = req.body;
    
    if (timeSeriesData.length < 2) 
        return res.status(400).json({ error: 'Need at least 2 numbers for forecasting' });

    // Create new brain and encoder instances for this request
    const brain = new Brain();
    const encoder = new SlopeEncoder(brain);

    // Activate the time series data in the brain and get the predicted value
    const forecast = encoder.activate(timeSeriesData);
    
    // return the forecasted value
    res.json({ forecast });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 