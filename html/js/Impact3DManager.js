import * as THREE from 'three';

export class Impact3DManager {
    constructor() {
        this.scenes = {}; 
        this.accentColor = 0xff340c; 
        this.whiteColor = 0xffffff;  
        this.fontFamily = 'Input-Mono, monospace';
    }

    normalize(val) {
        return Math.max(0, Math.min(100, val)) / 100;
    }

    init(params) {
        this.dispose();
        
        this.createSurfaceChart('canvas-surface', params);
        this.createLinesChart('canvas-lines', params);
        this.createCubeChart('canvas-cube', params);

        this.updateTextStats(params);
        
        // Resize multipli di sicurezza
        setTimeout(() => this.handleResize(), 50);
        setTimeout(() => this.handleResize(), 500);
    }

    handleResize() {
        Object.keys(this.scenes).forEach(id => {
            const container = document.getElementById(id);
            const sceneData = this.scenes[id];
            
            if (container && sceneData && sceneData.renderer && sceneData.camera) {
                const w = container.clientWidth || 500;
                const h = container.clientHeight || 400;
                
                sceneData.renderer.setSize(w, h);
                sceneData.camera.aspect = w / h;
                sceneData.camera.updateProjectionMatrix();
            }
        });
    }

    updateTextStats(params) {
        const setLabel = (id, val) => {
            const el = document.getElementById(id);
            if(!el) return;
            if(val < 33) { el.innerText = "BASSO"; el.className = "stat-val low"; }
            else if(val < 66) { el.innerText = "MEDIO"; el.className = "stat-val med"; }
            else { el.innerText = "ELEVATO"; el.className = "stat-val high"; }
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

    createArrow(position, rotation) {
        // Freccia proporzionata agli assi più piccoli
        const geometry = new THREE.ConeGeometry(0.06, 0.2, 8);
        const material = new THREE.MeshBasicMaterial({ color: this.whiteColor });
        const cone = new THREE.Mesh(geometry, material);
        cone.position.copy(position);
        if(rotation) cone.rotation.set(rotation.x, rotation.y, rotation.z);
        return cone;
    }

    addLabel(containerId, text, xPerc, yPerc, align = 'center', fontSize, color) {
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
        label.style.fontSize = fontSize || '1rem';
        label.style.color = color || '#fff'; 
        label.style.textShadow = '0px 0px 5px #000';
        container.appendChild(label);
    }

    // --- CHART 1: SURFACE (CORRETTO: Più piccolo, Più alto, Meno onda) ---
    createSurfaceChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;
        
        this.scenes[containerId] = { renderer, camera, frameId: null };
        
        camera.position.set(4.5, 3.5, 4.5);
        camera.lookAt(0.5, 0.8, 0.5); // Guarda verso il piano sollevato

        const axisMat = new THREE.LineBasicMaterial({ color: this.whiteColor, linewidth: 2 });
        
        // MODIFICA: Size ridotta da 2.5 a 2.0 (Grafico più piccolo)
        const size = 2.0; 

        // 1. ASSI
        // Y (Verticale)
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0, size, 0)]), axisMat));
        scene.add(this.createArrow(new THREE.Vector3(0, size, 0), {x:0, y:0, z:0})); 

        // X (Destra)
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(size, 0, 0)]), axisMat));
        scene.add(this.createArrow(new THREE.Vector3(size, 0, 0), {x:0, y:0, z:-Math.PI/2}));

        // Z (Profondità)
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0, 0, size)]), axisMat));
        scene.add(this.createArrow(new THREE.Vector3(0, 0, size), {x:Math.PI/2, y:0, z:0}));

        // Etichette
        this.addLabel(containerId, "LIVELLO DI INIBIZIONE", 50, 10, 'center', '1rem', '#fff');
        this.addLabel(containerId, "MODIFICA\nMESSAGGIO", 85, 88, 'left', '1rem', '#fff'); 
        this.addLabel(containerId, "SFORZO\nCOGNITIVO", 15, 88, 'right', '1rem', '#fff');

        // 2. RETE (PIANO FLUTTUANTE)
        const planeSize = 2.4; 
        const segments = 18;
        const geometry = new THREE.PlaneGeometry(planeSize, planeSize, segments, segments);
        
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xaaaaaa, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.35,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(geometry, material);
        
        // MODIFICA: Y alzata a 0.8 (Più sollevato rispetto a Z=0 che qui è Y=0)
        plane.rotation.x = -Math.PI / 2; 
        plane.position.set(size/2, 0.7, size/2); 
        scene.add(plane);

        // 3. SFERA (PICCOLA)
        const dotRadius = 0.06; // Molto piccola
        const dot = new THREE.Mesh(new THREE.SphereGeometry(dotRadius), new THREE.MeshBasicMaterial({ color: this.accentColor }));
        scene.add(dot);

        // 4. DATI E ANIMAZIONE
        const intensity = (params.assertivita + params.opacita) / 200; 
        const pX = (params.deumanizzazione + params.polarizzazione) / 200 * size;
        const pZ = (params.opacita + params.assertivita) / 200 * size;
        
        // Linea proiezione
        const projMat = new THREE.LineBasicMaterial({ color: this.accentColor, transparent: true, opacity: 0.4 });
        const dropLine = new THREE.Line(new THREE.BufferGeometry(), projMat);
        scene.add(dropLine);

        const animate = () => {
            if (!document.getElementById(containerId) || !this.scenes[containerId]) return;
            
            // MODIFICA: Tempo rallentato (x0.0005 invece di 0.0015)
            const time = Date.now() * 0.0008;
            
            const positions = plane.geometry.attributes.position;
            for(let i=0; i<positions.count; i++){
                const xBase = (i % (segments + 1));
                const yBase = Math.floor(i / (segments + 1));
                
                // MODIFICA: Onda molto più piatta (* 0.02 invece di 0.05)
                const zWave = Math.sin(xBase * 0.4 + time) * 0.02 + Math.cos(yBase * 0.4 + time) * 0.02;
                positions.setZ(i, zWave); 
            }
            positions.needsUpdate = true;

            // Calcolo altezza punto sulla rete
            const localWaveHeight = Math.sin((pX/size * segments)*0.4 + time)*0.02 + Math.cos((pZ/size * segments)*0.4 + time)*0.02;
            const dotY = 0.95 + localWaveHeight; // Base 0.8

            dot.position.set(pX, dotY, pZ);
            
            // Linea fino a terra (Y=0)
            dropLine.geometry.setFromPoints([new THREE.Vector3(pX, dotY, pZ), new THREE.Vector3(pX, 0, pZ)]);

            renderer.render(scene, camera);
            if(this.scenes[containerId]) this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
    }

    // --- CHART 2: LINES ---
    createLinesChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;

        this.scenes[containerId] = { renderer, camera, frameId: null };
        camera.position.set(0, 0, 6);

        const axisMat = new THREE.LineBasicMaterial({ color: this.whiteColor, linewidth: 2 });
        const gridMat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.5 });
        
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-3.5, 2.5, 0), new THREE.Vector3(-3.5, -2.0, 0), new THREE.Vector3(3.8, -2.0, 0)
        ]), axisMat));

        const ticks = 6;
        const labels = ["2H", "4H", "8H", "12H", "1G", "1S"];
        for(let i=1; i<=ticks; i++) {
            const x = -3.5 + (i * (7.0 / ticks));
            scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -2.0, -0.1), new THREE.Vector3(x, 2.0, -0.1)]), gridMat));
            if(i < ticks) this.addLabel(containerId, labels[i-1], 5 + ((x + 3.5)/7.5)*90, 92, 'center', '0.9rem', '#fff');
        }

        this.addLabel(containerId, "IMPRINTING COGNITIVO", 50, 5, 'center', '1.2rem', '#fff');
        this.addLabel(containerId, "TESTO\nMODIFICATO", 12, 42, 'right', '0.9rem', '#fff');
        this.addLabel(containerId, "TESTO\nORIGINALE", 12, 70, 'right', '0.9rem', '#888');

        const group = new THREE.Group();
        const createCurve = (yBase, color, amplitude) => {
            const pts = [];
            for(let x=-3.5; x<=3.5; x+=0.1) pts.push(new THREE.Vector3(x, yBase, 0));
            return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: color, linewidth: 2 }));
        };
        const lRed = createCurve(0.5, this.accentColor, 0.4); lRed.userData = { yBase: 0.5, amplitude: 0.4, offset: 0 };
        const lGrey = createCurve(-1.0, 0x666666, 0.2); lGrey.userData = { yBase: -1.0, amplitude: 0.2, offset: 5 };
        group.add(lRed, lGrey); scene.add(group);

        const animate = () => {
            if (!document.getElementById(containerId) || !this.scenes[containerId]) return;
            const time = Date.now() * 0.002;
            group.children.forEach(l => {
                const pos = l.geometry.attributes.position;
                for(let i=0; i<pos.count; i++) pos.setY(i, l.userData.yBase + Math.sin(pos.getX(i) + time + l.userData.offset) * l.userData.amplitude);
                pos.needsUpdate = true;
            });
            renderer.render(scene, camera);
            if(this.scenes[containerId]) this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
    }

    // --- CHART 3: CUBE ---
    createCubeChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;

        this.scenes[containerId] = { renderer, camera, frameId: null };
        camera.position.set(5, 5, 5); 
        camera.lookAt(0, 0, 0);

        const axisMat = new THREE.LineBasicMaterial({ color: this.whiteColor, transparent: true, opacity: 0.8, linewidth: 2 });
        const mkAx = (end) => scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), end]), axisMat));
        mkAx(new THREE.Vector3(0, 3, 0)); 
        mkAx(new THREE.Vector3(3, 0, 0)); 
        mkAx(new THREE.Vector3(0, 0, 3)); 

        this.addLabel(containerId, "AMIGDALA", 50, 5, 'center', '1.1rem', '#fff');    
        this.addLabel(containerId, "CORTECCIA\nPREFRONTALE", 90, 85, 'left', '1.1rem', '#fff'); 
        this.addLabel(containerId, "STRIATO\nVENTRALE", 10, 85, 'right', '1.1rem', '#fff'); 

        const sphereGeo = new THREE.IcosahedronGeometry(0.6, 2);
        const createBall = (color, pos) => {
            const mesh = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: 0.4 }));
            mesh.position.copy(pos);
            const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), pos]), new THREE.LineBasicMaterial({ color: 0x888888 }));
            const g = new THREE.Group(); g.add(mesh); g.add(line); scene.add(g);
            return mesh;
        };

        const pEmo = this.normalize(params.emotivo);
        const pLog = this.normalize(params.deumanizzazione);
        const pBias = this.normalize(params.polarizzazione);

        const s1 = createBall(this.whiteColor, new THREE.Vector3(0, 1.8, 0));
        const s2 = createBall(0xaaaaaa, new THREE.Vector3(1.8, 0, 0));
        const s3 = createBall(0xaaaaaa, new THREE.Vector3(0, 0, 1.8));

        const animate = () => {
            if (!document.getElementById(containerId) || !this.scenes[containerId]) return;
            const time = Date.now() * 0.002;
            const sc1 = 0.6 + (pEmo * 0.8) + Math.sin(time * 3) * 0.05; s1.scale.set(sc1, sc1, sc1);
            if(pEmo > 0.5) s1.children[0].material.color.setHex(this.accentColor);
            const sc2 = 0.6 + (pLog * 0.7); s2.scale.set(sc2, sc2, sc2);
            const sc3 = 0.6 + (pBias * 0.7); s3.scale.set(sc3, sc3, sc3);
            renderer.render(scene, camera);
            if(this.scenes[containerId]) this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
    }

    createBaseScene(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        container.style.position = 'relative'; 
        if (this.scenes[containerId]) this.disposeSingleScene(containerId);
        
        let w = container.clientWidth || 500;
        let h = container.clientHeight || 400;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, w/h, 0.1, 100);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setClearColor( 0x000000, 0 );
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.innerHTML = ''; container.appendChild(renderer.domElement);
        return { scene, camera, renderer };
    }

    disposeSingleScene(id) {
        const s = this.scenes[id];
        if (!s) return;
        if(s.frameId) cancelAnimationFrame(s.frameId);
        if(s.renderer) s.renderer.dispose();
        delete this.scenes[id];
    }
    dispose() { Object.keys(this.scenes).forEach(k => this.disposeSingleScene(k)); }
}