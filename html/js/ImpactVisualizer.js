// js/ImpactVisualizer.js

export class ImpactVisualizer {
    constructor(brainContainerId) {
        // Usa l'ID passato o un fallback di sicurezza
        this.brainContainer = document.getElementById(brainContainerId);
        
        if (!this.brainContainer) {
            console.warn(`ImpactVisualizer: Elemento #${brainContainerId} non trovato. Controlla l'HTML.`);
            return;
        }

        this.initBrain();
    }

    initBrain() {
        // Carichiamo l'SVG del cervello
        fetch('assets/images/Risorsa2.svg')
            .then(res => {
                if (!res.ok) throw new Error("SVG non trovato");
                return res.text();
            })
            .then(svg => {
                if (this.brainContainer) {
                    this.brainContainer.innerHTML = svg;
                    const svgEl = this.brainContainer.querySelector('svg');
                    if(svgEl) {
                        svgEl.style.width = "100%";
                        svgEl.style.height = "100%";
                        // Usa 'gsap' globale (window.gsap)
                        gsap.set(svgEl.querySelectorAll('path, polygon'), { fill: "none", stroke: "#444", strokeWidth: 0.5 });
                    }
                }
            })
            .catch(err => console.log("Errore caricamento cervello:", err));
    }

    visualizeImpact(params) {
        // Controllo di sicurezza: se la scena non è pronta, esci senza rompere tutto
        if (!this.brainContainer) return;

        console.log("Visualizing Impact:", params);

        // --- 1. CERVELLO ---
        const brainIntensity = (params.emotivo * 0.7 + params.deumanizzazione * 0.3) / 100;
        const brainPaths = this.brainContainer.querySelectorAll('path, polygon');
        
        if(brainPaths.length > 0) {
            brainPaths.forEach(p => {
                // Reset preventivo
                gsap.to(p, { stroke: "#444", fill: "none", duration: 0.5 });
                
                if(Math.random() < brainIntensity) {
                    gsap.to(p, { 
                        stroke: "#FF4824", 
                        strokeWidth: 1.5, 
                        fill: "rgba(255, 72, 36, 0.1)", 
                        duration: 1.5,
                        delay: Math.random() * 0.5
                    });
                }
            });
        }
        
        this.safeTextUpdate('val-amygdala', `+${Math.floor(params.emotivo * 0.8)}%`);
        this.safeTextUpdate('val-cortex', `-${Math.floor(params.deumanizzazione * 0.5)}%`);

        // --- 2. MEMORIA ---
        const memScore = (params.assertivita + params.moralizzazione) / 2; 
        const barHeight = 20 + (memScore * 0.6); 
        
        // Controllo esistenza elemento prima di animare
        if(document.getElementById('bar-new')) {
            gsap.to('#bar-new', { 
                attr: { height: barHeight, y: 90 - barHeight }, 
                duration: 1, 
                ease: "power2.out" 
            });
        }
        
        const memText = memScore > 60 ? "PERMANENTE" : (memScore > 30 ? "MODERATO" : "EFFIMERO");
        this.safeTextUpdate('text-memory', memText);

        // --- 3. GAUGE CRITICO ---
        const bypassScore = (params.opacita * 0.5 + params.emotivo * 0.5);
        const angle = -90 + (bypassScore * 1.8);
        
        if(document.getElementById('gauge-needle')) {
            gsap.to('#gauge-needle', { 
                rotation: angle, 
                transformOrigin: "100px 90px", 
                duration: 1.5, 
                ease: "elastic.out(1, 0.5)" 
            });
        }

        const logicVal = 100 - Math.floor(bypassScore);
        this.safeTextUpdate('val-logic', `${logicVal}%`);
        this.safeTextUpdate('val-sub', `${Math.floor(bypassScore)}%`);

        if(bypassScore > 50 && document.getElementById('gauge-area')) {
            gsap.to('#gauge-area', { opacity: 0.5, duration: 0.5, delay: 1 });
        }

        // --- 4. VIRALITÀ ---
        const viralScore = params.polarizzazione;
        const cpy = 90 - (viralScore * 0.8); 
        const endy = 90 - (viralScore * 0.7);
        const newPath = `M10 90 Q 80 ${cpy} 180 ${endy}`;

        if(document.getElementById('viral-curve')) {
            gsap.to('#viral-curve', { attr: { d: newPath }, duration: 1 });
            gsap.to('#viral-dot', { attr: { cy: endy }, duration: 1 });
        }
        
        const viralX = 1 + (viralScore / 20);
        this.safeTextUpdate('val-viral', `${viralX.toFixed(1)}x`);

        // --- 5. EROSIONE SOCIALE ---
        const erosion = (params.polarizzazione + params.deumanizzazione) / 2;
        const separation = erosion * 0.6; 

        if(document.getElementById('venn-left')) {
            gsap.to('#venn-left', { attr: { cx: 130 - separation }, duration: 2 });
            gsap.to('#venn-right', { attr: { cx: 170 + separation }, duration: 2 });
        }
        
        this.safeTextUpdate('val-cohesion', `-${Math.floor(erosion)}%`);
    }

    // Helper per evitare errori se un testo non esiste ancora nell'HTML
    safeTextUpdate(id, text) {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    }
}