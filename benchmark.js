const { performance } = require('perf_hooks');

// Generate test data
const iterations = 1000; // Number of times to repeat the test for average
const arraySize = 10000; // Size of the array
const workouts = Array.from({ length: arraySize }, (_, i) => ({
    name: `Workout ${i}`,
    duration: Math.floor(Math.random() * 60) + 10,
    calories: Math.floor(Math.random() * 500) + 100,
    ts: Date.now() - i * 86400000
}));

console.log(`Array Size: ${arraySize}`);
console.log(`Iterations: ${iterations}`);

// Baseline: slice().reverse().forEach()
function benchmarkSliceReverseForEach() {
    let dummySum = 0;
    const start = performance.now();
    for (let j = 0; j < iterations; j++) {
        const recent = workouts.slice().reverse(); // The operation being tested
        recent.forEach(w => {
            dummySum += w.duration; // Minimal work inside loop
        });
    }
    const end = performance.now();
    return (end - start);
}

// Optimized: Reverse for loop
function benchmarkReverseForLoop() {
    let dummySum = 0;
    const start = performance.now();
    for (let j = 0; j < iterations; j++) {
        // The optimized operation
        for (let i = workouts.length - 1; i >= 0; i--) {
            const w = workouts[i];
            dummySum += w.duration; // Minimal work inside loop
        }
    }
    const end = performance.now();
    return (end - start);
}

// Run Baseline
const baselineTime = benchmarkSliceReverseForEach();
const baselineOpsPerSec = iterations / (baselineTime / 1000);

console.log(`Baseline (slice().reverse().forEach()): ${baselineTime.toFixed(2)}ms`);
console.log(`Baseline Ops/Sec: ${baselineOpsPerSec.toFixed(2)}`);

// Run Optimized
const optimizedTime = benchmarkReverseForLoop();
const optimizedOpsPerSec = iterations / (optimizedTime / 1000);

console.log(`Optimized (reverse for loop): ${optimizedTime.toFixed(2)}ms`);
console.log(`Optimized Ops/Sec: ${optimizedOpsPerSec.toFixed(2)}`);

// Calculate Improvement
const improvement = ((baselineTime - optimizedTime) / baselineTime) * 100;
console.log(`Improvement: ${improvement.toFixed(2)}%`);

if (optimizedTime < baselineTime) {
    console.log("✅ Optimization successful!");
} else {
    console.log("❌ Optimization failed or negligible.");
}
