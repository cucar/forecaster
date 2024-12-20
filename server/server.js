const express = require('express');
const cors = require('cors');
const Brain = require('./Brain');
const SlopeEncoder = require('./SlopeEncoder');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Forecast endpoint
app.post('/api/forecast', (req, res) => {
    const { timeSeriesData } = req.body;
    
    if (timeSeriesData.length < 2) {
        return res.status(400).json({ error: 'Need at least 2 numbers for forecasting' });
    }

    // Create new brain and encoder instances for this request
    const brain = new Brain();
    const encoder = new SlopeEncoder(brain);

    // Process all slopes except the last pair
    const activations = [];
    for (let i = 1; i < timeSeriesData.length; i++) {
        const current = timeSeriesData[i];
        const previous = timeSeriesData[i-1];
        const neuron = encoder.encode(current, previous);
        activations.push(neuron);
    }

    // For now, just return the last value and debug info
    res.json({ 
        forecast: timeSeriesData[timeSeriesData.length - 1],
        debug: {
            context: brain.context,
            transitions: brain.transitions,
            activations
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 