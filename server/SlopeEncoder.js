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
        let lastPredictions = {}; // predicted neurons for each activated neuron
        const accuracy = []; // array of accuracy values for each prediction
        for (let i = 1; i < timeSeriesData.length; i++) {
            
            // Encode and activate current value
            const current = timeSeriesData[i];
            const previous = timeSeriesData[i-1];
            const actualDegrees = this.calculateSlopeDegrees(current, previous);
            const actualNeuronId = this.findNearestDegreeNeuron(actualDegrees);
            console.log(`Encoded neuron ${actualNeuronId}: ${this.brain.getNeuronName(actualNeuronId)}`);
            
            // Log prediction accuracy if we had a prediction - Calculate accuracy based on how close the predictions are (13 possible neurons)
            if (lastPredictions && Object.keys(lastPredictions).length > 0) {
                // Calculate weighted average of predicted neuron
                const predictedDegrees = this.calculateWeightedAverageDegrees(lastPredictions);
                const degreeDiff = Math.abs(predictedDegrees - actualDegrees);
                const accuracyValue = Math.max(0, 100 - (degreeDiff / 180) * 100);
                console.log(`PredictionAccuracy: ${accuracyValue.toFixed(1)}%`);
                accuracy.push(accuracyValue.toFixed(1));
            }
    
            // Get predictions and convert pattern neurons to base neurons
            const rawPredictions = this.brain.activate(actualNeuronId) || {};
            lastPredictions = {};
            for (const [neuronId, score] of Object.entries(rawPredictions)) {
                const baseNeuronId = this.brain.getStartingBaseNeuronId(neuronId);
                lastPredictions[baseNeuronId] = (lastPredictions[baseNeuronId] || 0) + score;
            }

            if (Object.keys(lastPredictions).length > 0) {
                console.log('Predictions:', Object.entries(lastPredictions).map(([id, score]) => 
                    `${this.brain.getNeuronName(id)}: ${score.toFixed(2)}`
                ).join(', '));
            }
        }

        // show the accuracy values and average
        const avgAccuracy = accuracy.reduce((sum, val) => sum + Number(val), 0) / accuracy.length;
        console.log('accuracy', accuracy, 'average:', avgAccuracy.toFixed(1) + '%', 'max level:', this.brain.maxLevel);
    
        // Convert the final predicted neuron to a forecasted value - get the lowest level base neuron if the neuron is a pattern neuron
        const predictedDegrees = this.calculateWeightedAverageDegrees(lastPredictions);
        const lastValue = timeSeriesData[timeSeriesData.length - 1];
        return this.decodeFromDegrees(predictedDegrees, lastValue);
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
     * Calculate weighted average degrees from prediction scores
     */
    calculateWeightedAverageDegrees(predictions) {
        let totalScore = 0;
        let weightedSum = 0;
        
        for (const [neuronId, score] of Object.entries(predictions)) {
            const degrees = this.neuronIdToDegrees(parseInt(neuronId));
            weightedSum += degrees * score;
            totalScore += score;
        }
        
        return totalScore === 0 ? null : weightedSum / totalScore;
    }

    /**
     * Convert a neuron ID to its corresponding degrees
     */
    neuronIdToDegrees(neuronId) {
        return (neuronId - 1) * this.granularity - 90;
    }

    /**
     * Decode a slope angle in degrees back to a value change
     */
    decodeFromDegrees(degrees, lastValue) {
        // Convert degrees to radians
        const radians = degrees * (Math.PI/180);
        
        // Get the change using tangent (since tan = rise/run and run = average delta between points in the time series)
        const change = Math.tan(radians) * this.avgDelta;
        
        // Return the new value
        return lastValue + change;
    }
}

export default SlopeEncoder; 