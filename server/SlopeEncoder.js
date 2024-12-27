class SlopeEncoder {

    /**
     * constructor
     */
    constructor(brain) {
        this.brain = brain; // brain instance that will learn the time series data
        this.granularity = 15; // factor of this many degrees is used to cover -90 to 90 degrees
        this.initializeBaseNeurons(); // create the base neurons (-90 to 90 degrees)
    }

    /**
     * activates the time series data in the brain
     */
    activate(timeSeriesData) {

        // initialize scaled unit x, which is used to calculate the run for the slope
        this.avgDelta = this.initializeAvgDelta(timeSeriesData);
        console.log(this.avgDelta, timeSeriesData);
        
        // encode the time series data into neurons and activate them
        let lastPredictedNeuronId = null; // predicted neuron id for each activated neuron
        const accuracy = []; // array of accuracy values for each prediction
        for (let i = 1; i < timeSeriesData.length; i++) {
            
            // Encode and activate current value
            const current = timeSeriesData[i];
            const previous = timeSeriesData[i-1];
            const actualNeuronId = this.encode(current, previous);
            console.log(`Encoded neuron ${actualNeuronId}: ${this.brain.getNeuronName(actualNeuronId)}`);
            
            // Log prediction accuracy if we had a prediction - Calculate accuracy based on how close the predictions are (13 possible neurons)
            if (lastPredictedNeuronId) {
                const lastPredictedBaseNeuronId = this.brain.getStartingBaseNeuronId(lastPredictedNeuronId);
                const distance = Math.abs(lastPredictedBaseNeuronId - actualNeuronId);
                const accuracyValue = Math.max(0, 100 - 100 * (distance / 12));
                console.log(`PredictionAccuracy: ${accuracyValue.toFixed(1)}%`);
                accuracy.push(accuracyValue.toFixed(1));
            }
    
            // Get prediction for next value
            lastPredictedNeuronId = this.brain.activate(actualNeuronId);
            if (lastPredictedNeuronId) console.log(`Predicted Neuron: ${lastPredictedNeuronId} ${this.brain.getNeuronName(lastPredictedNeuronId)}`);
        }

        // show the accuracy values and average
        const avgAccuracy = accuracy.reduce((sum, val) => sum + Number(val), 0) / accuracy.length;
        console.log('accuracy', accuracy, 'average:', avgAccuracy.toFixed(1) + '%');
    
        // Convert the final predicted neuron to a forecasted value - get the lowest level base neuron if the neuron is a pattern neuron
        const predictedBaseNeuronId = this.brain.getStartingBaseNeuronId(lastPredictedNeuronId);
        const lastValue = timeSeriesData[timeSeriesData.length - 1];
        return this.decode(predictedBaseNeuronId, lastValue);
    }

    /**
     * initializes average of the delta between points in the time series, which is used to calculate the run for the slope
     * by using the average delta, we can distribute the angle of the slope more evenly across the neurons
     */
    initializeAvgDelta(series) {
        const count = series.length;
        return count <= 1 ? 1 : series.reduce((sum, point, i) => i === 0 ? 0 : sum + Math.abs(point - series[i - 1]), 0) / (count - 1); 
    }

    /**
     * Initialize the base neurons (-90 to 90 degrees)
     */
    initializeBaseNeurons() {
        for (let i = -90; i <= 90; i += this.granularity) this.brain.addNeuron(`${i}deg`);
    }

    /**
     * Encode the current and previous values in the time series into a neuron
     */
    encode(current, previous) {
        const slopeDegrees = this.calculateSlopeDegrees(current, previous);
        return this.findNearestDegreeNeuron(slopeDegrees);
    }

    /**
     * Calculate the slope angle in degrees between the current and previous values
     */
    calculateSlopeDegrees(current, previous) {
        // Calculate rise over run (run is the average delta between points in the time series)
        const rise = current - previous;
        const run = this.avgDelta;
        
        // Get angle in radians using arctangent
        const radians = Math.atan(rise/run);
        
        // Convert radians to degrees
        return radians * (180/Math.PI);
    }

    /**
     * Find the nearest neuron to the given slope angle in degrees
     */
    findNearestDegreeNeuron(slopeDegrees) {
        // Round to nearest degrees
        const roundedDegrees = Math.round(slopeDegrees / this.granularity) * this.granularity;

        // Map degree to neuron ID (from -90:1 to 90:granularity*2 + 1)
        return (roundedDegrees + 90) / this.granularity + 1;
    }

    /**
     * Decode a neuron ID back to a value change
     */
    decode(neuronId, lastValue) {
        // Convert neuron ID back to degrees
        const degrees = (neuronId - 1) * this.granularity - 90;
        
        // Convert degrees to radians
        const radians = degrees * (Math.PI/180);
        
        // Get the change using tangent (since tan = rise/run and run = average delta between points in the time series)
        const change = Math.tan(radians) * this.avgDelta;
        
        // Return the new value
        return lastValue + change;
    }
}

export default SlopeEncoder; 