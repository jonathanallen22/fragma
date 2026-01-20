// js/SemanticGraph.js

export class SemanticGraph {
    constructor(containerId) {
        this.containerSelector = `#${containerId}`;
        this.container = d3.select(this.containerSelector);
        
        // Controllo esistenza container
        if (this.container.empty()) {
            // Non blocchiamo tutto se manca, ma avvisiamo
            console.warn(`SemanticGraph: Container #${containerId} not found.`);
            return;
        }

        // --- 1. DATI E CONFIGURAZIONE ---
        this.macroParametri = ["OPACITÀ", "DEUMANIZZAZIONE", "POLARIZZAZIONE", "ASSERTIVITÀ", "MORALIZZAZIONE", "CARICO EMOTIVO"];
        
        this.listaParametri = [
            "Metafora", "Similitudine", "Metonimia", "Sineddoche", "Antonomasia", "Iperbole", "Litote", "Ossimoro", "Sinestesia", "Allegoria", "Simbolo", "Personificazione", "Eufemismo", "Ironia", "Antitesi", "Climax", "Anti-climax", "Apostrofe", "Preterizione", "Retorica Domanda", "Esclamazione", "Anafora", "Epifora", "Similanafora", "Anadiplosi", "Epanadiplosi", "Poliptoto", "Hendiadi", "Chiasmo", "Parallelismo", "Iperbato", "Anastrofe", "Ellissi", "Zeugma", "Asindeto", "Polisindeto", "Enumerazione", "Allitterazione", "Assonanza", "Consonanza", "Onomatopea", "Paronomasia", "Omoteleuto", "Aferesi", "Sincope", "Apocope", "Epentesi", "Protesi", "Epitesi", "Crasi", "Metaplasmo", "Enallage", "Isterologia", "Tautologia", "Perifrasi", "Alogismo", "Paradox", "Correzione", "Dittologia", "Disgiunzione", "Dubitatio", "Reticenza", "Sillessi", "Ipotassi", "Paratassi", "Neologismo", "Arcaismo", "Solecismo", "Pleonasma", "Aposiopesi", "Catacresi", "Adynaton", "Antifrasi", "Diafora", "Epifonema", "Exemplum", "Hypotyposis", "Inversione", "Isocolon", "Omofonema", "Sarcasmo", "Simploce", "Acrostico", "Anacoluto", "Diacope", "Metatesi", "Ipallage", "Metalessi", "Liturgia", "Enjambement", "Prolettico", "Apodossi", "Disfemismo", "Ipomimia", "Azione", "Rima", "Cadenza", "Epimone", "Digressione", "Proposizione", "Refutazione", "Paradiastole"
        ];

        this.paramMap = {
            'opacita': 0, 'deumanizzazione': 1, 'polarizzazione': 2,
            'assertivita': 3, 'moralizzazione': 4, 'emotivo': 5
        };

        this.livelli = [0, 0, 0, 0, 0, 0];
        this.LUNGHEZZA_BASE = 0; 
        this.MOLTIPLICATORE = 1.5; 
        this.idleSpeed = 0.5; 
        this.time = 0;

        // Distribuzione casuale parametri sui macro-assi
        this.macroOwnership = this.macroParametri.map(() => {
            let targets = [];
            while(targets.length < 17) {
                let r = Math.floor(Math.random() * this.listaParametri.length);
                if(!targets.includes(r)) targets.push(r);
            }
            return targets;
        });

        // Dataset iniziale con supporto per Easing (Lerp)
        this.dataset = this.listaParametri.map((p, i) => ({
            nome: p, 
            id: i, 
            jitter: Math.random() * 10, 
            currentLen: this.LUNGHEZZA_BASE,
            targetLen: this.LUNGHEZZA_BASE, // Valore obiettivo per l'animazione
            x:0, y:0, nx:0, ny:0, angle:0 
        }));

        // --- AVVIO ---
        this.initSVG();
        
        // Loop Idle + Lerp Animation
        d3.timer((elapsed) => {
            this.time = elapsed * 0.001; 
            this.animateIdle(); 
        });

        // Listener Resize automatico
        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    initSVG() {
        const node = this.container.node();
        if (!node) return;
        
        const w = node.clientWidth;
        const h = node.clientHeight;

        this.svg = this.container.append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${w} ${h}`); 

        this.mainGroup = this.svg.append("g").attr("class", "main-container");
        this.mainGroup.attr("transform", `translate(${w / 2}, ${h / 2})`);

        const minRes = Math.min(w, h);
        const padding = minRes * 0.25; 
        this.hexSize = (minRes / 2) - padding;

        this.hexVertices = [];
        for (let i = 0; i <= 6; i++) {
            const a = (i * 60 - 90) * (Math.PI / 180);
            this.hexVertices.push({ x: this.hexSize * Math.cos(a), y: this.hexSize * Math.sin(a), angle: a });
        }

        this.dataset.forEach((d, i) => {
            let lato = Math.floor(i / 17); if (lato > 5) lato = 5;
            const start = this.hexVertices[lato];
            const end = this.hexVertices[lato + 1];
            const t = (i % 17 + 1) / 18;
            
            const nA = Math.atan2(end.y - start.y, end.x - start.x) - Math.PI / 2;
            let baseX = start.x + (end.x - start.x) * t;
            let baseY = start.y + (end.y - start.y) * t;
            const textOffset = 20; 

            d.nx = Math.cos(nA); d.ny = Math.sin(nA); d.angle = nA;
            d.x = baseX + (d.nx * textOffset); d.y = baseY + (d.ny * textOffset);
        });

        this.drawStaticElements();
    }

    drawStaticElements() {
        const self = this;

        // Macro Text
        const macroGroups = this.mainGroup.selectAll(".macro-group")
            .data(this.macroParametri).enter().append("g").attr("class", "macro-group");

        macroGroups.append("text")
            .each(function(d, i) {
                const v = self.hexVertices[i];
                const isLeft = Math.cos(v.angle) < -0.1;
                let rot = v.angle * 180 / Math.PI;
                if (isLeft) rot += 180;
                
                d3.select(this)
                    .attr("x", v.x + Math.cos(v.angle) * 50)
                    .attr("y", v.y + Math.sin(v.angle) * 50)
                    .attr("class", "macro-text")
                    .attr("text-anchor", isLeft ? "end" : "start")
                    .attr("alignment-baseline", "middle")
                    .attr("transform", `rotate(${rot}, ${v.x + Math.cos(v.angle) * 50}, ${v.y + Math.sin(v.angle) * 50})`)
                    .text(d);
            });

        // Params Text & Lines
        const paramGroups = this.mainGroup.selectAll(".param-group")
            .data(this.dataset).enter().append("g").attr("class", "param-group");

        paramGroups.append("text")
            .attr("class", "param-text")
            .attr("x", d => d.x).attr("y", d => d.y)
            .attr("text-anchor", d => d.nx < -0.1 ? "end" : "start")
            .attr("alignment-baseline", "middle")
            .attr("transform", d => {
                let rot = d.angle * 180 / Math.PI;
                if (d.nx < -0.1) rot += 180;
                return `rotate(${rot}, ${d.x}, ${d.y})`;
            })
            .text(d => d.nome);

        this.valueLines = paramGroups.append("line")
            .attr("class", "value-line")
            .each(function(d) {
                const textNode = d3.select(this.parentNode).select("text").node();
                const tw = textNode.getBBox().width;
                d.lx = d.x + d.nx * (tw + 12);
                d.ly = d.y + d.ny * (tw + 12);
                d3.select(this).attr("x1", d.lx).attr("y1", d.ly).attr("x2", d.lx).attr("y2", d.ly);
            });
    }

    updateParams(paramsObj) {
        for (let key in paramsObj) {
            const idx = this.paramMap[key];
            if (idx !== undefined) this.livelli[idx] = paramsObj[key];
        }
        this.updateVisuals();
    }

    updateVisuals() {
        this.dataset.forEach(d => {
            let somma = 0;
            this.macroOwnership.forEach((targets, mIdx) => {
                if (targets.includes(d.id) && this.livelli[mIdx] > 0) {
                    somma += (this.livelli[mIdx] * 0.04 * this.MOLTIPLICATORE * 10) + d.jitter;
                }
            });
            // Settiamo il target, non la lunghezza corrente
            d.targetLen = Math.min(this.LUNGHEZZA_BASE + somma, 220);
        });

        // Gestione macro text e ragnatela (logica discreta)
        this.mainGroup.selectAll(".macro-text").transition().duration(300)
            .style("fill", (d, i) => this.livelli[i] > 10 ? "#ffffffb3" : "#444");

        const activeLinks = [];
        this.macroOwnership.forEach((targets, mIdx) => {
            const liv = this.livelli[mIdx];
            if (liv > 5) {
                const qty = Math.ceil(Math.pow(liv/10, 1.8)); 
                targets.slice(0, qty).forEach((tIdx, k) => {
                    activeLinks.push({ id: `m${mIdx}-t${tIdx}`, mIdx, tIdx, k });
                });
            }
        });

        const links = this.mainGroup.selectAll(".connection").data(activeLinks, d => d.id);
        const bundle = d3.line().curve(d3.curveBundle.beta(0.85));

        links.enter().append("path")
            .attr("class", "connection")
            .style("opacity", 0).transition().duration(500).style("opacity", 0.6);

        links.exit().transition().duration(300).style("opacity", 0).remove();
    }

    animateIdle() {
        if (!this.valueLines || this.valueLines.empty()) return;

        const emotivo = this.livelli[5] / 100;      
        const assertivita = this.livelli[3] / 100;
        const timeFactor = this.time * 0.6; 
        const lineAmplitude = 0.5 + (emotivo * 1.5);

        // --- LERP FACTOR (Velocità Ease) ---
        // 0.1  = Bilanciato (fluido e reattivo)
        const lerpFactor = 0.1;

        // --- AGGIORNAMENTO LINEE (Istogrammi) ---
        this.valueLines
            .attr("x2", d => {
                // Inseguimento fluido del target
                d.currentLen += (d.targetLen - d.currentLen) * lerpFactor;
                
                const noise = Math.sin(timeFactor + d.id/5) * lineAmplitude;
                let finalLen = d.currentLen + noise;
                if (finalLen < 0) finalLen = 0;
                return d.lx + d.nx * finalLen;
            })
            .attr("y2", d => {
                const noise = Math.sin(timeFactor + d.id/5) * lineAmplitude;
                let finalLen = d.currentLen + noise;
                if (finalLen < 0) finalLen = 0;
                return d.ly + d.ny * finalLen;
            });

        // --- AGGIORNAMENTO RAGNATELA ---
        const bundle = d3.line().curve(d3.curveBundle.beta(0.85 + (assertivita * 0.15)));
        
        this.mainGroup.selectAll(".connection")
            .attr("d", d => {
                const t = this.dataset[d.tIdx];
                const m = this.hexVertices[d.mIdx];
                
                const speed = 0.3 + (emotivo * 2);
                const centerAmp = this.hexSize * 0.3 * (1 - assertivita * 0.5); 
                const mx = Math.cos(d.k + d.mIdx + this.time * speed) * centerAmp;
                const my = Math.sin(d.k + d.mIdx + this.time * speed) * centerAmp;

                return bundle([[m.x, m.y], [mx, my], [t.x - t.nx * 5, t.y - t.ny * 5]]);
            })
            .style("stroke-opacity", 0.4 + Math.sin(this.time * 1.5) * 0.2);
    }

    // --- METODO AGGIUNTO PER EVITARE CRASH ---
    resize() {
        if(!this.container || this.container.empty()) return;
        this.container.selectAll("svg").remove();
        this.initSVG();
        // Forza un aggiornamento visuale immediato
        this.updateVisuals();
    }
}