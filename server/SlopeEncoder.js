class SlopeEncoder {
    constructor(brain) {
        this.initializeBaseNeurons(brain);
    }

    /**
     * Initialize 19 base neurons (-90 to 90 degrees)
     */
    initializeBaseNeurons(brain) {
        for (let i = -90; i <= 90; i += 10) brain.addBaseNeuron(`${i}deg`);
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
        // Calculate rise over run (run is always 1 unit in time series)
        const rise = current - previous;
        const run = 1;
        
        // Get angle in radians using arctangent
        const radians = Math.atan(rise/run);
        
        // Convert radians to degrees
        return radians * (180/Math.PI);
    }

    /**
     * Find the nearest neuron to the given slope angle in degrees
     */
    findNearestDegreeNeuron(slopeDegrees) {
        // Round to nearest 10 degrees
        const roundedDegrees = Math.round(slopeDegrees / 10) * 10;
        
        // Map degree to neuron ID (from -90:1 to 90:19)
        return (roundedDegrees + 90) / 10 + 1;
    }

    /**
     * Decode a neuron ID back to a value change
     */
    decode(neuronId, lastValue) {
        // Convert neuron ID back to degrees
        const degrees = (neuronId - 1) * 10 - 90;
        
        // Convert degrees to radians
        const radians = degrees * (Math.PI/180);
        
        // Get the change using tangent (since tan = rise/run and run = 1)
        const change = Math.tan(radians);
        
        // Return the new value
        return lastValue + change;
    }
}

module.exports = SlopeEncoder; 