// Creature.js
// Tento modul reprezentuje jednoho evolučního jedince.
// Nová verze: tvor má dvě nohy, každá se skládá ze dvou segmentů.
// Každý gen teď obsahuje 4 úhly: a1L, a2L, a1R, a2R.
// Modul zodpovídá výhradně za uchovávání genotypu a fenotypu,
// neobsahuje fyziku, vykreslování ani evoluční logiku.

import { CONFIG } from "../config.js";

export class Creature {

    constructor(genes = null) {

        // Pokud nejsou předány geny, vytvoříme náhodné.
        this.genes = genes || this.generateRandomGenes();

        // Fitness bude nastaveno po simulaci.
        this.fitness = 0;

        // Příprava fenotypu pro simulaci
        this.resetState();
    }


    // Vytvoření náhodného genotypu pro počáteční populaci.
    generateRandomGenes() {
        const length = CONFIG.EVOLUTION.GENE_LENGTH;
        const result = [];

        for (let i = 0; i < length; i++) {
            result.push({
                a1L: Math.random() * 90 - 45, // levé stehno
                a2L: Math.random() * 90 - 45, // levé lýtko
                a1R: Math.random() * 90 - 45, // pravé stehno
                a2R: Math.random() * 90 - 45  // pravé lýtko
            });
        }

        return result;
    }


    // Reset fenotypového stavu před simulací jedince.
    resetState() {

        // Krokový čítač pro čtení genů.
        this.currentStep = 0;

        // Pozice těla (kulatá příšerka).
        this.bodyX = CONFIG.CREATURE.BODY_START_X;
        this.bodyY = CONFIG.CREATURE.BODY_START_Y;

        // Aktuální úhly obou nohou (jsou nastaveny podle genu při každém kroku).
        this.currentA1L = 0;
        this.currentA2L = 0;
        this.currentA1R = 0;
        this.currentA2R = 0;

        // Uložené úhly z předchozího kroku — důležité pro fyziku (detekce "kopnutí").
        this.prevA1L = 0;
        this.prevA2L = 0;
        this.prevA1R = 0;
        this.prevA2R = 0;

        // POZICE KLUBŮ A NOHOU
        // =====================

        // Kyčle jsou po stranách těla (aby tvor připomínal 2-nohou bytost)
        this.hipLeftX = 0;
        this.hipLeftY = 0;
        this.hipRightX = 0;
        this.hipRightY = 0;

        // Levá noha (stehno → koleno → chodidlo)
        this.kneeLX = 0;
        this.kneeLY = 0;
        this.footLX = 0;
        this.footLY = 0;

        // Pravá noha
        this.kneeRX = 0;
        this.kneeRY = 0;
        this.footRX = 0;
        this.footRY = 0;
    }


    // Vrací aktuální 4 úhly z genu.
    getCurrentAngles() {
        if (this.currentStep >= this.genes.length) {
            return this.genes[this.genes.length - 1];
        }
        return this.genes[this.currentStep];
    }


    // Posun krokového čítače.
    advanceStep() {
        this.currentStep++;
    }


    // Nastavení fitness po ukončení simulace jedince.
    setFitness(value) {
        this.fitness = value;
    }


    // Vytvoření hluboké kopie genotypu.
    cloneGenes() {
        return this.genes.map(g => ({
            a1L: g.a1L,
            a2L: g.a2L,
            a1R: g.a1R,
            a2R: g.a2R
        }));
    }
}