import * as THREE from 'three';

export class Impact3DManager {
    constructor() {
        this.scenes = {}; // Contenitore per le 3 scene
        this.accentColor = 0xff340c;
    }

    // Chiamata principale quando si entra nella scena
    init(params) {
        // Pulisci se c'era roba vecchia per evitare memory leak
        this.dispose();

        // 1. Superficie (Manipolazione)
        this.createSurfaceChart('canvas-surface', params);

        // 2. Linee (Persistenza)
        this.createLinesChart('canvas-lines', params);

        // 3. Cubo Radar (Pensiero Critico)
        this.createCubeChart('canvas-cube', params);

        // Aggiorna testi statici
        this.updateTextStats(params);
    }

    updateTextStats(params) {
        // Calcoli finti ma plausibili basati sugli slider
        const inhibition = Math.min(99, 40 + (params.assertivita * 4) + (params.deumanizzazione * 2));
        const rooting = Math.min(99, 30 + (params.emotivo * 5) + (params.polarizzazione * 2));

        const elInib = document.getElementById('val-inibizione');
        if(elInib) elInib.innerText = Math.floor(inhibition) + "%";

        const elRoot = document.getElementById('val-radicamento');
        if(elRoot) elRoot.innerText = Math.floor(rooting) + "%";
        
        // Aggiorna le scritte BASSO/MEDIO/ALTO
        const setLabel = (id, val) => {
            const el = document.getElementById(id);
            if(!el) return;
            if(val < 3) { el.innerText = "BASSO"; el.className = "stat-val low"; }
            else if(val < 7) { el.innerText = "MEDIO"; el.className = "stat-val med"; }
            else { el.innerText = "CRITICO"; el.className = "stat-val high"; }
        };

        setLabel('stat-amigdala', params.emotivo);
        setLabel('stat-logica', params.deumanizzazione);
        setLabel('stat-bias', params.polarizzazione);
    }

    // --- CHART 1: SURFACE PLOT ---
    createSurfaceChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;
        
        // CORREZIONE 1: Inizializziamo l'oggetto PRIMA di lanciare l'animazione
        this.scenes[containerId] = { renderer, frameId: null };

        const geometry = new THREE.PlaneGeometry(10, 10, 20, 20);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x666666, 
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2.5; 
        scene.add(plane);

        const peakGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const peakMat = new THREE.MeshBasicMaterial({ color: this.accentColor });
        const peak = new THREE.Mesh(peakGeo, peakMat);
        scene.add(peak);

