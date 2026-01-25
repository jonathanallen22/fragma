import { SceneManager } from './SceneManager.js';
import { Visual3D } from './Visual3D.js';
import { MiniTotem } from './MiniTotem.js'; 
import { CARDS_DATA, PARAM_DESCRIPTIONS } from './DataManager.js'; // Import unificati
import { SemanticGraph } from './SemanticGraph.js';
import { ImpactVisualizer } from './ImpactVisualizer.js'; 
import { SerialManager } from './SerialManager.js';
import { LLMClient } from './LLMClient.js';
import { Impact3DManager } from './Impact3DManager.js';

console.log("🚀 Fragma System Init...");

const sceneMgr = new SceneManager();
const semanticGraph = new SemanticGraph('graph-container');
const visuals = new Visual3D('canvas-container-intro');
const miniTotem = new MiniTotem('mini-totem-container'); 
const impactViz = new ImpactVisualizer('viz-brain');
const impactManagerV2 = new Impact3DManager();
const impactHero = document.getElementById('impact-hero');
const impactHeroClose = document.getElementById('impact-hero-close');
const llmClient = new LLMClient("http://localhost:5001/generate");

let currentGeneratedBody = ""; 
let impactCarouselInterval = null;
let isEditInteractionStarted = false;

document.addEventListener("DOMContentLoaded", () => {
    const knobVideos = document.querySelectorAll('.knob-video');
    knobVideos.forEach(video => { video.playbackRate = 0.5; });
});

if (impactHeroClose && impactHero) {
    impactHeroClose.addEventListener('click', () => { impactHero.classList.add('hidden-banner'); });
}

