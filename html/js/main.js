// js/main.js

import { SceneManager } from './SceneManager.js';
import { Visual3D } from './Visual3D.js';
import { MiniTotem } from './MiniTotem.js'; 
import { CARDS_DATA } from './DataManager.js';
import { SemanticGraph } from './SemanticGraph.js';
import { TextScrambler } from './TextScrambler.js'; 
import { ImpactVisualizer } from './ImpactVisualizer.js'; 
// --- AGGIUNTA SERIAL ---
import { SerialManager } from './SerialManager.js';

console.log("🚀 Fragma System Init...");

const sceneMgr = new SceneManager();
const semanticGraph = new SemanticGraph('graph-container');
const visuals = new Visual3D('canvas-container-intro');
const miniTotem = new MiniTotem('mini-totem-container'); 
const impactViz = new ImpactVisualizer('crowd-grid', 'brain-container');

const procHead = document.getElementById('proc-headline');
const procBody = document.getElementById('proc-body');
const scramblerTitle = procHead ? new TextScrambler(procHead) : null;
const scramblerBody = procBody ? new TextScrambler(procBody) : null;

// --- CAROSELLO ---
const carouselTrack = document.getElementById('carousel-track');
let currentCardIndex = 0;

function initCarousel() {
    if (!carouselTrack) return;
    carouselTrack.innerHTML = ''; 
    CARDS_DATA.forEach((data) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header-newspaper">
                <img src="${data.logo}" class="newspaper-logo" alt="${data.source}" onerror="this.style.display='none'"> 
                <div class="newspaper-meta"><span>${data.date}</span><span>${data.author}</span></div>
            </div>
            <div class="newspaper-content">
                <h3 class="newspaper-headline">${data.headline}</h3><p class="newspaper-body">${data.body}</p>
            </div>`;
        carouselTrack.appendChild(card);
    });
    requestAnimationFrame(() => updateCarousel());
}

function updateCarousel() {
    const cards = document.querySelectorAll('.card');
    if(cards.length === 0) return;
    const firstCard = cards[0];
    const cardWidth = firstCard.offsetWidth; 
    const style = window.getComputedStyle(carouselTrack);
    const gapVal = parseFloat(style.gap) || 0; 
    const stride = cardWidth + gapVal;
    const centerOffset = (window.innerWidth / 2) - (cardWidth / 2);
    const newX = -(currentCardIndex * stride) + centerOffset;

    gsap.to(carouselTrack, { x: newX, paddingLeft: 0, duration: 0.6, ease: "expo.out" });
    cards.forEach((card, i) => {
        if (i === currentCardIndex) {
            gsap.to(card, { scale: 1, opacity: 1, filter: "blur(0px) grayscale(0%)", duration: 0.4, zIndex: 10 });
            card.classList.add('active');
        } else {
            gsap.to(card, { scale: 0.9, opacity: 0.3, filter: "blur(5px) grayscale(100%)", duration: 0.4, zIndex: 1 });
            card.classList.remove('active');
        }
    });
}
setTimeout(initCarousel, 100);
window.addEventListener('resize', updateCarousel);


// --- LOGICA ARDUINO ---
const SENSOR_MAPPING = ['opacita', 'deumanizzazione', 'polarizzazione', 'assertivita', 'moralizzazione', 'emotivo'];

const handleArduinoData = (data) => {
    // 1. GESTIONE SENSORI (Step 0-5 -> 0-100%)
    if (data.s) {
        data.s.forEach((step, i) => {
            const percentValue = step * 20;
            const slider = document.getElementById(`param-${SENSOR_MAPPING[i]}`);
            if (slider && Math.abs(slider.value - percentValue) > 1) {
                slider.value = percentValue;
                // Dispatch input per aggiornare SemanticGraph e ImpactVisualizer
                slider.dispatchEvent(new Event('input'));
            }
        });
    }

    // 2. GESTIONE ENCODER (Navigazione)
    if (data.e && data.e !== "NONE") {
        if (data.e === "CW") {
            if (sceneMgr.currentScene === 'carousel' && currentCardIndex < CARDS_DATA.length - 1) {
                currentCardIndex++; updateCarousel();
            }
        } else if (data.e === "CCW") {
            if (sceneMgr.currentScene === 'carousel' && currentCardIndex > 0) {
                currentCardIndex--; updateCarousel();
            }
        } else if (data.e === "CLICK") {
            // Esegue la stessa logica di SPACE/ENTER
            handleConfirmation();
        }
    }
};

const serialMgr = new SerialManager(handleArduinoData);

// --- INPUT & LOGICA CORE ---
document.addEventListener('keydown', (e) => {
    // Connessione Serial manuale (Tasto C)
    if (e.key.toLowerCase() === 'c') serialMgr.connect();

    // CAROSELLO NAV (Tastiera)
    if (sceneMgr.currentScene === 'carousel') {
        if (e.key === 'ArrowRight' && currentCardIndex < CARDS_DATA.length - 1) { currentCardIndex++; updateCarousel(); }
        if (e.key === 'ArrowLeft' && currentCardIndex > 0) { currentCardIndex--; updateCarousel(); }
    }

    // CONFERMA (Tastiera)
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleConfirmation();
    }
}); 

// Funzione unificata per la conferma (usata sia da Tastiera che da Arduino Click)
function handleConfirmation() {
    if (sceneMgr.currentScene === 'intro') sceneMgr.goTo('instructions');
    
    else if (sceneMgr.currentScene === 'carousel') {
         const selectedData = CARDS_DATA[currentCardIndex];
         document.getElementById('edit-headline').innerText = selectedData.headline;
         document.getElementById('edit-body').innerText = selectedData.body;
         sceneMgr.goTo('edit'); 
         setTimeout(() => { if(semanticGraph) semanticGraph.resize(); }, 200);
    }
    
    else if (sceneMgr.currentScene === 'edit') {
        startProcessing();
    }
    
    else if (sceneMgr.currentScene === 'impact') {
        location.reload(); 
    }
}

function startProcessing() {
    const CLEAN_FINAL_TITLE = "Accordo Strategico: Sicurezza e Cooperazione Globale";
    const CLEAN_FINAL_BODY = "In una mossa storica, le fazioni hanno siglato un protocollo che garantisce stabilità immediata. I mercati reagiscono positivamente mentre si celebra l'inizio di una nuova era di prosperità.";

    sceneMgr.goTo('processing'); 

    const currentHead = document.getElementById('edit-headline').innerText;
    const currentBody = document.getElementById('edit-body').innerText;
    if(scramblerTitle) scramblerTitle.scrambleIndefinitely(currentHead);
    if(scramblerBody) scramblerBody.scrambleIndefinitely(currentBody);

    const stripesContainer = document.getElementById('stripes-container');
    stripesContainer.innerHTML = ''; 
    const stripes = [];
    for(let i=0; i<40; i++) {
        const s = document.createElement('div');
        s.className = 'data-stripe';
        s.style.height = (Math.random() * 60 + 40) + '%';
        s.style.left = (window.innerWidth + (Math.random() * window.innerWidth)) + 'px';
        stripesContainer.appendChild(s);
        stripes.push(s);
    }

    const flowTl = gsap.timeline({ repeat: -1 });
    flowTl.to(stripes, {
        x: -window.innerWidth * 2.5,
        duration: 2, 
        ease: "none",
        stagger: { each: 0.05, from: "random", repeat: -1 }
    });

    const masterTl = gsap.timeline();
    const ghostCard = document.querySelector('.card-ghost');

    masterTl.to(flowTl, { timeScale: 15, duration: 3, ease: "power2.in" });
    masterTl.to(ghostCard, { filter: "blur(8px)", opacity: 0.6, duration: 3, ease: "power2.in" }, 0);

    masterTl.add(() => {
        if(scramblerTitle) scramblerTitle.reveal(CLEAN_FINAL_TITLE);
        if(scramblerBody) scramblerBody.reveal(CLEAN_FINAL_BODY);
    }, 3.0);

    masterTl.to(flowTl, { timeScale: 0.1, duration: 5, ease: "power2.out" });
    masterTl.to(ghostCard, { filter: "blur(0px)", opacity: 1, duration: 4.5, ease: "power2.out" }, 3.0);

    masterTl.add(() => {
        flowTl.kill();
        prepareImpactScene(CLEAN_FINAL_TITLE, CLEAN_FINAL_BODY);
        sceneMgr.goTo('impact');
    }, ">");
}

function prepareImpactScene(title, body) {
    const finalHead = document.getElementById('final-headline');
    const finalBodyText = document.getElementById('final-body');
    
    if(finalHead) {
        finalHead.innerText = title;
        finalHead.setAttribute('data-text', title);
    }
    if(finalBodyText) {
        finalBodyText.innerText = body;
    }

    const params = {
        opacita: parseFloat(document.getElementById('param-opacita').value || 0),
        deumanizzazione: parseFloat(document.getElementById('param-deumanizzazione').value || 0),
        polarizzazione: parseFloat(document.getElementById('param-polarizzazione').value || 0),
        assertivita: parseFloat(document.getElementById('param-assertivita').value || 0),
        moralizzazione: parseFloat(document.getElementById('param-moralizzazione').value || 0),
        emotivo: parseFloat(document.getElementById('param-emotivo').value || 0)
    };
    impactViz.visualizeImpact(params);
}

// Slider Update (Listener Manuale)
const sliders = document.querySelectorAll('.cyber-range');
sliders.forEach(slider => slider.addEventListener('input', (e) => {
    semanticGraph.updateParams({ [e.target.id.replace('param-', '')]: parseFloat(e.target.value) });
}));

const btnRestart = document.getElementById('btn-restart');
if (btnRestart) btnRestart.addEventListener('click', () => location.reload());