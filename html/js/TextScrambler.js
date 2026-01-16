export class TextScrambler {
    constructor(element) {
        this.element = element;
        // Meno simboli strani, più lettere maiuscole e numeri per un look "Dati"
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789__--'; 
        this.frameRequest = null;
        this.frame = 0;
        this.queue = [];
        // Aumentato da 2 a 4: Più è alto, più è lento e leggibile
        this.resolveSpeed = 4; 
    }

    scrambleIndefinitely(inputString) {
        if(this.frameRequest) cancelAnimationFrame(this.frameRequest);
        const targetText = inputString || this.element.innerText;
        
        const loop = () => {
            let output = '';
            for (let i = 0; i < targetText.length; i++) {
                if (targetText[i] === ' ' || targetText[i] === '\n') {
                    output += targetText[i];
                } else {
                    // Cambia carattere meno freneticamente (solo ogni 3 frame)
                    if (Math.random() > 0.7) {
                        output += this.chars[Math.floor(Math.random() * this.chars.length)];
                    } else {
                        // Mantiene il carattere precedente (simulato per semplicità o rigenera)
                         output += this.chars[Math.floor(Math.random() * this.chars.length)];
                    }
                }
            }
            this.element.innerText = output;
            // Rallenta il loop visivo usando setTimeout o saltando frame (qui standard)
            this.frameRequest = requestAnimationFrame(loop);
        };
        loop();
    }

    reveal(finalText) {
        if(this.frameRequest) cancelAnimationFrame(this.frameRequest);
        const currentText = this.element.innerText;
        const length = Math.max(currentText.length, finalText.length);
        const paddedCurrent = currentText.padEnd(length, ' ');
        const paddedFinal = finalText.padEnd(length, ' ');
        
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = paddedCurrent[i] || '';
            const to = paddedFinal[i] || '';
            const start = Math.floor(Math.random() * 60); // Ritardo inizio più lungo
            const end = start + Math.floor(Math.random() * 60); // Durata decrittazione più lunga
            this.queue.push({ from, to, start, end, char: from });
        }
        this.frame = 0;
        this.update();
    }

    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.1) { // Cambia carattere molto meno spesso (stabilità)
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += char;
            } else {
                output += from;
            }
        }
        this.element.innerText = output;
        if (complete === this.queue.length) {
            cancelAnimationFrame(this.frameRequest);
        } else {
            this.frameRequest = requestAnimationFrame(this.update.bind(this));
            this.frame += (1 / this.resolveSpeed);
        }
    }
} 