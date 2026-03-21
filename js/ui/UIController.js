// UIController.js
import { CONFIG } from "../config.js";

export class UIController {
    constructor() {
        this.btnStart = document.getElementById("btnStart");
        this.btnPause = document.getElementById("btnPause");
        this.btnReset = document.getElementById("btnReset");

        this.populationSizeInput = document.getElementById("populationSizeInput");
        this.mutationRateInput = document.getElementById("mutationRateInput");
        this.simSpeedInput = document.getElementById("simSpeedInput");
        
        // Prvky pro limit
        this.infiniteRunInput = document.getElementById("infiniteRunInput");
        this.maxGenInput = document.getElementById("maxGenInput");
        this.maxGenLabel = document.getElementById("maxGenLabel");

        // NOVÉ: Prvek pro elitismus
        this.elitismInput = document.getElementById("elitismInput");

        // Prvky pro pokročilé nastavení evoluce
        this.geneLengthInput = document.getElementById("geneLengthInput");
        this.geneLengthVal = document.getElementById("geneLengthVal");
        
        this.mutStrengthInput = document.getElementById("mutStrengthInput");
        this.mutStrengthVal = document.getElementById("mutStrengthVal");
        
        this.targetXInput = document.getElementById("targetXInput");
        this.targetXVal = document.getElementById("targetXVal");

        this.onStart = null;
        this.onPause = null;
        this.onReset = null;
        this.onConfigChange = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.btnStart.addEventListener("click", () => { if (this.onStart) this.onStart(); });
        this.btnPause.addEventListener("click", () => { if (this.onPause) this.onPause(); });
        this.btnReset.addEventListener("click", () => { if (this.onReset) this.onReset(); });

        this.populationSizeInput.addEventListener("change", () => {
            CONFIG.EVOLUTION.POPULATION_SIZE = parseInt(this.populationSizeInput.value, 10);
            this.notifyConfigUpdated();
        });

        this.mutationRateInput.addEventListener("change", () => {
            CONFIG.EVOLUTION.MUTATION_RATE = parseFloat(this.mutationRateInput.value);
            this.notifyConfigUpdated();
        });

        this.simSpeedInput.addEventListener("input", () => {
            CONFIG.SIMULATION.SPEED = parseInt(this.simSpeedInput.value, 10);
            this.notifyConfigUpdated();
        });

        // Logika pro zaškrtávací políčko (Nekonečný běh)
        this.infiniteRunInput.addEventListener("change", () => {
            const isInfinite = this.infiniteRunInput.checked;
            this.maxGenInput.disabled = isInfinite;
            this.maxGenLabel.style.opacity = isInfinite ? "0.5" : "1";
            
            CONFIG.EVOLUTION.INFINITE_RUN = isInfinite;
            if (!isInfinite) {
                CONFIG.EVOLUTION.MAX_GENERATIONS = parseInt(this.maxGenInput.value, 10);
            }
            this.notifyConfigUpdated();
        });

        this.maxGenInput.addEventListener("change", () => {
            CONFIG.EVOLUTION.MAX_GENERATIONS = parseInt(this.maxGenInput.value, 10);
            this.notifyConfigUpdated();
        });

        // --- NOVÉ: Logika pro elitismus ---
        if (this.elitismInput) {
            this.elitismInput.addEventListener("change", () => {
                CONFIG.EVOLUTION.ELITISM_ENABLED = this.elitismInput.checked;
                this.notifyConfigUpdated();
            });
        }

        // Logika pro posuvníky
        if (this.geneLengthInput) {
            this.geneLengthInput.addEventListener("input", (e) => {
                const val = parseInt(e.target.value, 10);
                if (this.geneLengthVal) this.geneLengthVal.innerText = val;
                CONFIG.EVOLUTION.GENE_LENGTH = val;
                this.notifyConfigUpdated();
            });
        }

        if (this.mutStrengthInput) {
            this.mutStrengthInput.addEventListener("input", (e) => {
                const val = parseInt(e.target.value, 10);
                if (this.mutStrengthVal) this.mutStrengthVal.innerText = val;
                CONFIG.EVOLUTION.MUTATION_STRENGTH = val;
                this.notifyConfigUpdated();
            });
        }

        if (this.targetXInput) {
            this.targetXInput.addEventListener("input", (e) => {
                const val = parseInt(e.target.value, 10);
                if (this.targetXVal) this.targetXVal.innerText = val;
                CONFIG.SIMULATION.TARGET_X = val;
                this.notifyConfigUpdated();
            });
        }
    }

    notifyConfigUpdated() {
        if (this.onConfigChange) this.onConfigChange();
    }

    setStartCallback(callback) { this.onStart = callback; }
    setPauseCallback(callback) { this.onPause = callback; }
    setResetCallback(callback) { this.onReset = callback; }
    setConfigChangeCallback(callback) { this.onConfigChange = callback; }
}