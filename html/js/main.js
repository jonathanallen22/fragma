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

// Stato interazione Edit
let isEditInteractionStarted = false;

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
            innerHTML = `
                <div class="twitter-header">
                    <div class="twitter-avatar"></div> 
                    <div class="twitter-user-info">
                        <div class="twitter-name-row"><span class="twitter-name">${data.author}</span></div>
                        <span class="twitter-handle">@Syntax_F1</span> </div>
                </div>
                <div class="twitter-content"><p class="twitter-body">${data.headline}<br><br>${data.body}</p></div>
                <div class="twitter-footer"></div>`;
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
    
    bodyEl.innerText = "Processing..."; bodyEl.style.opacity = "0.8"; 
    let isFirstChunk = true;
    llmClient.streamText(originalData.body, currentParams, (chunk) => {
        if (isFirstChunk) { bodyEl.innerText = ""; bodyEl.style.opacity = "1"; isFirstChunk = false; }
        currentGeneratedBody += chunk;
        bodyEl.innerText = currentGeneratedBody; 
        if(scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }, () => { currentGeneratedBody = ""; }, (err) => { console.error(err); bodyEl.innerText = "// ERROR //"; }).then(() => { bodyEl.style.opacity = 1; });
}

// --- GESTIONE CAMBIO ISTRUZIONI EDIT ---
function checkEditInteraction() {
    // Se siamo in edit e non abbiamo ancora interagito
    if (sceneMgr.currentScene === 'edit' && !isEditInteractionStarted) {
        isEditInteractionStarted = true;
        
        // Nascondi istruzione iniziale
        const initialInst = document.getElementById('inst-place-tokens');
        if(initialInst) initialInst.classList.add('hidden-inst');

        // Mostra istruzioni laterali
        const leftInst = document.getElementById('inst-rotate-back');
        const rightInst = document.getElementById('inst-click-confirm');
        if(leftInst) leftInst.classList.remove('hidden-inst');
        if(rightInst) rightInst.classList.remove('hidden-inst');
    }
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
    
    // Trigger cambio istruzioni
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
    else if (sceneMgr.currentScene === 'impact-v2') resetExperience(); 
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
        initImpact3D(); 
        startCarousel();
    }, 100);
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

function startCarousel() {
    if (impactCarouselInterval) clearInterval(impactCarouselInterval);
    const slides = document.querySelectorAll('.impact-slide');
    const progressBar = document.getElementById('carousel-bar');
    if(slides.length === 0) return;

    let activeIndex = 0;
    slides.forEach((s) => s.classList.remove('active', 'prev'));
    slides[0].classList.add('active');

    if(progressBar) {
        progressBar.classList.remove('animating');
        void progressBar.offsetWidth; 
        progressBar.classList.add('animating');
    }

    impactCarouselInterval = setInterval(() => {
        slides[activeIndex].classList.remove('active');
        slides[activeIndex].classList.add('prev');
        const nextIndex = (activeIndex + 1) % slides.length;
        slides[nextIndex].classList.remove('prev');
        slides[nextIndex].classList.add('active');
        activeIndex = nextIndex;

        if(impactManagerV2) impactManagerV2.handleResize();

        if(progressBar) {
            progressBar.classList.remove('animating');
            void progressBar.offsetWidth; 
            progressBar.classList.add('animating');
        }
    }, 10000); 
}

function resetExperience() {
    console.log("🔄 RESET...");
    if (impactCarouselInterval) { clearInterval(impactCarouselInterval); impactCarouselInterval = null; }
    const progressBar = document.getElementById('carousel-bar');
    if(progressBar) progressBar.classList.remove('animating');
    const v2 = document.getElementById('scene-impact-v2');
    if(v2) { v2.classList.remove('active'); v2.classList.add('hidden'); }
    currentCardIndex = 0; currentGeneratedBody = ""; 
    const sliders = document.querySelectorAll('.cyber-range'); sliders.forEach(slider => slider.value = 0);
    if(semanticGraph) {
        semanticGraph.updateParams({ opacita: 0, deumanizzazione: 0, polarizzazione: 0, assertivita: 0, moralizzazione: 0, emotivo: 0 });
        if(semanticGraph.updateVisuals) semanticGraph.updateVisuals();
    }
    
    // RESET ISTRUZIONI EDIT
    isEditInteractionStarted = false;
    const initialInst = document.getElementById('inst-place-tokens');
    if(initialInst) initialInst.classList.remove('hidden-inst');
    const leftInst = document.getElementById('inst-rotate-back');
    const rightInst = document.getElementById('inst-click-confirm');
    if(leftInst) leftInst.classList.add('hidden-inst');
    if(rightInst) rightInst.classList.add('hidden-inst');

    updateCarousel();
    const editHead = document.getElementById('edit-headline');
    const editBody = document.getElementById('edit-body');
    if(editHead) editHead.innerText = "TITOLO NOTIZIA...";
    if(editBody) editBody.innerText = "Corpo della notizia...";
    sceneMgr.resetInstructionsState();
    sceneMgr.goTo('intro');
}

const v2Footer = document.querySelector('.v2-footer');
if(v2Footer) v2Footer.addEventListener('click', () => resetExperience());