export class ImpactVisualizer {
    constructor(crowdContainerId, brainContainerId) {
        this.crowdContainer = document.getElementById(crowdContainerId);
        this.brainContainer = document.getElementById(brainContainerId);
        
        if(!this.crowdContainer || !this.brainContainer) return;

        this.initCrowd();
        this.initBrain(); 
    }

    initCrowd() {
        this.crowdContainer.innerHTML = '';
        // Griglia 10x10 = 100 omini
        for(let i=0; i<100; i++) {
            const person = document.createElement('div');
            person.className = 'person-icon';
            
            // --- MODIFICA QUI: EFFETTO VETRO/CONTORNO ---
            // fill="none": dentro è trasparente
            // stroke="#FF4824": il contorno è arancio
            // stroke-width="1.5": spessore della linea
            person.innerHTML = `
                <svg viewBox="0 0 24 24" width="100%" height="100%" 
                     fill="none" 
                     stroke="#FF4824" 
                     stroke-width="1.5" 
                     stroke-linecap="round" 
                     stroke-linejoin="round">
                    <circle cx="12" cy="7" r="5" />
                    <path d="M4 22 C4 15 9 13 12 13 C15 13 20 15 20 22" />
                </svg>
            `;
            this.crowdContainer.appendChild(person);
        }
    }

    initBrain() {
        fetch('assets/images/Risorsa2.svg')
            .then(response => response.text())
            .then(svgText => {
                this.brainContainer.innerHTML = svgText;
                const svg = this.brainContainer.querySelector('svg');
                if(svg) {
                    svg.classList.add('brain-svg-loaded');
                    svg.style.width = '100%';
                    svg.style.height = '100%';
                }
            })
            .catch(err => console.error("Errore caricamento cervello:", err));
    }

    visualizeImpact(params) {
        // A. CALCOLO PERCENTUALE
        const totalScore = (
            (params.emotivo || 0) * 1.5 + 
            (params.polarizzazione || 0) * 1.2 + 
            (params.opacita || 0) +
            (params.deumanizzazione || 0)
        ) / 4.7; 
        const affectedPeople = Math.min(Math.floor(totalScore), 100);

        // B. COLORAZIONE FOLLA (Gestione Opacità Vetro)
        const people = this.crowdContainer.querySelectorAll('.person-icon');
        people.forEach((p, i) => {
            // Reset
            p.classList.remove('affected');
            
            // --- MODIFICA QUI: ALPHA PIÙ PICCOLO ---
            // 0.1 è molto tenue (effetto vetro sporco/invisibile)
            p.style.opacity = "0.15"; 
            p.style.transition = "opacity 0.5s ease"; // Transizione morbida
            
            if (i < affectedPeople) {
                setTimeout(() => {
                    p.classList.add('affected');
                    // Quando "colpito", diventa pienamente visibile (il contorno brilla)
                    p.style.opacity = "1"; 
                    
                    // OPZIONALE: Se vuoi che quelli colpiti si "riempiano" leggermente di colore
                    // p.querySelector('svg').style.fill = "rgba(255, 72, 36, 0.2)";
                    
                }, Math.random() * 1500); // Ho aumentato un po' il tempo per dare più respiro all'animazione
            } else {
                // Assicuriamoci che quelli non colpiti restino vuoti
                const svg = p.querySelector('svg');
                if(svg) svg.style.fill = "none";
            }
        });

        // C. COLORAZIONE CERVELLO
        const brainPaths = this.brainContainer.querySelectorAll('path, circle, polygon');
        const mixRatio = (params.emotivo || 0) / 100;
        
        if(brainPaths.length > 0) {
            gsap.to(brainPaths, {
                fill: gsap.utils.interpolate("#333333", "#FF4824", mixRatio),
                duration: 0.6,
                stagger: 0.01 
            });
        }

        // D. ANIMAZIONE ENTRATA
        gsap.to('#impact-visuals-wrapper', {
            autoAlpha: 1,
            y: 0,
            duration: 1.5,
            ease: "power3.out",
            delay: 0.5
        });
        
        const percentText = document.getElementById('impact-percent-number');
        if(percentText) percentText.innerText = affectedPeople + "%";
    }
}