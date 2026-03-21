// Renderer.js
import { CONFIG } from "../config.js";

export class Renderer {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGround() {
        const ctx = this.ctx;
        const y = CONFIG.SIMULATION.GROUND_Y;
        ctx.beginPath();
        ctx.moveTo(-50000, y); 
        ctx.lineTo(50000, y);  
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawBody(creature) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(creature.bodyX, creature.bodyY, CONFIG.CREATURE.BODY_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#6ac36a";
        ctx.fill();
        ctx.strokeStyle = "#3b7d3b";
        ctx.lineWidth = 2;
        ctx.stroke();

        const eyeOffsetX = 8;
        const eyeOffsetY = -8;
        ctx.beginPath();
        ctx.arc(creature.bodyX - eyeOffsetX, creature.bodyY + eyeOffsetY, 4, 0, Math.PI * 2);
        ctx.arc(creature.bodyX + eyeOffsetX, creature.bodyY + eyeOffsetY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(creature.bodyX - eyeOffsetX, creature.bodyY + eyeOffsetY, 1.5, 0, Math.PI * 2);
        ctx.arc(creature.bodyX + eyeOffsetX, creature.bodyY + eyeOffsetY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
    }

    drawLeg(hipX, hipY, kneeX, kneeY, footX, footY) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeX, kneeY);
        ctx.strokeStyle = "#3a3a3a";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(kneeX, kneeY);
        ctx.lineTo(footX, footY);
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(footX, footY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#2a2a2a";
        ctx.fill();
    }

    drawCreatureInternal(creature) {
        this.drawLeg(creature.hipLeftX, creature.hipLeftY, creature.kneeLX, creature.kneeLY, creature.footLX, creature.footLY);
        this.drawLeg(creature.hipRightX, creature.hipRightY, creature.kneeRX, creature.kneeRY, creature.footRX, creature.footRY);
        this.drawBody(creature);
    }

    drawFlag() {
        const ctx = this.ctx;
        const x = CONFIG.SIMULATION.TARGET_X;
        const ground = CONFIG.SIMULATION.GROUND_Y;

        ctx.beginPath();
        ctx.moveTo(x, ground);
        ctx.lineTo(x, ground - 80); 
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, ground - 80);
        ctx.lineTo(x + 30, ground - 65); 
        ctx.lineTo(x, ground - 50);
        ctx.fillStyle = "#d32f2f"; 
        ctx.fill();
    }

    // NOVÉ: Přijímá parametr targetReached
    drawPopulation(creatures, generationInfo, targetReached = false) {
        this.clear();
        
        const ctx = this.ctx;
        ctx.save();
        
        let leader = creatures[0];
        for (let c of creatures) {
            if (c.bodyX > leader.bodyX) leader = c;
        }

        const offsetX = leader.bodyX - CONFIG.CREATURE.BODY_START_X;
        if (offsetX > 0) {
            ctx.translate(-offsetX, 0); 
        }

        this.drawGround();
        this.drawFlag(); 

        ctx.globalAlpha = 0.15;
        for (let c of creatures) {
            if (c !== leader) {
                this.drawCreatureInternal(c);
            }
        }

        ctx.globalAlpha = 1.0;
        this.drawCreatureInternal(leader);

        ctx.restore();

        // Výpis informací o populaci do rohu plátna
        ctx.fillStyle = "black";
        ctx.font = "bold 16px Arial";
        ctx.fillText(`Generace: ${generationInfo}`, 15, 25);
        
        const distLeft = Math.max(0, CONFIG.SIMULATION.TARGET_X - leader.bodyX);
        ctx.fillText(`Zbývá do cíle: ${distLeft.toFixed(0)} px`, 15, 45);

        // --- NOVÉ: VYKRESLENÍ VÍTĚZNÉ OBRAZOVKY ---
        if (targetReached) {
            // Poloprůhledný překryv, který ztlumí pozadí
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Hlavní nadpis
            ctx.fillStyle = "#2f8f2f";
            ctx.font = "bold 36px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Bylo dosaženo cíle! 🚩", this.canvas.width / 2, this.canvas.height / 2 - 30);

            // Detaily o vítězi
            ctx.fillStyle = "#333";
            ctx.font = "20px Arial";
            ctx.fillText(`Úspěšná generace: ${generationInfo}`, this.canvas.width / 2, this.canvas.height / 2 + 15);
            
            // Zajímavý parametr: Kolik z genetického kódu příšerka spotřebovala
            ctx.font = "16px Arial";
            ctx.fillText(`Počet kroků k dosažení cíle: ${leader.currentStep}`, this.canvas.width / 2, this.canvas.height / 2 + 45);

            // Obnovíme zarovnání textu pro další případné vykreslování po resetu
            ctx.textAlign = "left"; 
        }
        // ------------------------------------------
    }
}