        const animate = () => {
            if (!document.getElementById(containerId)) return;
            
            const time = Date.now() * 0.001;
            const positions = plane.geometry.attributes.position;
            const amp = 0.5 + (params.assertivita * 0.1); 
            
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i); 
                const z = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * amp;
                positions.setZ(i, z);
            }
            positions.needsUpdate = true;
            peak.position.set(0, Math.sin(time)*amp, 0);

            renderer.render(scene, camera);
            
            // Ora questo non darà errore perché this.scenes[containerId] esiste già
            this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
    }

    // --- CHART 2: LINEE ---
    createLinesChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;
        camera.position.set(0, 0, 12);

        // CORREZIONE 2: Inizializzazione anticipata
        this.scenes[containerId] = { renderer, frameId: null };

        const group = new THREE.Group();
        
        const createCurve = (offsetY, color, speed) => {
            const points = [];
            for (let i = -5; i <= 5; i += 0.5) {
                points.push(new THREE.Vector3(i, offsetY, 0));
            }
            const curve = new THREE.CatmullRomCurve3(points);
            const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
            const mat = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
            const line = new THREE.Line(geo, mat);
            line.userData = { speed: speed, originalY: offsetY, offset: Math.random() * 10 };
            return line;
        };

        const l1 = createCurve(1, 0xffffff, 1);
        const l2 = createCurve(0, 0x666666, 1.5);
        const l3 = createCurve(-1, this.accentColor, 2);

        group.add(l1, l2, l3);
        
        const gridHelper = new THREE.GridHelper(10, 10, 0x222222, 0x222222);
        gridHelper.rotation.x = Math.PI / 2;
        gridHelper.position.z = -1;
        scene.add(gridHelper);
        scene.add(group);

        const animate = () => {
            if (!document.getElementById(containerId)) return;
            const time = Date.now() * 0.002;

            group.children.forEach(line => {
                const positions = line.geometry.attributes.position;
                const impactFactor = params.emotivo * 0.2; 

                for(let i=0; i<positions.count; i++) {
                    const x = positions.getX(i);
                    const y = line.userData.originalY + Math.sin(x + time * line.userData.speed + line.userData.offset) * impactFactor;
                    positions.setY(i, y);
                }
                positions.needsUpdate = true;
            });

            renderer.render(scene, camera);
            this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
    }

    // --- CHART 3: CUBO RADAR ---
    createCubeChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;
        camera.position.set(4, 3, 5);
        camera.lookAt(0, 0, 0);

        // CORREZIONE 3: Inizializzazione anticipata
        this.scenes[containerId] = { renderer, frameId: null };

        const boxGeo = new THREE.BoxGeometry(3, 3, 3);
        const edges = new THREE.EdgesGeometry(boxGeo);
        const boxMat = new THREE.LineBasicMaterial({ color: 0x444444 });
        const box = new THREE.LineSegments(edges, boxMat);
        scene.add(box);

        const addAxis = (dir, color) => {
            const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0,0,0), 1.5, color, 0.2, 0.1);
            scene.add(arrow);
        };
        addAxis(new THREE.Vector3(1,0,0), 0x666666);
        addAxis(new THREE.Vector3(0,1,0), 0x666666);
        addAxis(new THREE.Vector3(0,0,1), 0x666666);

        const radius = 0.5 + (params.moralizzazione * 0.1) + (params.opacita * 0.1);
        const sphereGeo = new THREE.IcosahedronGeometry(radius, 1);
        const sphereMat = new THREE.MeshBasicMaterial({ 
            color: this.accentColor, 
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        scene.add(sphere);

        const coreGeo = new THREE.SphereGeometry(radius * 0.4, 8, 8);
        const coreMat = new THREE.MeshBasicMaterial({ color: this.accentColor });
        const core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core);

        const animate = () => {
            if (!document.getElementById(containerId)) return;
            
            box.rotation.y += 0.002; 
            sphere.rotation.x -= 0.01;
            sphere.rotation.z -= 0.01;

            const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
            core.scale.set(scale, scale, scale);

            renderer.render(scene, camera);
            this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
    }

    createBaseScene(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        // PULIZIA PREVENTIVA: Se c'è già una scena su questo container, distruggila
        if (this.scenes[containerId]) {
            this.disposeSingleScene(containerId);
        }

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 10);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        container.innerHTML = ''; 
        container.appendChild(renderer.domElement);

        return { scene, camera, renderer };
    }

    // Funzione helper per distruggere una singola scena
    disposeSingleScene(id) {
        const s = this.scenes[id];
        if (!s) return;

        // 1. Ferma l'animazione
        if (s.frameId) cancelAnimationFrame(s.frameId);

        // 2. Distruggi il renderer WebGL (Libera la GPU)
        if (s.renderer) {
            s.renderer.dispose();
            
            // Forza la perdita del contesto (Opzionale ma utile per browser testardi)
            if (s.renderer.forceContextLoss) s.renderer.forceContextLoss();
            
            // Rimuovi il canvas dal DOM
            if (s.renderer.domElement && s.renderer.domElement.parentNode) {
                s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
            }
            s.renderer = null;
        }

        // 3. Pulisci l'oggetto
        delete this.scenes[id];
    }

    dispose() {
        // Distruggi tutte le scene attive
        Object.keys(this.scenes).forEach(key => {
            this.disposeSingleScene(key);
        });
        this.scenes = {};
    }
}