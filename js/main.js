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

// NOVÉ: Proměnná pro uchování informace o dosažení cíle
let targetReached = false; 

let bestRenderer = null;
let fitnessGraph = null;
let ui = null;

function initialize() {
    ui = new UIController();

    ui.setStartCallback(() => { 
        // Pokud už jsme v cíli, start neudělá nic (musí se dát Reset)
        if (!targetReached) isRunning = true; 
    });
    ui.setPauseCallback(() => { isRunning = false; });
    ui.setResetCallback(() => { resetEvolution(); });
    ui.setConfigChangeCallback(() => { /* Změny se aplikují s další generací */ });

    bestRenderer = new Renderer(document.getElementById("bestCreatureCanvas"));
    fitnessGraph = new FitnessGraph(document.getElementById("fitnessGraph"));

    resetEvolution();
    requestAnimationFrame(mainLoop);
}

// Resetuje populaci a vytvoří fyzikální enginy pro všechny
function resetEvolution() {
    isRunning = false;
    targetReached = false; // Resetujeme stav vítězství
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

        // Krok fyziky pro každého tvora
        for (let engine of physicsEngines) {
            
            // Okamžitá kontrola vítězství v daném kroku!
            if (engine.creature.bodyX >= CONFIG.SIMULATION.TARGET_X) {
                isRunning = false;
                targetReached = true;
                
                // Uložíme fitness všem, abychom měli aktuální data pro graf
                for (let j = 0; j < population.creatures.length; j++) {
                    population.creatures[j].setFitness(physicsEngines[j].computeFitness());
                }
                
                // Musíme ohlásit vítězství i grafu, jinak bude o generaci pozadu!
                const best = population.getBestCreature();
                fitnessGraph.addDataPoint(best.fitness);

                renderCurrentState(); // Vykreslíme vítěznou obrazovku
                return; // Definitivně vyskočíme ze smyčky
            }

            if (!engine.isFinished()) {
                engine.step();
                allFinished = false;
            }
        }

        // Pokud už všichni dočerpali své geny a spadli na zem, generace končí
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

    // KONTROLA LIMITU GENERACÍ
    if (!CONFIG.EVOLUTION.INFINITE_RUN && population.generation >= CONFIG.EVOLUTION.MAX_GENERATIONS) {
        isRunning = false; 
        console.log("Dosažen maximální počet generací.");
        renderCurrentState(); 
        return; 
    }

    population.createNextGeneration();
    startNewGenerationSim(); 
}

function renderCurrentState() {
    if (population && population.creatures.length > 0) {
        // NOVÉ: Předáváme renderu informaci, zda má nakreslit vítěznou obrazovku
        bestRenderer.drawPopulation(population.creatures, population.generation, targetReached);
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