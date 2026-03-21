export class FitnessGraph {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.history = [];
        this.maxPoints = 100; // Ukážeme posledních 100 generací
        this.padding = 40;    // Odsazení pro texty a osy
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

        const minFitness = Math.min(...this.history);
        const maxFitness = Math.max(...this.history);
        const range = (maxFitness - minFitness === 0) ? 1 : (maxFitness - minFitness);

        // Kreslení os X a Y
        ctx.beginPath();
        ctx.moveTo(p, p / 2); // Osa Y
        ctx.lineTo(p, h - p);
        ctx.lineTo(w - p / 2, h - p); // Osa X
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Popisky os
        ctx.fillStyle = "#555";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Generace", w / 2, h - 10); // X popisek
        
        ctx.save();
        ctx.translate(15, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("Fitness (Vzdálenost)", 0, 0); // Y popisek
        ctx.restore();

        // Hodnoty na ose Y (Max a Min)
        ctx.textAlign = "right";
        ctx.fillText(Math.floor(maxFitness), p - 5, p);
        ctx.fillText(Math.floor(minFitness), p - 5, h - p);

        // Pokud máme jen jeden bod, nakreslíme tečku
        if (this.history.length === 1) {
            ctx.beginPath();
            ctx.arc(p, h - p, 3, 0, Math.PI * 2);
            ctx.fillStyle = "#2b7b2b";
            ctx.fill();
            return;
        }

        // Kreslení samotné křivky grafu
        ctx.beginPath();
        ctx.strokeStyle = "#2b7b2b";
        ctx.lineWidth = 2.5;

        // Omezíme kreslení přesně na oblast uvnitř os (Clipping)
        ctx.save();
        ctx.beginPath();
        ctx.rect(p, 0, w - p, h - p);
        ctx.clip();

        ctx.beginPath();
        for (let i = 0; i < this.history.length; i++) {
            const x = p + (i / (this.history.length - 1)) * (w - p * 1.5);
            const normalized = (this.history[i] - minFitness) / range;
            const y = (h - p) - (normalized * (h - p * 1.5));

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore(); // Zrušení clippingu
    }
}