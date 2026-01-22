import * as THREE from 'three';

export class Impact3DManager {
    constructor() {
        this.scenes = {}; 
        this.accentColor = 0xff340c; // Arancione Fragma
        this.whiteColor = 0xffffff;  
        this.axisColor = 0xeeeeee;   // Bianco sporco per gli assi
        this.gridColor = 0x333333;   // Grigio scuro per la rete
        this.fontFamily = 'Input-Mono, monospace';
    }

    normalize(val) {
        return Math.max(0, Math.min(100, val)) / 100;
    }

    init(params) {
        this.dispose();

        // 1. Superficie
        this.createSurfaceChart('canvas-surface', params);

        // 2. Linee (Ora con assi L e griglia verticale)
        this.createLinesChart('canvas-lines', params);

        // 3. Sfere (Assi bianchi, sfere ridimensionate)
        this.createCubeChart('canvas-cube', params);

        this.updateTextStats(params);
    }

    updateTextStats(params) {
        const setLabel = (id, val) => {
            const el = document.getElementById(id);
            if(!el) return;
            if(val < 33) { el.innerText = "BASSO"; }
            else if(val < 66) { el.innerText = "MEDIO"; }
            else { el.innerText = "ELEVATO"; }
        };
        
        setLabel('stat-amigdala', params.emotivo);
        setLabel('stat-logica', params.deumanizzazione);
        setLabel('stat-bias', params.polarizzazione);

        const elRoot = document.getElementById('val-radicamento');
        if(elRoot) {
            const val = Math.floor(60 + (params.assertivita * 0.2) + (params.emotivo * 0.2));
            elRoot.innerText = val + "%";
        }
    }

    // --- CHART 1: SURFACE ---
    createSurfaceChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;
        
        this.scenes[containerId] = { renderer, frameId: null };
        camera.position.set(4, 3.5, 4);
        camera.lookAt(0, -0.5, 0);

