// js/main.js

import { SceneManager } from './SceneManager.js';
import { Visual3D } from './Visual3D.js';
import { MiniTotem } from './MiniTotem.js'; 
import { CARDS_DATA } from './DataManager.js';
import { SemanticGraph } from './SemanticGraph.js';
import { TextScrambler } from './TextScrambler.js'; 
import { ImpactVisualizer } from './ImpactVisualizer.js'; 
import { SerialManager } from './SerialManager.js';
// --- NUOVO IMPORT ---
import { LLMClient } from './LLMClient.js';

console.log("🚀 Fragma System Init...");

// --- INIZIALIZZAZIONE SISTEMA ---
const sceneMgr = new SceneManager();
const semanticGraph = new SemanticGraph('graph-container');
const visuals = new Visual3D('canvas-container-intro');
const miniTotem = new MiniTotem('mini-totem-container'); 
const impactViz = new ImpactVisualizer('viz-brain');

// Client per la generazione AI (Punta al backend Python)
const llmClient = new LLMClient("http://localhost:5001/generate");
let currentGeneratedBody = ""; // Variabile per accumulare il testo in arrivo

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
        // (Logica Template identica a prima - omessa per brevità ma inclusa nel funzionamento)
        // ... Qui inserisco i template HTML standard (Corriere, Twitter, Sky) ...
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
        } // --- TEMPLATE TWITTER (Social) ---
        else if (data.template === 'twitter') {
            innerHTML = `
                <div class="twitter-header">
                    <div class="twitter-avatar"></div> 
                    <div class="twitter-user-info">
                        
                        <div class="twitter-name-row">
                            <span class="twitter-name">${data.author}</span> <svg class="twitter-verified-badge ver-white" viewBox="0 0 24 24">
                                <g>
                                    <path class="badge-bg" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.518-1.59.02-3.368-1.255-4.42-1.34-1.08-3.16-1.08-4.353.266-1.09-1.26-2.98-1.53-4.335-.4-1.354.96-1.89 2.8-1.12 4.45C7.88 9.49 6.55 10.5 6.55 12.5c0 1.95 1.37 3 2.74 3.75-.75 1.6-1.25 3.1 1.15 4.5 1.25 1.15 3.15 1.25 4.35-.4 1.2 1.35 3.05 1.35 4.35.4 1.27-1.05 1.77-2.83 1.25-4.42 1.27-.65 2.15-2.02 2.15-3.6z"></path>
                                    <path class="badge-check" d="M10.11 17.55L6.7 13.5l1.55-1.34 2.1 2.24 6.13-6.9 1.64 1.25-7.75 8.8z"></path>
                                </g>
                            </svg>
                        </div>
                        
                        <span class="twitter-handle">@Syntax_F1</span> </div>
                </div>

                <div class="twitter-content">
                    <p class="twitter-body">${data.headline}<br><br>${data.body}</p>
                </div>
                
                <div class="twitter-footer">
                    <svg viewBox="0 0 24 24" class="tw-icon"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.25c-4.42 0-8.004-3.58-8.004-8z"></path></g></svg>
                    <svg viewBox="0 0 24 24" class="tw-icon"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                    <svg viewBox="0 0 24 24" class="tw-icon"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91z"></path></g></svg>
                    <svg viewBox="0 0 24 24" class="tw-icon"><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></svg>
                    <svg viewBox="0 0 24 24" class="tw-icon"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.12 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></svg>
                </div>
            `;
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
    
    // Calcolo posizioni per centrare la card attiva
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


// --- LOGICA LLM & LIVE UPDATE ---

/**
 * Questa funzione viene chiamata ogni volta che un parametro cambia (Arduino o Slider).
 * Prende i valori, chiama il backend Python e aggiorna il testo a schermo in streaming.
 */
function updateLiveText() {
    // Sicurezza: eseguiamo solo se siamo nella scena di modifica
    if (sceneMgr.currentScene !== 'edit') return;

    const originalData = CARDS_DATA[currentCardIndex];
    const bodyEl = document.getElementById('edit-body');
    const scrollContainer = document.querySelector('.scrolling-body');
    
    // Recupero i valori correnti (aggiornati da Arduino/Input)
    const currentParams = {
        opacita: parseFloat(document.getElementById('param-opacita').value || 0),
        deumanizzazione: parseFloat(document.getElementById('param-deumanizzazione').value || 0),
        polarizzazione: parseFloat(document.getElementById('param-polarizzazione').value || 0),
        assertivita: parseFloat(document.getElementById('param-assertivita').value || 0),
        moralizzazione: parseFloat(document.getElementById('param-moralizzazione').value || 0),
        emotivo: parseFloat(document.getElementById('param-emotivo').value || 0)
    };

    // Avvia lo streaming
    llmClient.streamText(
        originalData.body, // Testo originale (prompt base)
        currentParams,     // Parametri attuali
        (chunk) => {
            // [ON CHUNK]: Arriva un pezzo di testo
            currentGeneratedBody += chunk;
            bodyEl.innerText = currentGeneratedBody; 
            
            // Auto-scroll fluido verso il basso
            if(scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
        },
        () => {
            // [ON START]: Inizio generazione
            currentGeneratedBody = ""; // Reset buffer
            bodyEl.innerText = "";
            bodyEl.style.opacity = 0.5; // Feedback visivo "sto pensando"
        },
        (err) => {
            // [ON ERROR]
            console.error(err);
            bodyEl.innerText = "// ERRORE CONNESSIONE NEURAL //";
        }
    ).then(() => {
        // [ON COMPLETE]
        bodyEl.style.opacity = 1;
    });
}


// --- GESTIONE INPUT (ARDUINO & SLIDERS) ---

const SENSOR_MAPPING = ['opacita', 'deumanizzazione', 'polarizzazione', 'assertivita', 'moralizzazione', 'emotivo'];

// 1. Logica Arduino
const handleArduinoData = (data) => {
    // Mapping Sensori -> Slider
    if (data.s) {
        data.s.forEach((step, i) => {
            const percentValue = step * 20; // Converte 0-5 in 0-100
            const slider = document.getElementById(`param-${SENSOR_MAPPING[i]}`);
            
            // Aggiorna solo se il valore cambia significativamente (evita jitter)
            if (slider && Math.abs(slider.value - percentValue) > 2) {
                slider.value = percentValue;
                // Dispatch input per scatenare i listener (Grafico + LLM)
                slider.dispatchEvent(new Event('input'));
            }
        });
    }

    // Mapping Encoder -> Navigazione
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
            handleConfirmation();
        }
    }
};

