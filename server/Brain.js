class Brain {
    constructor() {
        this.learningRate = 1; // how many times a pattern must be seen to be considered learned

        this.neurons = [];
        this.transitions = []; // The actual transitions data
        this.transitionsFromIndex = {}; // Index for looking up by fromNeuronId
        this.transitionsToIndex = {}; // Index for looking up by toNeuronId
        
        // Pattern storage
        this.patterns = [];              // The actual pattern data
        this.patternChildIndex = {};     // Index for looking up by child neuron ID
        this.patternParentIndex = {};    // Index for looking up by parent neuron ID
        
        this.contexts = [[]]  // Array of arrays, initialized with one empty level
    }

    /**
     * Add a new neuron and return its ID
     */
    addNeuron(name) {
        const id = this.neurons.length + 1;
        this.neurons.push({ id, name });
        return id;
    }

    /**
     * adds a pattern neuron and returns its id
     */
    addPatternNeuron(pattern) {
        const neuronId = this.addNeuron(`[${pattern.map(neuronId => this.getNeuronName(neuronId)).join(',')}]`);
        console.log('added pattern neuron', neuronId, this.getNeuronName(neuronId));
        return neuronId;
    }

    /**
     * returns the neuron name for a given neuron id
     */
    getNeuronName(neuronId) {
        return this.neurons[neuronId - 1].name;
    }

    /**
     * Activate a neuron and return the prediction or higher level prediction
     */
    activate(neuronId, level = 0) {

        // first, update the context with the newly activated neuron
        this.updateContext(neuronId, level);

        // we need at least 2 neurons in context to learn transitions and predict
        if (this.getContext(level).length < 2) return;

        // then, update the transition counts with the newly activated neuron - this is how the neuron learns previous patterns, strengthening connections between neurons
        this.learn(neuronId, level);

        // now that the neuron has learned the previous patterns, we can predict the next neuron to activate within our level of abstraction
        const prediction = this.predict(level);

        // finally, neurons will check if the observed pattern is a higher level concept, and if so, it will create/activate a new neuron to represent it
        // note that this is a recursive process, as the higher level neuron will also predict the next neuron to activate, and so on
        const higherLevelPrediction = this.elevate(level);

        // return the highest level prediction, or the prediction at our level if no higher level prediction is found
        return higherLevelPrediction || prediction;
    }

    /**
     * Update the context with the newly activated neuron at the specified level - newest neuron is at the front of the array
     */
    updateContext(neuronId, level) {
        // Ensure we have enough levels
        while (this.contexts.length <= level) this.contexts.push([]);

        // Add neuron to front of the specified level's context
        this.contexts[level].unshift(neuronId);
        
        // Keep each level's context to 10 neurons
        if (this.contexts[level].length > 10) this.contexts[level].pop();
    }

    /**
     * Get context for a specific level
     */
    getContext(level) {
        return this.contexts[level] || [];
    }

    /**
     * Update the transitions with the newly activated neuron - loop through context from newest to oldest neuron and learn the transitions
     */
    learn(neuronId, level) {
        const context = this.getContext(level);
        for (let i = 1; i < context.length; i++) this.updateTransition(context[i], neuronId, i);
    }

    /**
     * Find a specific transition between neurons
     */
    findTransition(fromNeuronId, toNeuronId, distance) {
        const fromIndex = this.transitionsFromIndex[fromNeuronId] || [];
        return fromIndex.find(i => 
            this.transitions[i].toNeuronId === toNeuronId && 
            this.transitions[i].distance === distance
        );
    }

    /**
     * Find a specific pattern connection between neurons
     */
    findPatternConnection(childNeuronId, parentNeuronId, position) {
        const childIndex = this.patternChildIndex[childNeuronId] || [];
        return childIndex.find(i => 
            this.patterns[i].parentNeuronId === parentNeuronId && 
            this.patterns[i].position === position
        );
    }

    /**
     * Create and add a new transition
     */
    addNewTransition(fromNeuronId, toNeuronId, distance) {
        const newTransition = {
            fromNeuronId,
            toNeuronId,
            distance,
            count: 1
        };
        
        // Add to transitions array and get its index
        const newIndex = this.transitions.push(newTransition) - 1;
        
        // Update from index
        if (!this.transitionsFromIndex[fromNeuronId]) this.transitionsFromIndex[fromNeuronId] = [];
        this.transitionsFromIndex[fromNeuronId].push(newIndex);

        // Update to index 
        if (!this.transitionsToIndex[toNeuronId]) this.transitionsToIndex[toNeuronId] = [];
        this.transitionsToIndex[toNeuronId].push(newIndex);
        
        return newIndex;
    }

    /**
     * Add a new pattern connection between levels
     */
    addPatternConnection(childNeuronId, parentNeuronId, position) {
        const newPattern = {
            childNeuronId,  // Lower level neuron ID
            parentNeuronId, // Higher level neuron ID
            position, // Position in sequence
            count: 1 // How many times this pattern has been seen
        };
        
        // Add to patterns array and get its index
        const newIndex = this.patterns.push(newPattern) - 1;
        
        // Update child index
        if (!this.patternChildIndex[childNeuronId]) this.patternChildIndex[childNeuronId] = [];
        this.patternChildIndex[childNeuronId].push(newIndex);
        
        // Update parent index
        if (!this.patternParentIndex[parentNeuronId]) this.patternParentIndex[parentNeuronId] = [];
        this.patternParentIndex[parentNeuronId].push(newIndex);
    }

    /**
     * Update the transitions with the newly activated neuron
     */
    updateTransition(fromNeuronId, toNeuronId, distance) {
        // Find existing transition
        const existingTransitionIndex = this.findTransition(fromNeuronId, toNeuronId, distance);
        
        // Update existing transition if it exists
        if (existingTransitionIndex !== undefined) {
            this.transitions[existingTransitionIndex].count++;
            return;
        }
        
        // Create new transition if it doesn't exist
        this.addNewTransition(fromNeuronId, toNeuronId, distance);
    }

    /**
     * Update a pattern connection, representing a connection between a child neuron and a parent neuron at a given position
     */
    updatePatternConnection(childNeuronId, parentNeuronId, position) {
        // Find existing pattern
        const existingPatternIndex = this.findPatternConnection(childNeuronId, parentNeuronId, position);
        
        // Update existing pattern if it exists
        if (existingPatternIndex !== undefined) {
            this.patterns[existingPatternIndex].count++;
            return;
        }
        
        // Create new pattern connection if it doesn't exist
        this.addPatternConnection(childNeuronId, parentNeuronId, position);
    }

    /**
     * Predict the next value based on the transitions to a given neuron
     */
    predict(level) {
        const context = this.getContext(level);
        
        // we will store the predicted neurons here with their probability scores derived from the transitions
        const predictions = {};
        
        // loop through context from newest to oldest neuron and predict the next neuron to activate
        for (let i = 0; i < context.length; i++) {

            // we are predicting the next neuron to activate based on the neuron in context
            const contextNeuronId = context[i];

            // the distance starts with 1 for the newest neuron in context - increases as we look at older neurons in context
            const distance = i + 1;
            
            // get all transitions from this context neuron for the distance we are looking at
            const fromIndex = this.transitionsFromIndex[contextNeuronId] || [];
            
            // add counts for each transition at this distance
            fromIndex.forEach(transitionIdx => {

                // get the transition from the transitions array
                const transition = this.transitions[transitionIdx];

                // if the transition between neurons is not strong enough, ignore it
                if (transition.count < this.learningRate) return;

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
     * returns the neuron id representing the pattern
     * @param {number[]} detectedPattern - Array of neuron IDs representing pattern
     * @returns {number} - returns the neuron id representing the pattern
     */
    getPatternNeuron(detectedPattern) {
        // Store parent neurons with their probability scores
        const parentScores = {};
        
        // For each neuron in the pattern
        detectedPattern.forEach((neuronId, position) => {
            // Get all patterns this neuron participates in as a child
            const childPatterns = this.patternChildIndex[neuronId] || [];
            
            // Add scores for each parent neuron this connects to at this position
            childPatterns.forEach(patternIdx => {
                const pattern = this.patterns[patternIdx];
                
                // ignore the parents that are not at the position we are looking at
                if (pattern.position !== position) return;

                // Weight decreases as position difference increases
                const positionDiff = Math.abs(pattern.position - position);
                const weight = Math.max(1.1 - (positionDiff * 0.1), 0.1);
                
                // Add weighted score to parent's total
                parentScores[pattern.parentNeuronId] = (parentScores[pattern.parentNeuronId] || 0) + (pattern.count * weight);
            });
        });

        // If no patterns found, return null or create new pattern
        if (Object.keys(parentScores).length === 0) return null;

        // Find parent with highest score
        let highestScore = 0;
        let bestParentId = null;
        
        for (const [parentId, score] of Object.entries(parentScores)) {
            if (score > highestScore) {
                highestScore = score;
                bestParentId = parseInt(parentId);
            }
        }

        return bestParentId;
    }

    /**
     * Check if two adjacent neurons in context form a pattern
     * @param {number} position - Position in context to check (checks this position and next)
     * @returns {boolean} - True if transition count > learningRate
     */
    isPattern(position, level) {
        // Get transitions from the earlier neuron
        const context = this.getContext(level);
        const neuronId = context[position];
        // console.log('isPattern', position, context, neuronId);

        // Check if any transition to the later neuron has count > learningRate
        const transitionIdx = this.transitionsFromIndex[neuronId] || [];
        return transitionIdx.some(idx => {
            const transition = this.transitions[idx];
            // console.log('transition', transition, transition.toNeuronId === context[position - 1] && transition.distance === 1 && transition.count >= this.learningRate);
            return transition.toNeuronId === context[position - 1] && transition.distance === 1 && transition.count >= this.learningRate;
        });
    }

    /**
     * Detect the pattern and represent it as a higher level prediction and activate it
     */
    elevate(level) {
        const context = this.getContext(level);

        // find the first position where the pattern breaks
        let patternBreak = 0;
        for (let i = 1; i < context.length; i++) {
            if (!this.isPattern(i, level)) {
                patternBreak = i;
                break;
            }
            patternBreak = i + 1; // if we get through the whole loop, this will be context.length
        }
        console.log('patternBreak', context, patternBreak);

        // if there are no patterns, return null to indicate no elevation was done
        if (patternBreak <= 1) return null;

        // extract the pattern from the context based on the pattern break
        const detectedPattern = context.slice(0, patternBreak).toReversed();
        console.log('detectedPattern', detectedPattern);

        // get or create the pattern neuron
        const patternNeuronId = this.getPatternNeuron(detectedPattern) || this.addPatternNeuron(detectedPattern);
        console.log('patternNeuronId', patternNeuronId, this.getNeuronName(patternNeuronId));

        // loop through the pattern neurons and update the pattern connections
        for (let i = 1; i < detectedPattern.length; i++) this.updatePatternConnection(detectedPattern[i], patternNeuronId, i);

        // now activate the pattern neuron, which will return the higher level prediction
        return this.activate(patternNeuronId, level + 1);
    }

    /**
     * returns the higher level neurons that have a connection to the given neuron
     */
    getPatternsOfChild(neuronId) {
        return (this.patternChildIndex[neuronId] || []).map(index => this.patterns[index]);
    }

    /**
     * returns the pattern a neuron represents
     */
    getNeuronPattern(neuronId) {
        return (this.patternParentIndex[neuronId] || []).map(index => this.patterns[index]);
    }

}

module.exports = Brain; 