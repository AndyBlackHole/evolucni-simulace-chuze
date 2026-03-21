// PhysicsEngine.js
// Dvounohá fyzika tvora pro evoluční simulaci chůze.
// Každá noha má dva segmenty (stehno + lýtko).
// Fyzikální model je jednoduchý, ale dostatečně silný,
// aby evoluce dokázala vytvořit chůzi pomocí opěrných bodů a změn úhlů.
//
// Odpovědnost: počítat pohyb tvora, polohu nohou, kontakt se zemí,
// a generovat posun vpřed podle změny úhlů.

import { CONFIG } from "../config.js";
import { angleToVector, degToRad, clamp } from "../utils/math.js";

export class PhysicsEngine {

    constructor(creature) {
        this.creature = creature;
        
        // RADIKÁLNÍ ZPOMALENÍ: Každý gen (úhel) se bude držet 15 snímků!
        // Vznikne tak pomalý, táhlý a jasně čitelný krok.
        this.framesPerGene = 15; 
        this.frameCount = 0;
    }

    // Jeden fyzikální krok simulace
    step() {

        const c = this.creature;

        // --- EFEKT VYČERPÁNÍ: POMALÝ PÁD KULIČKY NA ZEM ---
        if (c.currentStep >= c.genes.length) {
            
            // Uvolnění svalů - nohy se složí pod tělo mnohem pomaleji (animace umírání)
            const turnSpeed = 1.5; // Zpomaleno z 8 na 1.5
            c.currentA1L += clamp(90 - c.currentA1L, -turnSpeed, turnSpeed);
            c.currentA2L += clamp(0 - c.currentA2L, -turnSpeed, turnSpeed);
            c.currentA1R += clamp(90 - c.currentA1R, -turnSpeed, turnSpeed);
            c.currentA2R += clamp(0 - c.currentA2R, -turnSpeed, turnSpeed);

            this.computeLegsPosition();

            // Tělo padá k zemi zlehka jako peříčko
            c.bodyY += 1; // Gravitace zpomalena z 5 na 1
            const ground = CONFIG.SIMULATION.GROUND_Y;

            // Náraz na zem
            if (c.bodyY >= ground - CONFIG.CREATURE.BODY_RADIUS) {
                c.bodyY = ground - CONFIG.CREATURE.BODY_RADIUS;
                c.isFullyCollapsed = true; 
            }
            
            return; 
        }
        // -------------------------------------------

        // 1) Načteme aktuální gen (4 úhly)
        const gene = c.getCurrentAngles();

        c.prevA1L = c.currentA1L;
        c.prevA2L = c.currentA2L;
        c.prevA1R = c.currentA1R;
        c.prevA2R = c.currentA2R;

        // RADIKÁLNÍ ZPOMALENÍ NOHY pro běžnou chůzi
        const turnSpeed = 2; 
        c.currentA1L += clamp(gene.a1L - c.currentA1L, -turnSpeed, turnSpeed);
        c.currentA2L += clamp(gene.a2L - c.currentA2L, -turnSpeed, turnSpeed);
        c.currentA1R += clamp(gene.a1R - c.currentA1R, -turnSpeed, turnSpeed);
        c.currentA2R += clamp(gene.a2R - c.currentA2R, -turnSpeed, turnSpeed);

        // 2) Přepočítáme polohu nohou
        this.computeLegsPosition();

        // 3) Zkontrolujeme kontakt se zemí
        const leftSupport = this.handleGroundCollisionLeft();
        const rightSupport = this.handleGroundCollisionRight();

        // 4) Pokud je některá noha opřená → vytvoříme posun vpřed
        if (leftSupport || rightSupport) {
            this.applyForwardMotion(leftSupport, rightSupport);
        }

        // Aplikace gravitace na tělo
        c.bodyY += 2; 

        // 5) Zpomalené přepínání genů
        this.frameCount++;
        if (this.frameCount >= this.framesPerGene) {
            c.advanceStep();
            this.frameCount = 0;
        }
    }

    computeLegsPosition() {
        const c = this.creature;
        const hipOffset = CONFIG.CREATURE.BODY_RADIUS * 0.6;

        c.hipLeftX  = c.bodyX - hipOffset;
        c.hipLeftY  = c.bodyY;
        c.hipRightX = c.bodyX + hipOffset;
        c.hipRightY = c.bodyY;

        const v1L = angleToVector(c.currentA1L, CONFIG.CREATURE.LEG_LENGTH_1);
        c.kneeLX = c.hipLeftX + v1L.x;
        c.kneeLY = c.hipLeftY + v1L.y;

        const v2L = angleToVector(c.currentA1L + c.currentA2L, CONFIG.CREATURE.LEG_LENGTH_2);
        c.footLX = c.kneeLX + v2L.x;
        c.footLY = c.kneeLY + v2L.y;

        const v1R = angleToVector(c.currentA1R, CONFIG.CREATURE.LEG_LENGTH_1);
        c.kneeRX = c.hipRightX + v1R.x;
        c.kneeRY = c.hipRightY + v1R.y;

        const v2R = angleToVector(c.currentA1R + c.currentA2R, CONFIG.CREATURE.LEG_LENGTH_2);
        c.footRX = c.kneeRX + v2R.x;
        c.footRY = c.kneeRY + v2R.y;
    }

    handleGroundCollisionLeft() {
        const c = this.creature;
        const ground = CONFIG.SIMULATION.GROUND_Y;
        if (c.footLY > ground) {
            const penetration = c.footLY - ground;
            c.footLY = ground;
            c.kneeLY -= penetration * 0.5;
            c.bodyY  -= penetration * 0.25;
            return true;
        }
        return false;
    }

    handleGroundCollisionRight() {
        const c = this.creature;
        const ground = CONFIG.SIMULATION.GROUND_Y;
        if (c.footRY > ground) {
            const penetration = c.footRY - ground;
            c.footRY = ground;
            c.kneeRY -= penetration * 0.5;
            c.bodyY  -= penetration * 0.25;
            return true;
        }
        return false;
    }

    applyForwardMotion(leftSupport, rightSupport) {
        const c = this.creature;
        const d1L = c.currentA1L - c.prevA1L;
        const d1R = c.currentA1R - c.prevA1R;
        let forward = 0;

        if (leftSupport) forward += Math.sin(degToRad(c.currentA1L)) * d1L;
        if (rightSupport) forward += Math.sin(degToRad(c.currentA1R)) * d1R;

        forward *= 1.5;
        c.bodyX += forward;
    }

    isFinished() {
        if (this.creature.bodyX >= CONFIG.SIMULATION.TARGET_X) return true;
        return this.creature.currentStep >= this.creature.genes.length && this.creature.isFullyCollapsed;
    }

    computeFitness() {
        const distanceToTarget = Math.abs(CONFIG.SIMULATION.TARGET_X - this.creature.bodyX);
        let fitness = 10000 / (distanceToTarget + 1); 

        if (this.creature.bodyX >= CONFIG.SIMULATION.TARGET_X) {
            fitness *= 10; 
        }

        return fitness;
    }
}