const serialMgr = new SerialManager(handleArduinoData);

// 2. Listener sugli Slider (attivati sia da mouse che da Arduino)
const sliders = document.querySelectorAll('.cyber-range');
sliders.forEach(slider => slider.addEventListener('input', (e) => {
    // A. Aggiorna il Grafico D3 (esistente)
    semanticGraph.updateParams({ [e.target.id.replace('param-', '')]: parseFloat(e.target.value) });
    
    // B. Aggiorna il Testo con l'AI (nuovo)
    updateLiveText();
}));


// --- CONTROLLO FLUSSO (SCENE) ---

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') serialMgr.connect(); // Tasto 'c' per connettere Arduino

    // Navigazione tastiera Carosello
    if (sceneMgr.currentScene === 'carousel') {
        if (e.key === 'ArrowRight' && currentCardIndex < CARDS_DATA.length - 1) { currentCardIndex++; updateCarousel(); }
        if (e.key === 'ArrowLeft' && currentCardIndex > 0) { currentCardIndex--; updateCarousel(); }
    }

    // Conferma
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleConfirmation();
    }
}); 

function handleConfirmation() {
    // 1. INTRO -> ISTRUZIONI
    if (sceneMgr.currentScene === 'intro') {
        sceneMgr.goTo('instructions');
    }
    
    // 2. CAROSELLO -> EDIT MODE
    else if (sceneMgr.currentScene === 'carousel') {
         const selectedData = CARDS_DATA[currentCardIndex];
         
         // Setta il titolo statico
         document.getElementById('edit-headline').innerText = selectedData.headline;
         // Pulisce il corpo in attesa dell'AI
         document.getElementById('edit-body').innerText = "Inizializzazione Neural Link...";
         
         sceneMgr.goTo('edit'); 
         
         // Ritardo per permettere alla transizione di finire, poi avvia la generazione iniziale
         setTimeout(() => { 
             if(semanticGraph) semanticGraph.resize(); 
             updateLiveText(); 
        }, 600);
    }
    
    // 3. EDIT -> IMPACT (Salta Processing)
    else if (sceneMgr.currentScene === 'edit') {
        finalizeExperience();
    }
    
    // 4. IMPACT -> RESTART
    else if (sceneMgr.currentScene === 'impact') {
        location.reload(); 
    }
}

/**
 * Funzione che sostituisce la vecchia "startProcessing".
 * Prende il testo generato dall'LLM e prepara la dashboard finale.
 */
function finalizeExperience() {
    const currentHeadline = document.getElementById('edit-headline').innerText;
    
    // Usa il testo generato dall'AI. Se vuoto (errore), usa quello che c'è nel DOM.
    const finalBody = currentGeneratedBody || document.getElementById('edit-body').innerText;

    // Prepara la scena Impact
    prepareImpactScene(currentHeadline, finalBody);
    
    // Vai diretto
    sceneMgr.goTo('impact');
}

function prepareImpactScene(title, body) {
    // Aggiorna DOM Impact
    const finalHead = document.getElementById('final-headline');
    const finalBodyText = document.getElementById('final-body');
    
    if(finalHead) {
        finalHead.innerText = title;
        finalHead.setAttribute('data-text', title);
    }
    if(finalBodyText) {
        finalBodyText.innerText = body;
    }

    // Calcola parametri finali per visualizzazioni (Cervello, Grafici)
    const params = {
        opacita: parseFloat(document.getElementById('param-opacita').value || 0),
        deumanizzazione: parseFloat(document.getElementById('param-deumanizzazione').value || 0),
        polarizzazione: parseFloat(document.getElementById('param-polarizzazione').value || 0),
        assertivita: parseFloat(document.getElementById('param-assertivita').value || 0),
        moralizzazione: parseFloat(document.getElementById('param-moralizzazione').value || 0),
        emotivo: parseFloat(document.getElementById('param-emotivo').value || 0)
    };
    
    // Lancia animazioni D3/GSAP nella scena finale
    impactViz.visualizeImpact(params);
}

const btnRestart = document.getElementById('btn-restart');
if (btnRestart) btnRestart.addEventListener('click', () => location.reload());