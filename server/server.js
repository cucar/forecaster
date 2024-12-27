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
    const encoder = new SlopeEncoder(brain, timeSeriesData);

    let lastPredictedNeuronId = null;

    // Process all slopes except the last pair
    for (let i = 1; i < timeSeriesData.length; i++) {
        const current = timeSeriesData[i];
        const previous = timeSeriesData[i-1];
        
        // Encode and activate current value
        const actualNeuronId = encoder.encode(current, previous);
        console.log(`Encoded neuron ${actualNeuronId}: ${brain.getNeuronName(actualNeuronId)}`);
        
        // Log prediction accuracy if we had a prediction - Calculate accuracy based on how close the predictions are (13 possible neurons)
        if (lastPredictedNeuronId) {
            const lastPredictedBaseNeuronId = brain.getStartingBaseNeuronId(lastPredictedNeuronId);
            const distance = Math.abs(lastPredictedBaseNeuronId - actualNeuronId);
            const accuracy = Math.max(0, 100 - 100 * (distance / 12));
            console.log(`PredictionAccuracy: ${accuracy.toFixed(1)}%`);
        }

        // Get prediction for next value
        lastPredictedNeuronId = brain.activate(actualNeuronId);
        if (lastPredictedNeuronId) console.log(`Predicted Neuron: ${lastPredictedNeuronId} ${brain.getNeuronName(lastPredictedNeuronId)}`);
    }

    // Convert the final predicted neuron to a forecasted value - get the lowest level base neuron if the neuron is a pattern neuron
    const predictedBaseNeuronId = brain.getStartingBaseNeuronId(lastPredictedNeuronId);
    const lastValue = timeSeriesData[timeSeriesData.length - 1];
    const forecast = encoder.decode(predictedBaseNeuronId, lastValue);
    
    res.json({ forecast });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 