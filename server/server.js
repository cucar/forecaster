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

    let lastPredictedNeuronId = null;

    // Process all slopes except the last pair
    for (let i = 1; i < timeSeriesData.length; i++) {
        const current = timeSeriesData[i];
        const previous = timeSeriesData[i-1];
        
        // Encode and activate current value
        const actualNeuronId = encoder.encode(current, previous);
        
        // Log prediction accuracy if we had a prediction
        if (lastPredictedNeuronId !== null) {
            // Calculate accuracy based on how close the predictions are (19 possible neurons)
            const accuracy = Math.max(0, 100 - Math.abs(lastPredictedNeuronId - actualNeuronId) * (100/18));
            console.log(`Predicted: ${lastPredictedNeuronId}, Actual: ${actualNeuronId}, Accuracy: ${accuracy.toFixed(1)}%`);
        }

        // Get prediction for next value
        lastPredictedNeuronId = brain.activate(actualNeuronId);
    }

    // Convert the final predicted neuron to a forecasted value
    const lastValue = timeSeriesData[timeSeriesData.length - 1];
    const forecast = encoder.decode(lastPredictedNeuronId, lastValue);
    
    res.json({ forecast });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 