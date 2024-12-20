class Brain {
    constructor() {
        this.neurons = [];
        this.transitions = [];  // The actual transitions data
        this.transitionsFromIndex = {};  // Index for looking up by fromNeuronId
        this.transitionsToIndex = {};    // Index for looking up by toNeuronId
        this.patterns = [];
        this.context = []; // Array to hold last 10 activated neurons
    }

    /**
     * Add a new base neuron and return its ID
     */
    addBaseNeuron(name) {
        const id = this.neurons.length + 1;
        this.neurons.push({ id, name });
        return id;
    }

    /**
     * Activate a neuron and return the prediction or higher level prediction
     */
    activate(neuronId) {
        this.updateContext(neuronId);
        this.learn(neuronId);
        const prediction = this.predict();
        const higherLevelPrediction = this.elevate();
        return higherLevelPrediction || prediction;
    }

    /**
     * Update the context with the newly activated neuron - newest neuron is at the front of the array
     */
    updateContext(neuronId) {
        this.context.unshift(neuronId); // add the neuron to the front of the array
        if (this.context.length > 10) this.context.pop(); // keep the array to 10 neurons
    }

    /**
     * Update the transitions with the newly activated neuron
     */
    learn(neuronId) {
        if (this.context.length > 1) 
            for (let i = 1; i < this.context.length; i++)
                this.updateTransition(this.context[i], neuronId, i);
    }

    /**
     * Update the transitions with the newly activated neuron
     */
    updateTransition(fromNeuronId, toNeuronId, distance) {
        // Find existing transition using the index
        const fromIndex = this.transitionsFromIndex[fromNeuronId] || [];
        const transitionIndex = fromIndex.findIndex(i => 
            this.transitions[i].toNeuronId === toNeuronId && 
            this.transitions[i].distance === distance
        );

        if (transitionIndex !== -1) {
            // Update existing transition
            this.transitions[fromIndex[transitionIndex]].count++;
        } else {
            // Create new transition
            const newTransition = {
                fromNeuronId,
                toNeuronId,
                distance,
                count: 1
            };
            
            // Add to transitions array and get its index
            const newIndex = this.transitions.push(newTransition) - 1;
            
            // Update indexes
            if (!this.transitionsFromIndex[fromNeuronId]) this.transitionsFromIndex[fromNeuronId] = [];
            if (!this.transitionsToIndex[toNeuronId]) this.transitionsToIndex[toNeuronId] = [];
            this.transitionsFromIndex[fromNeuronId].push(newIndex);
            this.transitionsToIndex[toNeuronId].push(newIndex);
        }
    }

    /**
     * Predict the next value based on the transitions
     */
    predict() {
        // TODO: Implement prediction logic
        return null;
    }

    /**
     * Detect the pattern and represent it as a higher level prediction (elevate the concept)
     */
    elevate() {
        // TODO: Implement pattern detection and elevation
    }

}

module.exports = Brain; 