        // Assi Croce Centrale
        const axisMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.8 });
        
        const vAxisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 2, 0)]);
        scene.add(new THREE.Line(vAxisGeo, axisMat));

        const xAxisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.5, -0.5, 0), new THREE.Vector3(2.5, -0.5, 0)]);
        scene.add(new THREE.Line(xAxisGeo, axisMat));

        const zAxisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -0.5, -2.5), new THREE.Vector3(0, -0.5, 2.5)]);
        scene.add(new THREE.Line(zAxisGeo, axisMat));

        // Etichette
        this.addLabel(containerId, "LIVELLO DI INIBIZIONE", 50, 10);
        this.addLabel(containerId, "MODIFICA\nMESSAGGIO", 15, 80, 'left');
        this.addLabel(containerId, "SFORZO\nCOGNITIVO", 85, 80, 'right');
        
        // Superficie
        const pAss = this.normalize(params.assertivita);
        const geometry = new THREE.PlaneGeometry(5, 5, 30, 30);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x555555, wireframe: true, transparent: true, opacity: 0.3 
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2; 
        plane.position.y = -0.5;
        scene.add(plane);

        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: this.accentColor }));
        scene.add(dot);

        const animate = () => {
            if (!document.getElementById(containerId) || !this.scenes[containerId]) return;
            const time = Date.now() * 0.0015;
            const positions = plane.geometry.attributes.position;
            const amp = 0.3 + pAss; 

            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i); 
                const dist = Math.sqrt(x*x + y*y);
                const z = Math.sin(dist * 1.5 - time) * amp * Math.exp(-dist * 0.4);
                positions.setZ(i, z);
            }
            positions.needsUpdate = true;
            
            const centerZ = Math.sin(0 - time) * amp - 0.5;
            dot.position.set(0, centerZ, 0);

            renderer.render(scene, camera);
            this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
    }

    // --- CHART 2: LINES (Assi L + Griglia Temporale) ---
    createLinesChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;

        this.scenes[containerId] = { renderer, frameId: null };
        camera.position.set(0, 0, 6);

        // 1. ASSE L (Bianco Forte)
        const axisMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const axisPoints = [
            new THREE.Vector3(-3.5, 2.5, 0),   // Alto Sx (Freccia Y)
            new THREE.Vector3(-3.5, -2.0, 0),  // Angolo
            new THREE.Vector3(3.8, -2.0, 0)    // Basso Dx (Freccia X)
        ];
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(axisPoints), axisMat));

        // 2. FRECCE (Coni alle estremità)
        const arrowGeo = new THREE.ConeGeometry(0.08, 0.2, 8);
        const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        // Freccia Y (Alto)
        const yArrow = new THREE.Mesh(arrowGeo, arrowMat);
        yArrow.position.set(-3.5, 2.5, 0);
        scene.add(yArrow);

        // Freccia X (Destra)
        const xArrow = new THREE.Mesh(arrowGeo, arrowMat);
        xArrow.position.set(3.8, -2.0, 0);
        xArrow.rotation.z = -Math.PI / 2;
        scene.add(xArrow);

        // 3. GRIGLIA VERTICALE (Tempo)
        const gridMat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.5 });
        const ticks = 6;
        const labels = ["2H", "4H", "8H", "12H", "1G", "1S"];
        const startX = -3.5;
        const width = 7.0;
        const step = width / ticks;

        for(let i=1; i<=ticks; i++) {
            const x = startX + (i * step);
            // Linea verticale
            const gridLineGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, -2.0, -0.1), // Leggermente dietro
                new THREE.Vector3(x, 2.0, -0.1)
            ]);
            scene.add(new THREE.Line(gridLineGeo, gridMat));

            // Etichetta Temporale
            // Mappiamo X (da -3.5 a 3.5) in % (da 0 a 100) per l'HTML
            // offset manuale per centrare
            const xPerc = 5 + ((x + 3.5) / 7.5) * 90; 
            if(i < ticks) { // Non metto l'ultima label se troppo vicina alla freccia
                 this.addLabel(containerId, labels[i-1], xPerc, 92, 'center', '0.55rem');
            }
        }

        // Etichette Generali
        this.addLabel(containerId, "IMPRINTING COGNITIVO", 50, 10);
        this.addLabel(containerId, "TESTO\nMODIFICATO", 12, 45, 'right');
        this.addLabel(containerId, "TESTO\nORIGINALE", 12, 75, 'right');

        // 4. LINEE DATI
        const group = new THREE.Group();
        const createCurve = (yBase, color, amplitude) => {
            const pts = [];
            for(let x=-3.5; x<=3.5; x+=0.1) pts.push(new THREE.Vector3(x, yBase, 0));
            const line = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color: color, linewidth: 2 })
            );
            line.userData = { yBase, amplitude, offset: Math.random()*10 };
            return line;
        };

        const lRed = createCurve(0.5, this.accentColor, 0.4);
        const lGrey1 = createCurve(-1.0, 0x666666, 0.2);
        group.add(lRed, lGrey1);
        scene.add(group);

        const animate = () => {
            if (!document.getElementById(containerId) || !this.scenes[containerId]) return;
            const time = Date.now() * 0.002;
            group.children.forEach(l => {
                const pos = l.geometry.attributes.position;
                for(let i=0; i<pos.count; i++){
                    const x = pos.getX(i);
                    const y = l.userData.yBase + Math.sin(x + time + l.userData.offset) * l.userData.amplitude;
                    pos.setY(i, y);
                }
                pos.needsUpdate = true;
            });
            renderer.render(scene, camera);
            this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
    }

    // --- CHART 3: SPHERES (Assi Bianchi + Sfere Contenute) ---
    createCubeChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;

        this.scenes[containerId] = { renderer, frameId: null };
        camera.position.set(3, 2, 4);
        camera.lookAt(0, 0, 0);

        // 1. ASSI BIANCHI (Ben visibili)
        const axisMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
        const addAxis = (start, end) => {
            scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([start, end]), axisMat));
        };
        
        // Assi lunghi che attraversano tutto
        addAxis(new THREE.Vector3(0,-2.0,0), new THREE.Vector3(0,2.0,0)); // Y
        addAxis(new THREE.Vector3(-2.0,0,0), new THREE.Vector3(2.0,0,0)); // X
        addAxis(new THREE.Vector3(0,0,-2.0), new THREE.Vector3(0,0,2.0)); // Z
        
        // Frecce alle punte positive
        const arrowGeo = new THREE.ConeGeometry(0.05, 0.15, 8);
        const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const mkArr = (x,y,z, rx, rz) => {
            const m = new THREE.Mesh(arrowGeo, arrowMat);
            m.position.set(x,y,z);
            if(rx) m.rotation.x = rx;
            if(rz) m.rotation.z = rz;
            scene.add(m);
        }
        mkArr(0, 2.0, 0, 0, 0);       // Y Top
        mkArr(2.0, 0, 0, 0, -Math.PI/2); // X Right
        mkArr(0, 0, 2.0, Math.PI/2, 0);  // Z Front

        // Etichette
        this.addLabel(containerId, "AMIGDALA", 50, 5);    
        this.addLabel(containerId, "CORTECCIA\nPREFRONTALE", 90, 75, 'left'); 
        this.addLabel(containerId, "STRIATO\nVENTRALE", 10, 80, 'right'); 

        // 2. SFERE (Scalate verso il basso)
        const sphereGeo = new THREE.IcosahedronGeometry(0.5, 3); // Dettaglio medio
        
        const createBall = (color, x, y, z) => {
            const mat = new THREE.MeshBasicMaterial({ 
                color: color, 
                wireframe: true, 
                transparent: true, 
                opacity: 0.3 
            });
            const mesh = new THREE.Mesh(sphereGeo, mat);
            mesh.position.set(x, y, z);
            
            // Linea di collegamento al centro
            const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(x,y,z)]);
            const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x888888 }));
            
            const g = new THREE.Group();
            g.add(mesh); g.add(line);
            scene.add(g);
            return mesh;
        };

        const pEmo = this.normalize(params.emotivo);
        const pLog = this.normalize(params.deumanizzazione);
        const pBias = this.normalize(params.polarizzazione);

        const s1 = createBall(this.whiteColor, 0, 0.7, 0);       // Alto (Amygdala)
        const s2 = createBall(0x888888, 0.8, -0.3, 0);           // Dx (Corteccia)
        const s3 = createBall(0x888888, -0.6, -0.4, 0.6);        // Sx Avanti (Striato)

        const animate = () => {
            if (!document.getElementById(containerId) || !this.scenes[containerId]) return;

            const time = Date.now() * 0.002;
            scene.rotation.y = Math.sin(time * 0.1) * 0.15;

            // SCALING RIDOTTO:
            // Base 0.5 + influenza max 0.5. Totale scala = 1.0 (cioè raggio vero 0.5)
            // Prima arrivava a 1.5 (raggio 0.75) che copriva tutto.
            
            const sc1 = 0.5 + (pEmo * 0.5) + Math.sin(time * 2) * 0.05;
            s1.scale.set(sc1, sc1, sc1);
            if(pEmo > 0.5) s1.material.color.setHex(this.accentColor);

            const sc2 = 0.5 + (pLog * 0.4);
            s2.scale.set(sc2, sc2, sc2);

            const sc3 = 0.5 + (pBias * 0.4);
            s3.scale.set(sc3, sc3, sc3);

            renderer.render(scene, camera);
            this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
    }

    // --- UTILS ---
    addLabel(containerId, text, xPerc, yPerc, align = 'center', fontSize = '0.7rem') {
        const container = document.getElementById(containerId);
        if(!container) return;
        const label = document.createElement('div');
        label.className = 'chart-overlay-label';
        label.innerText = text;
        label.style.position = 'absolute';
        label.style.left = xPerc + '%';
        label.style.top = yPerc + '%';
        label.style.transform = 'translate(-50%, -50%)';
        label.style.textAlign = align;
        label.style.fontFamily = this.fontFamily;
        label.style.fontSize = fontSize;
        label.style.color = '#888'; 
        label.style.textShadow = '0px 0px 2px #000';
        container.appendChild(label);
    }

    createBaseScene(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        container.style.position = 'relative'; 
        
        if (this.scenes[containerId]) this.disposeSingleScene(containerId);

        const width = container.clientWidth;
        const height = container.clientHeight;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
        
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setClearColor( 0x000000, 0 );
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        
        return { scene, camera, renderer };
    }

    disposeSingleScene(id) {
        const s = this.scenes[id];
        if (!s) return;
        if(s.frameId) cancelAnimationFrame(s.frameId);
        if(s.renderer) {
            s.renderer.dispose();
            if (s.renderer.domElement && s.renderer.domElement.parentNode) {
                s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
            }
        }
        delete this.scenes[id];
    }

    dispose() {
        Object.keys(this.scenes).forEach(k => this.disposeSingleScene(k));
    }
}