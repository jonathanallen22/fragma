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
// Il nuovo ID nel tuo HTML aggiornato è 'viz-brain'
const impactViz = new ImpactVisualizer('viz-brain');

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
        // Aggiungiamo una classe specifica per il CSS (es. 'is-corriere')
        card.className = `card is-${data.template || 'sky'}`; 

        let innerHTML = '';

        // --- TEMPLATE CORRIERE (Classico) ---
        if (data.template === 'corriere') {
            innerHTML = `
                <div class="corriere-header">
                    <img src="${data.logo}" class="corriere-logo" alt="logo">
                    <div class="corriere-meta-row">
                        <span>${data.date}</span>
                        <span>${data.author}</span>
                    </div>
                </div>
                <div class="corriere-content">
                    <h3 class="corriere-headline">${data.headline}</h3>
                    <div class="corriere-divider"></div>
                    <p class="corriere-body">${data.body}</p>
                </div>
                <div class="corriere-footer">DATI EUROSTAT</div>
            `;
        } 
        // --- TEMPLATE TWITTER (Social) ---
        else if (data.template === 'twitter') {
            innerHTML = `
                <div class="twitter-header">
                    <div class="twitter-avatar"></div> <div class="twitter-user-info">
                        <span class="twitter-name">Syntax User</span>
                        <span class="twitter-handle">${data.author}</span>
                    </div>
                    <span class="twitter-date">${data.date}</span>
                </div>
                <div class="twitter-content">
                    <p class="twitter-body">${data.headline}<br><br>${data.body}</p>
                </div>
                <div class="twitter-footer">
                    <svg viewBox="0 0 24 24" class="tw-icon"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.25c-4.42 0-8.004-3.58-8.004-8z"></path></g></svg>
                    <svg viewBox="0 0 24 24" class="tw-icon"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                    <svg viewBox="0 0 24 24" class="tw-icon"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91z"></path></g></svg>
                    <svg viewBox="0 0 24 24" class="tw-icon"><g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.12 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></g></svg>
                </div>
            `;
        }
        // --- TEMPLATE SKY (Modern/Default) ---
        else {
            innerHTML = `
                <div class="sky-header">
                    <img src="${data.logo}" class="sky-logo" alt="logo">
                    <div class="sky-meta">
                        <span>${data.date}</span>
                        <span>${data.source}.it</span>
                    </div>
                </div>
                <div class="sky-divider"></div>
                <div class="sky-content">
                    <h3 class="sky-headline">${data.headline}</h3>
                    <p class="sky-body">${data.body}</p>
                </div>
            `;
        }

        card.innerHTML = innerHTML;
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