class Brain {
    constructor() {
        this.neurons = [];
        this.transitions = [];
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
     * Update the context with the newly activated neuron
     */
    updateContext(neuronId) {
        this.context.unshift(neuronId);
        if (this.context.length > 10) this.context.pop();
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

    /**
     * Update the transitions with the newly activated neuron
     */
    updateTransition(fromNeuronId, toNeuronId, distance) {
        const existingTransition = this.transitions.find(t => 
            t.fromNeuronId === fromNeuronId && 
            t.toNeuronId === toNeuronId && 
            t.distance === distance
        );

        if (existingTransition) {
            existingTransition.count++;
        } else {
            this.transitions.push({
                fromNeuronId,
                toNeuronId,
                distance,
                count: 1
            });
        }
    }
}

module.exports = Brain; 