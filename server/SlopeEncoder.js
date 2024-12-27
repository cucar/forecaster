class SlopeEncoder {

    /**
     * constructor
     */
    constructor(brain, timeSeriesData) {
        this.granularity = 15; // factor of this many degrees is used to cover -90 to 90 degrees
        this.initializeBaseNeurons(brain); // create the base neurons (-90 to 90 degrees)
        this.avgDelta = this.initializeAvgDelta(timeSeriesData); // initialize scaled unit x, which is used to calculate the run for the slope
        console.log(this.avgDelta, timeSeriesData);
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
    initializeBaseNeurons(brain) {
        for (let i = -90; i <= 90; i += this.granularity) brain.addNeuron(`${i}deg`);
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

module.exports = SlopeEncoder; 