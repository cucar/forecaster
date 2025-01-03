// Spatial Pooler Implementation

class SpatialPooler {
    constructor(pruneThreshold = 1, decayRate = 0.9) {
      this.occurrences = {}; // Tracks co-activations of neuron pairs
      this.patterns = {};    // Tracks parent-child relationships for higher patterns
      this.pruneThreshold = pruneThreshold; // Minimum count to retain an entry
      this.decayRate = decayRate;           // Decay factor for sleep cycle
    }
  
    // Add an observation of activated neurons
    observe(neurons) {
      // Track co-activations in the occurrences table
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const pairKey = this._getPairKey(neurons[i], neurons[j]);
          this.occurrences[pairKey] = (this.occurrences[pairKey] || 0) + 1;
        }
      }
  
      // Create or update patterns for higher-order neurons
      const parentNeuron = this._createOrUpdatePattern(neurons);
      if (parentNeuron) {
        neurons.forEach((neuron) => {
          const patternKey = `${parentNeuron}-${neuron}`;
          this.patterns[patternKey] = (this.patterns[patternKey] || 0) + 1;
        });
      }
    }
  
    // Create or update a higher-order neuron for a pattern
    _createOrUpdatePattern(neurons) {
      const patternKey = neurons.sort().join(",");
      if (!this.patterns[patternKey]) {
        const parentNeuron = `N${Object.keys(this.patterns).length + 1}`;
        this.patterns[patternKey] = { parent: parentNeuron, count: 1 };
        return parentNeuron;
      } else {
        this.patterns[patternKey].count += 1;
        return this.patterns[patternKey].parent;
      }
    }
  
    // Perform a sleep cycle to prune unused patterns
    sleep() {
      // Decay and prune occurrences
      for (const key in this.occurrences) {
        this.occurrences[key] *= this.decayRate;
        if (this.occurrences[key] < this.pruneThreshold) {
          delete this.occurrences[key];
        }
      }
  
      // Decay and prune patterns
      for (const key in this.patterns) {
        this.patterns[key].count *= this.decayRate;
        if (this.patterns[key].count < this.pruneThreshold) {
          delete this.patterns[key];
        }
      }
    }
  
    // Helper method to generate a unique key for neuron pairs
    _getPairKey(neuron1, neuron2) {
      return [neuron1, neuron2].sort().join("-");
    }
  
    // Debugging utility to print current tables
    printTables() {
      console.log("Occurrences Table:", this.occurrences);
      console.log("Patterns Table:", this.patterns);
    }
  }
  
  // Example Usage
  const pooler = new SpatialPooler();
  
  // Observing activations of neurons
  pooler.observe(["P1", "P2", "P3"]);
  pooler.observe(["P1", "P2", "P4"]);
  pooler.observe(["P2", "P3", "P4"]);
  
  // Print the tables before pruning
  console.log("Before Sleep:");
  pooler.printTables();
  
  // Run a sleep cycle to prune less relevant patterns
  pooler.sleep();
  
  // Print the tables after pruning
  console.log("After Sleep:");
  pooler.printTables();
  