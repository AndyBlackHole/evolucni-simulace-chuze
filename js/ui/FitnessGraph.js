// FitnessGraph.js
export class FitnessGraph {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.history = [];
        this.maxPoints = 100; 
        // OPRAVA: Větší odsazení, aby se nám vlevo vešla čísla osy Y
        this.padding = 50;    
    }

    addDataPoint(fitness) {
        this.history.push(fitness);
        if (this.history.length > this.maxPoints) {
            this.history.shift();
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render() {
        this.clear();
        if (this.history.length === 0) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const p = this.padding;

        let minFitness = Math.min(0, ...this.history); 
        let actualMax = Math.max(...this.history);
        
        let maxFitness = actualMax > 0 ? actualMax * 1.2 : 100;
        
        if (maxFitness - minFitness < 1) {
             maxFitness = 100;
        }

        const range = (maxFitness - minFitness);

        // Kreslení os X a Y
        ctx.beginPath();
        ctx.moveTo(p, p / 2); // Osa Y nahoře
        ctx.lineTo(p, h - p + 5); // Osa Y dole (mírný přesah)
        ctx.moveTo(p - 5, h - p); // Osa X vlevo (mírný přesah)
        ctx.lineTo(w - p / 2, h - p); // Osa X vpravo
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Popisek osy X
        ctx.fillStyle = "#555";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Generace", w / 2, h - 5); 

        // --- INTELIGENTNÍ ČÍSLOVÁNÍ OSY X ---
        ctx.font = "10px sans-serif";
        const numPoints = this.history.length;
        
        if (numPoints > 0) {
            let stepX = 1; // Standardně každá generace
            if (numPoints > 50) stepX = 10; // Nad 50 generací ukazujeme desítky
            else if (numPoints > 20) stepX = 5; // Nad 20 generací ukazujeme pětky

            for (let i = 0; i < numPoints; i++) {
                const genNum = i + 1; 
                
                // Vykreslíme vždy první, vždy poslední a pak násobky stepX
                // Podmínka zaručí, že se předposlední neplete s posledním číslem
                if (genNum === 1 || genNum === numPoints || (genNum % stepX === 0 && (numPoints - genNum) >= stepX * 0.6)) {
                    const xPos = numPoints === 1 ? p : p + (i / (numPoints - 1)) * (w - p * 1.5);
                    
                    ctx.beginPath();
                    ctx.moveTo(xPos, h - p);
                    ctx.lineTo(xPos, h - p + 5);
                    ctx.stroke();

                    ctx.fillText(genNum, xPos, h - p + 18);
                }
            }
        }
        // ------------------------------------
        
        // Popisek osy Y
        ctx.save();
        ctx.translate(15, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = "#555";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Fitness (Skóre)", 0, 0); 
        ctx.restore();

        // --- INTELIGENTNÍ ČÍSLOVÁNÍ OSY Y ---
        ctx.textAlign = "right";
        const ySteps = 4; // Rozdělíme osu Y na 4 úseky (tzn. 5 čísel)
        
        for (let i = 0; i <= ySteps; i++) {
            const val = minFitness + (range * (i / ySteps));
            const yPos = (h - p) - ((i / ySteps) * (h - p * 1.5));
            
            // Nakreslíme malou čárku na ose Y
            ctx.beginPath();
            ctx.moveTo(p - 5, yPos);
            ctx.lineTo(p, yPos);
            ctx.stroke();

            // Vypíšeme číslo (zaokrouhlené dolů)
            ctx.fillText(Math.floor(val), p - 8, yPos + 4);
        }
        // ------------------------------------

        // Pokud máme jen jeden bod
        if (this.history.length === 1) {
            ctx.beginPath();
            const yPos = (h - p) - (((this.history[0] - minFitness) / range) * (h - p * 1.5));
            ctx.arc(p, yPos, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#2b7b2b";
            ctx.fill();
            return;
        }

        // Omezíme kreslení přesně na oblast uvnitř os (Clipping)
        ctx.save();
        ctx.beginPath();
        ctx.rect(p, 0, w - p, h - p);
        ctx.clip();

        // 1. Kreslení čáry
        ctx.beginPath();
        ctx.strokeStyle = "#2b7b2b";
        ctx.lineWidth = 2.5;
        for (let i = 0; i < this.history.length; i++) {
            const x = p + (i / (this.history.length - 1)) * (w - p * 1.5);
            const normalized = (this.history[i] - minFitness) / range;
            const y = (h - p) - (normalized * (h - p * 1.5));

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 2. Vykreslení bodů (teček) pro jednotlivé generace
        ctx.fillStyle = "#1e5c1e"; 
        for (let i = 0; i < this.history.length; i++) {
            const x = p + (i / (this.history.length - 1)) * (w - p * 1.5);
            const normalized = (this.history[i] - minFitness) / range;
            const y = (h - p) - (normalized * (h - p * 1.5));

            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, Math.PI * 2); 
            ctx.fill();
        }

        ctx.restore(); // Zrušení clippingu
    }
}