class Brain {
    constructor() {
        this.neurons = [];
        this.transitions = [];
        this.patterns = [];
        this.context = []; // Array to hold last 10 activated neurons
        this.initialize();
    }

    initialize() {
        // Create 19 base neurons (-90 to 90)
        for (let i = -90; i <= 90; i += 10) {
            this.neurons.push({
                id: this.neurons.length + 1,
                name: i === 0 ? '0' : `${i}deg`
            });
        }
    }

    findNearestNeuron(slope) {
        return this.neurons.reduce((nearest, current) => {
            const currentValue = parseFloat(current.name.replace('%', ''));
            const nearestValue = parseFloat(nearest.name.replace('%', ''));
            
            return Math.abs(currentValue - slope) < Math.abs(nearestValue - slope) 
                ? current 
                : nearest;
        });
    }

    updateContext(neuronId) {
        this.context.unshift(neuronId);
        if (this.context.length > 10) {
            this.context.pop();
        }
    }

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