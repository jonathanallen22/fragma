// js/main.js

import { SceneManager } from './SceneManager.js';
import { Visual3D } from './Visual3D.js';
import { MiniTotem } from './MiniTotem.js'; 
import { CARDS_DATA } from './DataManager.js';
import { SemanticGraph } from './SemanticGraph.js';
import { ImpactVisualizer } from './ImpactVisualizer.js'; 
import { SerialManager } from './SerialManager.js';
import { LLMClient } from './LLMClient.js';
import { PARAM_DESCRIPTIONS } from './DataManager.js';
import { Impact3DManager } from './Impact3DManager.js';

console.log("🚀 Fragma System Init...");

// --- INIZIALIZZAZIONE SISTEMA ---
const sceneMgr = new SceneManager();
const semanticGraph = new SemanticGraph('graph-container');
const visuals = new Visual3D('canvas-container-intro');
const miniTotem = new MiniTotem('mini-totem-container'); 
const impactViz = new ImpactVisualizer('viz-brain');
const impactManagerV2 = new Impact3DManager();
const impactHero = document.getElementById('impact-hero');
const impactHeroClose = document.getElementById('impact-hero-close');

// Client AI
const llmClient = new LLMClient("http://localhost:5001/generate");
let currentGeneratedBody = "";

if (impactHeroClose && impactHero) {
    impactHeroClose.addEventListener('click', () => {
        impactHero.classList.add('hidden-banner');
    });
}

// --- CAROSELLO ---
const carouselTrack = document.getElementById('carousel-track');
let currentCardIndex = 0;

