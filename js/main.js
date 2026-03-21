// main.js
import { CONFIG } from "./config.js";
import { Population } from "./models/Population.js";
import { PhysicsEngine } from "./simulation/PhysicsEngine.js";
import { Renderer } from "./simulation/Renderer.js";
import { FitnessGraph } from "./ui/FitnessGraph.js";
import { UIController } from "./ui/UIController.js";

let population = null;
let isRunning = false;
let physicsEngines = []; 

let targetReached = false; 
// Proměnná pro uchování informace o dosažení limitu generací
let maxGenerationsReached = false; 

let bestRenderer = null;
let fitnessGraph = null;
let ui = null;

function initialize() {
    ui = new UIController();

    ui.setStartCallback(() => { 
        // Pokud už jsme v cíli, start neudělá nic (musí se dát Reset)
        if (!targetReached && !maxGenerationsReached) isRunning = true; 
    });
    ui.setPauseCallback(() => { isRunning = false; });
    ui.setResetCallback(() => { resetEvolution(); });
    
    // --- Tichý reset před startem ---
    ui.setConfigChangeCallback(() => { 
        // Pokud simulace ještě nezačala (historie grafu je prázdná), 
        // aplikujeme nová nastavení rovnou resetem na pozadí.
        if (!isRunning && fitnessGraph.history.length === 0) {
            resetEvolution();
        }
    });
    // ----------------------------------------

    bestRenderer = new Renderer(document.getElementById("bestCreatureCanvas"));
    fitnessGraph = new FitnessGraph(document.getElementById("fitnessGraph"));

    resetEvolution();
    requestAnimationFrame(mainLoop);
}

// Resetuje populaci a vytvoří fyzikální enginy pro všechny
function resetEvolution() {
    isRunning = false;
    targetReached = false; // Resetujeme stav vítězství
    maxGenerationsReached = false; // Resetujeme stav prohry
    population = new Population();
    fitnessGraph.history = [];
    startNewGenerationSim();
}

// Připraví fyziku pro všechny jedince v aktuální generaci
function startNewGenerationSim() {
    physicsEngines = [];
    for (let creature of population.creatures) {
        creature.resetState();
        physicsEngines.push(new PhysicsEngine(creature));
    }
}

// Simuluje celou populaci naráz
function simulateFrame() {
    const speed = CONFIG.SIMULATION.SPEED;

    for (let i = 0; i < speed; i++) {
        let allFinished = true;

        for (let engine of physicsEngines) {
            
            if (engine.creature.bodyX >= CONFIG.SIMULATION.TARGET_X) {
                isRunning = false;
                targetReached = true;
                
                for (let j = 0; j < population.creatures.length; j++) {
                    population.creatures[j].setFitness(physicsEngines[j].computeFitness());
                }
                
                const best = population.getBestCreature();
                fitnessGraph.addDataPoint(best.fitness);

                renderCurrentState(); 
                return; 
            }

            if (!engine.isFinished()) {
                engine.step();
                allFinished = false;
            }
        }

        if (allFinished) {
            for (let j = 0; j < population.creatures.length; j++) {
                population.creatures[j].setFitness(physicsEngines[j].computeFitness());
            }
            
            endGeneration();
            return; 
        }
    }
}

function endGeneration() {
    const best = population.getBestCreature();
    fitnessGraph.addDataPoint(best.fitness);

    if (!CONFIG.EVOLUTION.INFINITE_RUN && population.generation >= CONFIG.EVOLUTION.MAX_GENERATIONS) {
        isRunning = false; 
        maxGenerationsReached = true; // Zaznamenáme, že jsme narazili na limit
        console.log("Dosažen maximální počet generací.");
        renderCurrentState(); 
        return; 
    }

    population.createNextGeneration();
    startNewGenerationSim(); 
}

function renderCurrentState() {
    if (population && population.creatures.length > 0) {
        // Předáváme renderu i informaci o tom, zda byl dosažen limit generací
        bestRenderer.drawPopulation(population.creatures, population.generation, targetReached, maxGenerationsReached);
    }
    fitnessGraph.render();
}

function mainLoop() {
    if (isRunning) {
        simulateFrame();
    }
    renderCurrentState();
    requestAnimationFrame(mainLoop);
}

window.addEventListener("load", initialize);