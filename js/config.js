// config.js
// Globální konfigurace pro evoluční simulaci dvounohé příšerky.
// Tento soubor obsahuje pouze konstanty – žádnou logiku.
// Je navržen tak, aby dvounohý tvor mohl realisticky chodit,
// aby evoluce měla stabilní prostředí, a renderer fyzikální konzistenci.

export const CONFIG = {

    // Celkové rozměry hlavních canvasů
    CANVAS: {
        BEST_WIDTH: 700,
        BEST_HEIGHT: 300,
    },

    // Struktura těla příšerky
    CREATURE: {
        BODY_RADIUS: 28,            // mírně větší tělo pro dvounohou rovnováhu
        LEG_LENGTH_1: 35,           // stehno (delší kvůli stabilitě)
        LEG_LENGTH_2: 35,           // lýtko
        BODY_START_X: 130,          // více vlevo → více prostoru pro krok
        BODY_START_Y: 180           // lehce výš → nohy lépe dopadnou na zem
    },

    // Evoluční parametry
    EVOLUTION: {
        POPULATION_SIZE: 60,        // počet jedinců v generaci
        MUTATION_RATE: 0.08,        // pravděpodobnost mutace jednoho úhlu
        MUTATION_STRENGTH: 20,      // maximální změna úhlu při mutaci (°)
        GENE_LENGTH: 100,           // 300 kroků
        CROSSOVER_RATE: 0.85,       // pravděpodobnost křížení dvou rodičů
        ELITISM_COUNT: 1,           // nejlepší jedinec přežije nezměněn
        INFINITE_RUN: true,         // nekonečný běh
        MAX_GENERATIONS: 50         // limit generací
    },

    // Parametry simulace
    SIMULATION: {
        GROUND_Y: 235,              // mírně níž, aby nohy měly dobrý kontakt
        STEPS_PER_FRAME: 1,         // 1 krok fyziky na frame (ovládá main.js SPEED)
        SPEED: 1,                   // výchozí rychlost simulace (1 až 5)
        TARGET_X: 500              // Pozice cílové vlaječky na ose X
    }
};