function initCarousel() {
    if (!carouselTrack) return;
    carouselTrack.innerHTML = ''; 

    CARDS_DATA.forEach((data) => {
        const card = document.createElement('div');
        card.className = `card is-${data.template || 'sky'}`; 

        let innerHTML = '';
        if (data.template === 'corriere') {
            innerHTML = `
                <div class="corriere-header">
                    <img src="${data.logo}" class="corriere-logo" alt="logo">
                    <div class="corriere-meta-row"><span>${data.date}</span><span>${data.author}</span></div>
                </div>
                <div class="corriere-content">
                    <h3 class="corriere-headline">${data.headline}</h3>
                    <div class="corriere-divider"></div>
                    <p class="corriere-body">${data.body}</p>
                </div>
                <div class="corriere-footer">DATI EUROSTAT</div>`;
        } else if (data.template === 'twitter') {
            innerHTML = `
                <div class="twitter-header">
                    <div class="twitter-avatar"></div> 
                    <div class="twitter-user-info">
                        <div class="twitter-name-row">
                            <span class="twitter-name">${data.author}</span> <svg class="twitter-verified-badge ver-white" viewBox="0 0 24 24"><g><path class="badge-bg" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.518-1.59.02-3.368-1.255-4.42-1.34-1.08-3.16-1.08-4.353.266-1.09-1.26-2.98-1.53-4.335-.4-1.354.96-1.89 2.8-1.12 4.45C7.88 9.49 6.55 10.5 6.55 12.5c0 1.95 1.37 3 2.74 3.75-.75 1.6-1.25 3.1 1.15 4.5 1.25 1.15 3.15 1.25 4.35-.4 1.2 1.35 3.05 1.35 4.35.4 1.27-1.05 1.77-2.83 1.25-4.42 1.27-.65 2.15-2.02 2.15-3.6z"></path><path class="badge-check" d="M10.11 17.55L6.7 13.5l1.55-1.34 2.1 2.24 6.13-6.9 1.64 1.25-7.75 8.8z"></path></g></svg>
                        </div>
                        <span class="twitter-handle">@Syntax_F1</span> </div>
                </div>
                <div class="twitter-content"><p class="twitter-body">${data.headline}<br><br>${data.body}</p></div>
                <div class="twitter-footer">
                    <svg viewBox="0 0 24 24" class="tw-icon"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.25c-4.42 0-8.004-3.58-8.004-8z"></path></g></svg>
                </div>`;
        } else {
            innerHTML = `
                <div class="sky-header">
                    <img src="${data.logo}" class="sky-logo" alt="logo">
                    <div class="sky-meta"><span>${data.date}</span><span>${data.source}.it</span></div>
                </div>
                <div class="sky-divider"></div>
                <div class="sky-content"><h3 class="sky-headline">${data.headline}</h3><p class="sky-body">${data.body}</p></div>`;
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


// --- LIVE TEXT & UPDATE ---

function updateLiveText() {
    if (sceneMgr.currentScene !== 'edit') return;

    const originalData = CARDS_DATA[currentCardIndex];
    const bodyEl = document.getElementById('edit-body');
    const scrollContainer = document.querySelector('.scrolling-body');
    
    const currentParams = {
        opacita: parseFloat(document.getElementById('param-opacita').value || 0),
        deumanizzazione: parseFloat(document.getElementById('param-deumanizzazione').value || 0),
        polarizzazione: parseFloat(document.getElementById('param-polarizzazione').value || 0),
        assertivita: parseFloat(document.getElementById('param-assertivita').value || 0),
        moralizzazione: parseFloat(document.getElementById('param-moralizzazione').value || 0),
        emotivo: parseFloat(document.getElementById('param-emotivo').value || 0)
    };
    
    bodyEl.innerText = "Processing..."; 
    bodyEl.style.opacity = "0.8"; 
    let isFirstChunk = true;

    llmClient.streamText(
        originalData.body, currentParams,     
        (chunk) => {
            if (isFirstChunk) { bodyEl.innerText = ""; bodyEl.style.opacity = "1"; isFirstChunk = false; }
            currentGeneratedBody += chunk;
            bodyEl.innerText = currentGeneratedBody; 
            if(scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
        },
        () => { currentGeneratedBody = ""; },
        (err) => { console.error(err); bodyEl.innerText = "// ERRORE CONNESSIONE NEURAL //"; }
    ).then(() => { bodyEl.style.opacity = 1; });
}

// --- GESTIONE NAVIGAZIONE "INDIETRO" ---

function goBack() {
    console.log("🔙 Back from:", sceneMgr.currentScene);
    
    // 1. CAROSELLO -> Indietro nelle card
    if (sceneMgr.currentScene === 'carousel') {
        if (currentCardIndex > 0) {
            currentCardIndex--; 
            updateCarousel();
        }
    }
    // 2. PRE-EDIT -> Torna al CAROSELLO
    else if (sceneMgr.currentScene === 'pre-edit') {
        sceneMgr.goTo('carousel');
    }
    // 3. EDIT -> Torna a PRE-EDIT
    else if (sceneMgr.currentScene === 'edit') {
        sceneMgr.goTo('pre-edit');
    }
    // 4. IMPACT V2 (Finale) -> Torna a EDIT
    else if (sceneMgr.currentScene === 'impact-v2') {
        console.log("Reactivating Edit Scene...");

        // A. Nascondi manualmente la V2
        const v2 = document.getElementById('scene-impact-v2');
        if(v2) { 
            v2.classList.remove('active'); 
            v2.classList.add('hidden'); 
        }
        
        // B. Mostra di nuovo la scena Edit
        const editScene = document.getElementById('scene-edit');
        if(editScene) {
            // 1. Gestione Classi CSS
            editScene.classList.remove('hidden');
            editScene.classList.add('active');
            
            // 2. *** FIX FONDAMENTALE *** // Forziamo GSAP a rimettere l'opacità a 1, altrimenti rimane invisibile
            gsap.set(editScene, { autoAlpha: 1, scale: 1 });

            // 3. Aggiorna Manager
            sceneMgr.currentScene = 'edit';
            
            // 4. Resize grafico per sicurezza
            setTimeout(() => { 
                if(semanticGraph) semanticGraph.resize(); 
            }, 100);
        }
    }
}


// --- GESTIONE INPUT (ARDUINO & TASTIERA) ---

const SENSOR_MAPPING = ['opacita', 'deumanizzazione', 'polarizzazione', 'assertivita', 'moralizzazione', 'emotivo'];

const handleArduinoData = (data) => {
    // Sliders
    if (data.s) {
        data.s.forEach((step, i) => {
            const percentValue = step * 20; 
            const slider = document.getElementById(`param-${SENSOR_MAPPING[i]}`);
            if (slider && Math.abs(slider.value - percentValue) > 2) {
                slider.value = percentValue;
                slider.dispatchEvent(new Event('input'));
            }
        });
    }
    // Encoder
    if (data.e && data.e !== "NONE") {
        if (data.e === "CW") {
            // Avanti nel carosello
            if (sceneMgr.currentScene === 'carousel' && currentCardIndex < CARDS_DATA.length - 1) {
                currentCardIndex++; updateCarousel();
            }
        } else if (data.e === "CCW") {
            // INDIETRO: Usa la funzione centralizzata
            goBack();
        } else if (data.e === "CLICK") {
            // AVANTI / CONFERMA / RESET
            handleConfirmation();
        }
    }
};

const serialMgr = new SerialManager(handleArduinoData);

// Sliders listener
const sliders = document.querySelectorAll('.cyber-range');
sliders.forEach(slider => slider.addEventListener('input', (e) => {
    const paramId = e.target.id.replace('param-', '');
    semanticGraph.updateParams({ [paramId]: parseFloat(e.target.value) });
    updateParamInfoDisplay(paramId);
    updateLiveText();
}));

function updateParamInfoDisplay(paramId) {
    const container = document.getElementById('param-info-container');
    const titleEl = document.getElementById('param-info-title');
    const descEl = document.getElementById('param-info-desc');
    const description = PARAM_DESCRIPTIONS[paramId];
    if (description) {
        titleEl.innerText = description.title; descEl.innerText = description.description;
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

// Tastiera Listener
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') serialMgr.connect(); 

    // Freccia Destra (Solo Carosello)
    if (sceneMgr.currentScene === 'carousel' && e.key === 'ArrowRight' && currentCardIndex < CARDS_DATA.length - 1) { 
        currentCardIndex++; updateCarousel(); 
    }
    // Freccia Sinistra (INDIETRO UNIFICATO)
    if (e.key === 'ArrowLeft') {
        goBack();
    }
    // Spazio/Invio (CONFERMA)
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleConfirmation();
    }
}); 


// --- CONTROLLO FLUSSO (FORWARD) ---

function handleConfirmation() {
    console.log("Handle Confirmation in scene:", sceneMgr.currentScene);

    // 1. INTRO -> ISTRUZIONI
    if (sceneMgr.currentScene === 'intro') {
        sceneMgr.goTo('instructions');
    }
    
    // 2. CAROSELLO -> PRE-EDIT
    else if (sceneMgr.currentScene === 'carousel') {
         const selectedData = CARDS_DATA[currentCardIndex];
         document.getElementById('edit-headline').innerText = selectedData.headline;
         document.getElementById('edit-body').innerText = selectedData.body;
         sceneMgr.goTo('pre-edit'); // CORRETTO: Passa per pre-edit
    }

    // 3. PRE-EDIT -> EDIT
    else if (sceneMgr.currentScene === 'pre-edit') {
        sceneMgr.goTo('edit'); 
        setTimeout(() => { 
             if(semanticGraph && typeof semanticGraph.resize === 'function') semanticGraph.resize(); 
        }, 600);
    }
    
    // 4. EDIT -> PROCESSING
    else if (sceneMgr.currentScene === 'edit') {
        startProcessing();
    }
    
    // 5. IMPACT V2 -> RESET CICLICO
    else if (sceneMgr.currentScene === 'impact-v2' || sceneMgr.currentScene === 'impact') {
        resetExperience(); 
    }
}

// Processing Transition
function startProcessing() {
    console.log("⚙️ PROCESSING START...");
    sceneMgr.goTo('processing');
    setTimeout(() => { finalizeExperience(); }, 2500);
}

// Mostra Schermata Finale
function finalizeExperience() {
    console.log("--- FINALIZING EXPERIENCE ---");
    const currentHeadline = document.getElementById('edit-headline').innerText;
    const finalBody = currentGeneratedBody || document.getElementById('edit-body').innerText;

    // Prepara HTML
    const originalCard = document.querySelector('.card.active');
    const finalContainer = document.getElementById('final-article-content');
    if (originalCard && finalContainer) {
        try {
            const clone = originalCard.cloneNode(true);
            clone.style.cssText = "transform:none; opacity:1; filter:none; width:100%; height:auto; border:none; background:transparent;";
            const bodyEl = clone.querySelector('.corriere-body, .sky-body, .twitter-body');
            if(bodyEl) bodyEl.innerText = finalBody;
            finalContainer.innerHTML = '';
            finalContainer.appendChild(clone);
        } catch(e) { console.error(e); }
    }
    
    // Mostra V2 Overlay
    const nextScene = document.getElementById('scene-impact-v2');
    if (nextScene) {
        document.querySelectorAll('.scene').forEach(el => { el.classList.remove('active'); el.classList.add('hidden'); });
        nextScene.classList.remove('hidden');
        nextScene.classList.add('active');
        sceneMgr.currentScene = 'impact-v2'; 
    }

    setTimeout(() => { initImpact3D(); }, 100);
}

// Init 3D Charts
function initImpact3D() {
    const params = {
        opacita: parseFloat(document.getElementById('param-opacita')?.value || 0),
        deumanizzazione: parseFloat(document.getElementById('param-deumanizzazione')?.value || 0),
        polarizzazione: parseFloat(document.getElementById('param-polarizzazione')?.value || 0),
        assertivita: parseFloat(document.getElementById('param-assertivita')?.value || 0),
        moralizzazione: parseFloat(document.getElementById('param-moralizzazione')?.value || 0),
        emotivo: parseFloat(document.getElementById('param-emotivo')?.value || 0)
    };
    if(impactManagerV2) impactManagerV2.init(params);
}

// --- RESET CICLICO ---
function resetExperience() {
    console.log("🔄 SYSTEM SOFT RESET...");

    // 1. Nascondi Impact V2
    const v2 = document.getElementById('scene-impact-v2');
    if(v2) { v2.classList.remove('active'); v2.classList.add('hidden'); }

    // 2. Reset Variabili
    currentCardIndex = 0;
    currentGeneratedBody = ""; 

    // 3. Reset Sliders
    const sliders = document.querySelectorAll('.cyber-range');
    sliders.forEach(slider => slider.value = 0);

    // 4. Reset Grafico
    if(semanticGraph) {
        semanticGraph.updateParams({
            opacita: 0, deumanizzazione: 0, polarizzazione: 0, assertivita: 0, moralizzazione: 0, emotivo: 0
        });
        if(semanticGraph.updateVisuals) semanticGraph.updateVisuals();
    }

    // 5. Reset Carosello e Testi
    updateCarousel();
    const editHead = document.getElementById('edit-headline');
    const editBody = document.getElementById('edit-body');
    if(editHead) editHead.innerText = "TITOLO NOTIZIA...";
    if(editBody) editBody.innerText = "Corpo della notizia...";

    // 6. Reset Animazione Istruzioni
    sceneMgr.resetInstructionsState();

    // 7. Vai all'Intro
    sceneMgr.goTo('intro');
}

// Click listener sul footer finale (qualunque click su V2 triggera reset se gestito da handleConfirmation, ma aggiungiamo per sicurezza sul container)
const v2Footer = document.querySelector('.v2-footer');
if(v2Footer) {
    v2Footer.addEventListener('click', () => resetExperience());
}