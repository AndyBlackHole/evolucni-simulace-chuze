// Population.js
// Evoluční algoritmus přizpůsobený pro dvounohého tvora.
// Genotyp nyní obsahuje 4 úhly na jeden krok (a1L, a2L, a1R, a2R).
// Tento modul vytváří populaci, provádí výběr, křížení, mutaci
// a generuje nové generace. 
// Odpovědnost: pouze evoluční logika (žádná fyzika, žádné vykreslování).

import { CONFIG } from "../config.js";
import { Creature } from "./Creature.js";
import { randomInt, randomChance, randomAngleDelta } from "../utils/random.js";

export class Population {

    constructor() {
        this.creatures = [];
        this.generation = 0;

        this.initializePopulation();
    }

    // Vytvoření nové náhodné populace
    initializePopulation() {
        this.creatures = [];
        const size = CONFIG.EVOLUTION.POPULATION_SIZE;

        for (let i = 0; i < size; i++) {
            this.creatures.push(new Creature());
        }

        this.generation = 1;
    }

    // Vrátí kopii pole seřazenou podle fitness
    getSortedByFitness() {
        return [...this.creatures].sort((a, b) => b.fitness - a.fitness);
    }

    getBestCreature() {
        return this.getSortedByFitness()[0];
    }

    getTopN(n) {
        return this.getSortedByFitness().slice(0, n);
    }

    // Turnajový výběr rodiče
    tournamentSelection(k = 3) {
        let best = null;

        for (let i = 0; i < k; i++) {
            const idx = randomInt(0, this.creatures.length - 1);
            const candidate = this.creatures[idx];

            if (best === null || candidate.fitness > best.fitness) {
                best = candidate;
            }
        }

        return best;
    }

    // Jednobodové křížení pro 4-úhlový genotyp
    crossover(parentA, parentB) {
        const length = parentA.genes.length;
        const crossPoint = randomInt(1, length - 2);

        const childGenes = [];

        for (let i = 0; i < length; i++) {

            // Půlka od A, půlka od B – podle crossPoint
            const src = (i < crossPoint ? parentA.genes[i] : parentB.genes[i]);

            childGenes.push({
                a1L: src.a1L,
                a2L: src.a2L,
                a1R: src.a1R,
                a2R: src.a2R
            });
        }

        return new Creature(childGenes);
    }

    // Mutace – pro každý gen je malá šance změnit některý úhel
    mutate(creature) {
        const rate = CONFIG.EVOLUTION.MUTATION_RATE;
        const strength = CONFIG.EVOLUTION.MUTATION_STRENGTH;

        for (let g of creature.genes) {

            if (randomChance(rate)) g.a1L += randomAngleDelta(strength);
            if (randomChance(rate)) g.a2L += randomAngleDelta(strength);

            if (randomChance(rate)) g.a1R += randomAngleDelta(strength);
            if (randomChance(rate)) g.a2R += randomAngleDelta(strength);
        }
    }

    // Vytvoří novou generaci
    createNextGeneration() {
        const size = CONFIG.EVOLUTION.POPULATION_SIZE;
        // NOVÉ: Kontrola, zda je elitismus vůbec zapnutý
        const elitism = CONFIG.EVOLUTION.ELITISM_ENABLED ? CONFIG.EVOLUTION.ELITISM_COUNT : 0;
        const crossoverRate = CONFIG.EVOLUTION.CROSSOVER_RATE;

        const sorted = this.getSortedByFitness();
        const newPop = [];

        // 1) Elitismus – nejlepší jedinci přežijí (pokud je elitismus > 0)
        for (let i = 0; i < elitism; i++) {
            const e = sorted[i];
            const clone = new Creature(e.cloneGenes());
            clone.fitness = e.fitness;
            newPop.push(clone);
        }

        // 2) Zbytek vytvoříme křížením / mutací
        while (newPop.length < size) {

            const pA = this.tournamentSelection();
            const pB = this.tournamentSelection();

            let child;

            if (randomChance(crossoverRate)) {
                child = this.crossover(pA, pB);
            } else {
                child = new Creature(pA.cloneGenes());
            }

            this.mutate(child);

            newPop.push(child);
        }

        // Nastavení nové populace
        this.creatures = newPop;
        this.generation++;
    }
}