// --- CAROSELLO NOTIZIE ---
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
            // Gestione Handle e Badge
            const handle = data.handle || "@Syntax_F1"; 

            innerHTML = `
                <div class="twitter-header">
                    <div class="twitter-avatar"></div> 
                    <div class="twitter-user-info">
                        <div class="twitter-name-row">
                            <span class="twitter-name">${data.author}</span>
                            <img src="./assets/images/twitter-badge.svg" class="twitter-badge" alt="verified">
                        </div>
                        
                        <div class="twitter-handle-row">
                            <span class="twitter-handle">${handle}</span> 
                            <span class="twitter-date">${data.date}</span>
                        </div>
                    </div>
                </div>
                
                <div class="twitter-content">
                    <p class="twitter-body">${data.headline ? data.headline + '<br><br>' : ''}${data.body}</p>
                </div>
                
                <div class="twitter-footer">
                    <svg viewBox="0 0 24 24" class="tw-icon"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></svg>
                    <svg viewBox="0 0 24 24" class="tw-icon"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></svg>
                    <svg viewBox="0 0 24 24" class="tw-icon"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></svg>
                    <svg viewBox="0 0 24 24" class="tw-icon"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></svg>
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
    
    bodyEl.innerText = "Processando..."; bodyEl.style.opacity = "0.8"; 
    let isFirstChunk = true;
    llmClient.streamText(originalData.body, currentParams, (chunk) => {
        if (isFirstChunk) { bodyEl.innerText = ""; bodyEl.style.opacity = "1"; isFirstChunk = false; }
        currentGeneratedBody += chunk;
        bodyEl.innerText = currentGeneratedBody; 
        if(scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }, () => { currentGeneratedBody = ""; }, (err) => { console.error(err); bodyEl.innerText = "// ERROR //"; }).then(() => { bodyEl.style.opacity = 1; });
}

// --- GESTIONE ISTRUZIONI EDIT ---
function checkEditInteraction() {
    if (sceneMgr.currentScene === 'edit' && !isEditInteractionStarted) {
        isEditInteractionStarted = true;
        const initialInst = document.getElementById('inst-place-tokens');
        if(initialInst) initialInst.classList.add('hidden-inst');
        const leftInst = document.getElementById('inst-rotate-back');
        const rightInst = document.getElementById('inst-click-confirm');
        if(leftInst) leftInst.classList.remove('hidden-inst');
        if(rightInst) rightInst.classList.remove('hidden-inst');
    }
}

// --- TOGGLE GUI ---
const toggleBtn = document.getElementById('toggle-ui-btn');
const controlsPanel = document.getElementById('edit-controls');
if (toggleBtn && controlsPanel) {
    toggleBtn.addEventListener('click', () => {
        controlsPanel.classList.toggle('minimized');
        if (controlsPanel.classList.contains('minimized')) { toggleBtn.innerText = "SHOW PARAMETERS"; } 
        else { toggleBtn.innerText = "HIDE PARAMETERS"; }
    });
}

// --- NAVIGATION ---
function goBack() {
    if (sceneMgr.currentScene === 'carousel' && currentCardIndex > 0) { currentCardIndex--; updateCarousel(); }
    else if (sceneMgr.currentScene === 'pre-edit') sceneMgr.goTo('carousel');
    else if (sceneMgr.currentScene === 'edit') sceneMgr.goTo('pre-edit');
    else if (sceneMgr.currentScene === 'impact-v2') {
        if(impactCarouselInterval) { clearInterval(impactCarouselInterval); impactCarouselInterval = null; }
        const progressBar = document.getElementById('carousel-bar');
        if(progressBar) progressBar.classList.remove('animating');
        const v2 = document.getElementById('scene-impact-v2');
        if(v2) { v2.classList.remove('active'); v2.classList.add('hidden'); }
        const editScene = document.getElementById('scene-edit');
        if(editScene) {
            editScene.classList.remove('hidden'); editScene.classList.add('active');
            gsap.set(editScene, { autoAlpha: 1, scale: 1 });
            sceneMgr.currentScene = 'edit';
            setTimeout(() => { if(semanticGraph) semanticGraph.resize(); }, 100);
        }
    }
}

// --- INPUT HANDLERS ---
const SENSOR_MAPPING = ['opacita', 'deumanizzazione', 'polarizzazione', 'assertivita', 'moralizzazione', 'emotivo'];
const handleArduinoData = (data) => {
    if (data.s) data.s.forEach((step, i) => {
        const percentValue = step * 20; 
        const slider = document.getElementById(`param-${SENSOR_MAPPING[i]}`);
        if (slider && Math.abs(slider.value - percentValue) > 2) {
            slider.value = percentValue;
            slider.dispatchEvent(new Event('input'));
        }
    });
    if (data.e && data.e !== "NONE") {
        if (data.e === "CW") { if (sceneMgr.currentScene === 'carousel' && currentCardIndex < CARDS_DATA.length - 1) { currentCardIndex++; updateCarousel(); } }
        else if (data.e === "CCW") { goBack(); }
        else if (data.e === "CLICK") { handleConfirmation(); }
    }
};
const serialMgr = new SerialManager(handleArduinoData);

const sliders = document.querySelectorAll('.cyber-range');
sliders.forEach(slider => slider.addEventListener('input', (e) => {
    const paramId = e.target.id.replace('param-', '');
    semanticGraph.updateParams({ [paramId]: parseFloat(e.target.value) });
    updateParamInfoDisplay(paramId);
    checkEditInteraction();
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
    } else { container.classList.add('hidden'); }
}

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') serialMgr.connect(); 
    if (sceneMgr.currentScene === 'carousel' && e.key === 'ArrowRight' && currentCardIndex < CARDS_DATA.length - 1) { currentCardIndex++; updateCarousel(); }
    if (e.key === 'ArrowLeft') goBack();
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); handleConfirmation(); }
}); 

// --- GESTIONE CLICK/INPUT PER CONFERME ---
function handleConfirmation() {
    if (sceneMgr.currentScene === 'intro') sceneMgr.goTo('instructions');
    else if (sceneMgr.currentScene === 'carousel') {
         const selectedData = CARDS_DATA[currentCardIndex];
         document.getElementById('edit-headline').innerText = selectedData.headline;
         document.getElementById('edit-body').innerText = selectedData.body;
         sceneMgr.goTo('pre-edit'); 
    }
    else if (sceneMgr.currentScene === 'pre-edit') {
        sceneMgr.goTo('edit'); 
        setTimeout(() => { if(semanticGraph) semanticGraph.resize(); }, 600);
    }
    else if (sceneMgr.currentScene === 'edit') finalizeExperience();
    else if (sceneMgr.currentScene === 'impact-v2') {
        // --- LOGICA INPUT FISICI (ARDUINO/TASTIERA) ---
        const overlay = document.getElementById('final-confirmation-overlay');
        
        if (overlay) {
            // Se l'overlay è già visibile -> RIAVVIA
            if (overlay.classList.contains('visible')) {
                console.log("Restarting experience via INPUT...");
                window.location.reload();
            } 
            // Se l'overlay NON è visibile -> MOSTRA OVERLAY
            else {
                console.log("Showing overlay via INPUT...");
                overlay.classList.add('visible');
            }
        }
    }
}

// --- FINALIZE & IMPACT ---
function finalizeExperience() {
    console.log("--- FINALIZING EXPERIENCE ---");
    const currentHeadline = document.getElementById('edit-headline').innerText;
    const finalBody = currentGeneratedBody || document.getElementById('edit-body').innerText;

    prepareImpactDom(currentHeadline, finalBody);
    
    const nextScene = document.getElementById('scene-impact-v2');
    if (nextScene) {
        document.querySelectorAll('.scene').forEach(el => { el.classList.remove('active'); el.classList.add('hidden'); });
        nextScene.classList.remove('hidden');
        nextScene.classList.add('active');
        sceneMgr.currentScene = 'impact-v2'; 
    }

    setTimeout(() => { 
        try { initImpact3D(); } catch(e) { console.error("3D Init Error", e); }
        startCarousel();
        setupFinalInteraction(); // Attiva anche i listener del mouse
    }, 100);
}

// --- GESTIONE INTERAZIONE FINALE (MOUSE/TOUCH) ---
function setupFinalInteraction() {
    const scene = document.getElementById('scene-impact-v2');
    const overlay = document.getElementById('final-confirmation-overlay');

    if(!scene || !overlay) return;

    // 1. Click su Overlay -> Riavvia (Reload Pagina)
    overlay.addEventListener('click', () => {
        console.log("Restarting experience via MOUSE...");
        window.location.reload(); 
    });

    // 2. Click su Scena -> Mostra Overlay
    const showOverlay = () => {
        console.log("Impact clicked via MOUSE. Showing overlay.");
        overlay.classList.add('visible');
        scene.removeEventListener('click', showOverlay); // Evita doppi trigger mouse
    };

    setTimeout(() => {
        scene.addEventListener('click', showOverlay);
    }, 1000); 
}

function prepareImpactDom(title, body) {
    const originalCard = document.querySelector('.card.active');
    const finalContainer = document.getElementById('final-article-content');
    if (originalCard && finalContainer) {
        try {
            const clone = originalCard.cloneNode(true);
            clone.style.transform = "none"; clone.style.opacity = "1"; clone.style.filter = "none";
            clone.style.width = "100%"; clone.style.height = "auto"; clone.style.border = "none"; clone.style.background = "transparent";
            const bodyEl = clone.querySelector('.corriere-body, .sky-body, .twitter-body');
            if(bodyEl) bodyEl.innerText = body;
            finalContainer.innerHTML = '';
            finalContainer.appendChild(clone);
        } catch(e) { console.error("Errore clone card:", e); }
    }
}

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

// --- FIX CAROSELLO + BARRA (15s) ---
function startCarousel() {
    if (impactCarouselInterval) clearInterval(impactCarouselInterval);

    const slides = document.querySelectorAll('.impact-slide');
    const progressBar = document.getElementById('carousel-bar');
    if(slides.length === 0) return;

    let activeIndex = 0;
    slides.forEach((s) => s.classList.remove('active', 'prev'));
    slides[0].classList.add('active');

    // Funzione helper per riavviare la barra
    const restartBar = () => {
        if(progressBar) {
            progressBar.classList.remove('animating');
            void progressBar.offsetWidth; // Force Reflow
            progressBar.classList.add('animating');
        }
    };

    // Avvio immediato
    restartBar();

    impactCarouselInterval = setInterval(() => {
        // Logica slide
        slides[activeIndex].classList.remove('active');
        slides[activeIndex].classList.add('prev');
        const nextIndex = (activeIndex + 1) % slides.length;
        slides[nextIndex].classList.remove('prev');
        slides[nextIndex].classList.add('active');
        activeIndex = nextIndex;

        // Resize 3D (Protetto per non fermare il loop)
        try {
            if(impactManagerV2) impactManagerV2.handleResize();
        } catch(e) { console.warn("Resize error ignored", e); }

        // Riavvio Barra
        restartBar();
    }, 15000); // 15 Secondi esatti
}

function resetExperience() {
    // Questo metodo rimane per logiche interne
    console.log("🔄 RESET INTERNO...");
    if (impactCarouselInterval) { clearInterval(impactCarouselInterval); impactCarouselInterval = null; }
    const progressBar = document.getElementById('carousel-bar');
    if(progressBar) progressBar.classList.remove('animating');
}