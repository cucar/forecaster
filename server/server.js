const express = require('express');
const cors = require('cors');
const Brain = require('./Brain');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to calculate slope percentage
function calculateSlope(current, previous) {
    if (previous === 0) return current > 0 ? 100 : current < 0 ? -100 : 0;
    const slopePercentage = ((current - previous) / Math.abs(previous)) * 100;
    return Math.max(Math.min(slopePercentage, 100), -100);
}

// Forecast endpoint
app.post('/api/forecast', (req, res) => {
    const { timeSeriesData } = req.body;
    
    if (timeSeriesData.length < 2) {
        return res.status(400).json({ error: 'Need at least 2 numbers for forecasting' });
    }

    // Create a new brain instance for this request
    const brain = new Brain();

    // Process all slopes except the last pair
    for (let i = 1; i < timeSeriesData.length; i++) {
        const current = timeSeriesData[i];
        const previous = timeSeriesData[i-1];
        const slope = calculateSlope(current, previous);

        // Find and activate the nearest neuron
        const activatedNeuron = brain.findNearestNeuron(slope);
        
        // Update context with the newly activated neuron
        brain.updateContext(activatedNeuron.id);

        // If we have previous context, update transitions
        if (brain.context.length > 1) {
            for (let j = 1; j < brain.context.length; j++) {
                brain.updateTransition(brain.context[j], activatedNeuron.id, j);
            }
        }
    }

    // For now, just return the last value and debug info
    res.json({ 
        forecast: timeSeriesData[timeSeriesData.length - 1],
        debug: {
            context: brain.context,
            transitions: brain.transitions
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 