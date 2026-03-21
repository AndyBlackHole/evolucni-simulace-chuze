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

        // 1) Velikost populace
        this.populationSizeInput.addEventListener("change", () => {
            let val = parseInt(this.populationSizeInput.value, 10);
            if (isNaN(val)) val = 60; 
            val = Math.max(10, Math.min(500, val));
            this.populationSizeInput.value = val;
            CONFIG.EVOLUTION.POPULATION_SIZE = val;
            this.notifyConfigUpdated();
        });

        // 2) Mutation rate
        this.mutationRateInput.addEventListener("change", () => {
            let val = parseFloat(this.mutationRateInput.value);
            // PRIDANO: Ošetření proti textu
            if (isNaN(val)) val = 0.08;
            val = Math.max(0, Math.min(1, val)); 
            this.mutationRateInput.value = val;
            CONFIG.EVOLUTION.MUTATION_RATE = val;
            this.notifyConfigUpdated();
        });

        // 3) Rychlost simulace
        this.simSpeedInput.addEventListener("input", () => {
            let val = parseInt(this.simSpeedInput.value, 10);
            // PRIDANO: Ošetření proti textu
            if (isNaN(val)) val = 1;
            val = Math.max(1, Math.min(5, val)); 
            CONFIG.SIMULATION.SPEED = val;
            this.notifyConfigUpdated();
        });

        // 4) Logika pro nekonečný běh
        this.infiniteRunInput.addEventListener("change", () => {
            const isInfinite = this.infiniteRunInput.checked;
            this.maxGenInput.disabled = isInfinite;
            this.maxGenLabel.style.opacity = isInfinite ? "0.5" : "1";
            CONFIG.EVOLUTION.INFINITE_RUN = isInfinite;
            this.notifyConfigUpdated();
        });

        // 5) Max generací
        this.maxGenInput.addEventListener("change", () => {
            let val = parseInt(this.maxGenInput.value, 10);
            if (isNaN(val)) val = 50;
            val = Math.max(1, Math.min(1000, val));
            this.maxGenInput.value = val;
            CONFIG.EVOLUTION.MAX_GENERATIONS = val;
            this.notifyConfigUpdated();
        });

        if (this.elitismInput) {
            this.elitismInput.addEventListener("change", () => {
                CONFIG.EVOLUTION.ELITISM_ENABLED = this.elitismInput.checked;
                this.notifyConfigUpdated();
            });
        }

        // 6) Délka genomu (posuvník)
        if (this.geneLengthInput) {
            this.geneLengthInput.addEventListener("input", (e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 100;
                val = Math.max(20, Math.min(300, val)); 
                if (this.geneLengthVal) this.geneLengthVal.innerText = val;
                CONFIG.EVOLUTION.GENE_LENGTH = val;
                this.notifyConfigUpdated();
            });
        }

        // 7) Síla mutace (posuvník)
        if (this.mutStrengthInput) {
            this.mutStrengthInput.addEventListener("input", (e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 25;
                val = Math.max(1, Math.min(90, val));
                if (this.mutStrengthVal) this.mutStrengthVal.innerText = val;
                CONFIG.EVOLUTION.MUTATION_STRENGTH = val;
                this.notifyConfigUpdated();
            });
        }

        // 8) Vzdálenost cíle (posuvník)
        if (this.targetXInput) {
            this.targetXInput.addEventListener("input", (e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 500;
                val = Math.max(200, Math.min(1000, val));
                
                // Zobrazení čisté vzdálenosti v UI (např. "500")
                if (this.targetXVal) this.targetXVal.innerText = val;
                
                // Fyzická pozice vlaječky na plátně = Vzdálenost + Pozice startu (130)
                CONFIG.SIMULATION.TARGET_X = val + CONFIG.CREATURE.BODY_START_X;
                
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