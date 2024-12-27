class Brain {
    constructor() {
        this.neurons = [];
        
        // Generic connection storage
        this.connections = {
            temporal: {
                items: [],              // All temporal connections (transitions)
                fromIndex: {},          // From neuron -> connection indices
                toIndex: {},            // To neuron -> connection indices
                type: 'distance'        // Weight factor type
            },
            hierarchical: {
                items: [],              // All hierarchical connections (patterns)
                fromIndex: {},          // Child neuron -> connection indices
                toIndex: {},            // Parent neuron -> connection indices
                type: 'position'        // Weight factor type
            }
        };
        
        this.context = [];
    }

    /**
     * Generic connection finder
     */
    findConnection(connectionType, fromId, toId, weightPosition) {
        const store = this.connections[connectionType];
        const fromIndex = store.fromIndex[fromId] || [];
        
        return fromIndex.find(i => {
            const connection = store.items[i];
            return connection.toId === toId && 
                   connection[store.type] === weightPosition;
        });
    }

    /**
     * Generic connection adder
     */
    addConnection(connectionType, fromId, toId, weightPosition) {
        const store = this.connections[connectionType];
        const newConnection = {
            fromId,
            toId,
            [store.type]: weightPosition,
            count: 1
        };
        
        const newIndex = store.items.push(newConnection) - 1;
        
        // Update indexes
        if (!store.fromIndex[fromId]) store.fromIndex[fromId] = [];
        if (!store.toIndex[toId]) store.toIndex[toId] = [];
        store.fromIndex[fromId].push(newIndex);
        store.toIndex[toId].push(newIndex);
        
        return newIndex;
    }

    /**
     * Generic prediction maker
     */
    makePrediction(connectionType, sourceIds, weightFactor = 0.1) {
        const predictions = {};
        const store = this.connections[connectionType];
        
        sourceIds.forEach((sourceId, position) => {
            const connections = store.fromIndex[sourceId] || [];
            
            connections.forEach(idx => {
                const connection = store.items[idx];
                const weight = Math.max(1.1 - (position * weightFactor), 0.1);
                predictions[connection.toId] = (predictions[connection.toId] || 0) + 
                    (connection.count * weight);
            });
        });
        
        // Find highest scoring prediction
        let highestScore = 0;
        let bestPrediction = null;
        
        for (const [id, score] of Object.entries(predictions)) {
            if (score > highestScore) {
                highestScore = score;
                bestPrediction = parseInt(id);
            }
        }
        
        return bestPrediction;
    }

    // Specific implementations using the generic system
    updateTransition(fromId, toId, distance) {
        const existingIdx = this.findConnection('temporal', fromId, toId, distance);
        
        if (existingIdx !== undefined) {
            this.connections.temporal.items[existingIdx].count++;
            return;
        }
        
        this.addConnection('temporal', fromId, toId, distance);
    }

    predict() {
        return this.makePrediction('temporal', this.context);
    }

    getPatternNeuron(detectedPattern) {
        return this.makePrediction('hierarchical', detectedPattern);
    }
}

export default Brain; 