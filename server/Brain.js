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

        // first, update the context with the newly activated neuron
        this.updateContext(neuronId);

        // then, update the transition counts with the newly activated neuron - this is how the neuron learns previous patterns, strengthening connections between neurons
        this.learn(neuronId);

        // now that the neuron has learned the previous patterns, we can predict the next neuron to activate within our level of abstraction
        const prediction = this.predict();

        // finally, neurons will check if the observed pattern is a higher level concept, and if so, it will create/activate a new neuron to represent it
        // note that this is a recursive process, as the higher level neuron will also predict the next neuron to activate, and so on
        const higherLevelPrediction = this.elevate();

        // return the highest level prediction, or the prediction at our level if no higher level prediction is found
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

        // Update existing transition if it exists
        if (transitionIndex !== -1) {
            this.transitions[fromIndex[transitionIndex]].count++;
            return;
        } 

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

    /**
     * Predict the next value based on the transitions to a given neuron
     */
    predict() {
        
        // we will store the predicted neurons here with their probability scores derived from the transitions
        const predictions = {};
        
        // loop through context from newest to oldest neuron and predict the next neuron to activate
        for (let i = 0; i < this.context.length; i++) {

            // we are predicting the next neuron to activate based on the neuron in context
            const contextNeuronId = this.context[i];

            // the distance starts with 1 for the newest neuron in context - increases as we look at older neurons in context
            const distance = i + 1;
            
            // get all transitions from this context neuron for the distance we are looking at
            const fromIndex = this.transitionsFromIndex[contextNeuronId] || [];
            
            // add counts for each transition at this distance
            fromIndex.forEach(transitionIdx => {

                // get the transition from the transitions array
                const transition = this.transitions[transitionIdx];

                // ignore the transitions that are not at the distance we are looking at
                if (transition.distance !== distance) return;

                // add or increment the prediction score for the neuron we are predicting 
                // the further away the neuron is in context, the less weight it has
                // weight decreases linearly from 1 to 0.1 as distance increases from 1 to 10
                const weight = Math.max(1.1 - (distance * 0.1), 0.1);
                predictions[transition.toNeuronId] = (predictions[transition.toNeuronId] || 0) + (transition.count * weight);
            });
        }

        // if there are no predictions, return null
        if (Object.keys(predictions).length === 0) return null;

        // find the neuron with highest prediction score and return its id
        let highestScore = 0;
        let predictedNeuronId = null;
        for (const [neuronId, score] of Object.entries(predictions)) {
            if (score > highestScore) {
                highestScore = score;
                predictedNeuronId = neuronId;
            }
        }
        return predictedNeuronId;
    }

    /**
     * Detect the pattern and represent it as a higher level prediction (elevate the concept)
     */
    elevate() {
        // TODO: Implement pattern detection and elevation
    }

}

module.exports = Brain; 