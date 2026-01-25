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
        const geometry = new THREE.ConeGeometry(0.06, 0.2, 8);
        const material = new THREE.MeshBasicMaterial({ color: this.whiteColor });
        const cone = new THREE.Mesh(geometry, material);
        cone.position.copy(position);
        if(rotation) cone.rotation.set(rotation.x, rotation.y, rotation.z);
        return cone;
    }

    // Helper per creare linee spesse (Box) per gli assi
    createThickLine(start, end, thickness) {
        const path = new THREE.Vector3().subVectors(end, start);
        const len = path.length();
        const geometry = new THREE.BoxGeometry(thickness, len, thickness);
        const material = new THREE.MeshBasicMaterial({ color: this.whiteColor });
        
        const mesh = new THREE.Mesh(geometry, material);
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        mesh.position.copy(center);
        mesh.lookAt(end);
        mesh.rotateX(Math.PI / 2); 
        
        return mesh;
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

    // Helper per onde spettrali (Grafico 2)
    createSpectrum(yBase, color, layers, intensity) {
        const group = new THREE.Group();
        for(let l=0; l<layers; l++) {
            const pts = [];
            for(let x=-3.5; x<=3.8; x+=0.1) { 
                const curve = Math.sin(x * 0.5) * 0.3 + Math.cos(x * 0.8) * 0.2; 
                const yLayerOffset = l * 0.06; 
                pts.push(new THREE.Vector3(x, yBase + curve - yLayerOffset, 0));
            }
            const opacity = l === 0 ? 1.0 : (1.0 - (l/layers)) * 0.5;
            const mat = new THREE.LineBasicMaterial({ 
                color: color, 
                transparent: true, 
                opacity: opacity,
                linewidth: l === 0 ? 2 : 1
            });
            const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
            line.userData = { originalY: pts.map(p => p.y), phaseOffset: l * 0.2, intensity: intensity };
            group.add(line);
        }
        return group;
    }

   // --- CHART 1: SURFACE (FIXED: GRIGLIA FORZATA SOPRA A TUTTO) ---
    createSurfaceChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;
        
        this.scenes[containerId] = { renderer, camera, frameId: null };
        
        camera.position.set(4.5, 3.5, 4.5);
        camera.lookAt(0.5, 0.8, 0.5); 

        const axisMat = new THREE.LineBasicMaterial({ color: this.whiteColor, linewidth: 2 });
        const size = 2.0; 

        // 1. ASSI (Livello Base - Dietro)
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0, size, 0)]), axisMat));
        scene.add(this.createArrow(new THREE.Vector3(0, size, 0), {x:0, y:0, z:0})); 

        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(size, 0, 0)]), axisMat));
        scene.add(this.createArrow(new THREE.Vector3(size, 0, 0), {x:0, y:0, z:-Math.PI/2}));

        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0, 0, size)]), axisMat));
        scene.add(this.createArrow(new THREE.Vector3(0, 0, size), {x:Math.PI/2, y:0, z:0}));

        this.addLabel(containerId, "LIVELLO DI INIBIZIONE", 50, 10, 'center', '1rem', '#fff');
        this.addLabel(containerId, "MODIFICA\nMESSAGGIO", 85, 88, 'left', '1rem', '#fff'); 
        this.addLabel(containerId, "SFORZO\nCOGNITIVO", 15, 88, 'right', '1rem', '#fff');

        // 2. HIGHLIGHT AREA (RETTANGOLO - Livello 1)
        const hlGeo = new THREE.PlaneGeometry(1, 1);
        const highlightMat = new THREE.MeshBasicMaterial({
            color: this.accentColor, 
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            depthWrite: false 
        });
        
        const highlightPlane = new THREE.Mesh(hlGeo, highlightMat);
        highlightPlane.rotation.x = -Math.PI / 2; 
        highlightPlane.renderOrder = 1; 
        scene.add(highlightPlane);

        // 3. GRIGLIA ONDULATA (FORZATA SOPRA - Livello 10)
        // depthTest: false fa sì che venga disegnata SOPRA tutto ciò che c'è prima (Assi e Rettangolo)
        const planeSize = 2.4; 
        const segments = 18;
        const geometry = new THREE.PlaneGeometry(planeSize, planeSize, segments, segments);
        
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xaaaaaa, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.3, // Leggermente più visibile
            side: THREE.DoubleSide,
            depthTest: false // MAGIA: Ignora la profondità reale e si stampa sopra
        });
        const plane = new THREE.Mesh(geometry, material);
        const gridHeight = 0.7; 
        
        plane.rotation.x = -Math.PI / 2; 
        plane.position.set(size/2, gridHeight, size/2); 
        plane.renderOrder = 10; 
        
        scene.add(plane);

        // 4. SFERA E LINEA (SUPER LIVELLO - 30)
        // Disegnati per ultimi, sopra anche alla griglia "magica"
        const dotRadius = 0.06; 
        
        // Importante: transparent: true per rispettare il renderOrder nel bucket trasparente
        const dotMat = new THREE.MeshBasicMaterial({ 
            color: this.accentColor,
            transparent: true, 
            opacity: 1.0 
        });
        const dot = new THREE.Mesh(new THREE.SphereGeometry(dotRadius), dotMat);
        
        dot.renderOrder = 30; // Vince su tutto
        scene.add(dot);

        const projMat = new THREE.LineBasicMaterial({ color: this.accentColor, transparent: true, opacity: 0.8 });
        const dropLine = new THREE.Line(new THREE.BufferGeometry(), projMat);
        dropLine.renderOrder = 5; // La linea sta "sotto" la griglia (5 < 10) per effetto profondità
        scene.add(dropLine);

        // --- CALCOLO COORDINATE SICURE (CLAMPING) ---
        const getSafeCoords = () => {
            let rawX = params.deumanizzazione + params.polarizzazione;
            let rawZ = params.opacita + params.assertivita;
            
            rawX = Math.min(rawX, 200);
            rawZ = Math.min(rawZ, 200);

            const safeFactor = 0.85; 
            const x = (rawX / 200) * size * safeFactor;
            const z = (rawZ / 200) * size * safeFactor;
            return { x, z };
        };

        const animate = () => {
            if (!document.getElementById(containerId) || !this.scenes[containerId]) return;
            const time = Date.now() * 0.0008;
            
            // Animazione Griglia
            const positions = plane.geometry.attributes.position;
            for(let i=0; i<positions.count; i++){
                const xBase = (i % (segments + 1));
                const yBase = Math.floor(i / (segments + 1));
                const zWave = Math.sin(xBase * 0.4 + time) * 0.02 + Math.cos(yBase * 0.4 + time) * 0.02;
                positions.setZ(i, zWave); 
            }
            positions.needsUpdate = true;

            const { x: pX, z: pZ } = getSafeCoords();
            const localWaveHeight = Math.sin((pX/size * segments)*0.4 + time)*0.02 + Math.cos((pZ/size * segments)*0.4 + time)*0.02;
            const dotY = (gridHeight + 0.5) + localWaveHeight; 

            dot.position.set(pX, dotY, pZ);
            
            // Area Rettangolare
            const safeX = Math.max(0.001, pX);
            const safeZ = Math.max(0.001, pZ);
            highlightPlane.scale.set(safeX, safeZ, 1);
            highlightPlane.position.set(safeX / 2, 0.01, safeZ / 2);

            dropLine.geometry.setFromPoints([
                new THREE.Vector3(pX, dotY, pZ), 
                new THREE.Vector3(pX, 0.01, pZ)
            ]);

            renderer.render(scene, camera);
            if(this.scenes[containerId]) this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
    }
    // --- CHART 2: LINES (INVARIATO) ---
    createLinesChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;

        this.scenes[containerId] = { renderer, camera, frameId: null };
        camera.position.set(0, 0, 6);

        const gridMat = new THREE.LineBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.3 });
        const thick = 0.04; 

        scene.add(this.createThickLine(new THREE.Vector3(-3.5, -2.0, 0), new THREE.Vector3(-3.5, 2.8, 0), thick));
        scene.add(this.createArrow(new THREE.Vector3(-3.5, 2.8, 0), {x:0, y:0, z:0}));
        scene.add(this.createThickLine(new THREE.Vector3(-3.5, -2.0, 0), new THREE.Vector3(3.8, -2.0, 0), thick));
        scene.add(this.createArrow(new THREE.Vector3(3.8, -2.0, 0), {x:0, y:0, z:-Math.PI/2}));

        const labels = ["2H", "4H", "8H", "12H", "1G"]; 
        const ticksCount = labels.length; 
        const startX = -3.5;
        const endGridX = 2.5; 
        const step = (endGridX - startX) / (ticksCount - 1); 

        for(let i=0; i<ticksCount; i++) {
            const x = startX + (i * step);
            if (i > 0) {
                scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(x, -2.0, -0.05), new THREE.Vector3(x, 2.5, -0.05)
                ]), gridMat));
            }
            const xPerc = 50 + (x / 7.6) * 100 + 1.5;
            this.addLabel(containerId, labels[i], xPerc, 92, 'center', '0.9rem', '#fff');
        }

        this.addLabel(containerId, "IMPRINTING COGNITIVO", 50, 5, 'center', '1.2rem', '#fff');
        this.addLabel(containerId, "TESTO\nMODIFICATO", 12, 42, 'right', '0.9rem', '#fff');
        this.addLabel(containerId, "TESTO\nORIGINALE", 12, 70, 'right', '0.9rem', '#888');

        const avgParams = (params.assertivita + params.emotivo + params.polarizzazione) / 300; 
        const orangeY = 0.0 + (avgParams * 1.2); 
        const orangeSpectrum = this.createSpectrum(orangeY, this.accentColor, 10, avgParams); 
        scene.add(orangeSpectrum);
        const greySpectrum = this.createSpectrum(-1.2, 0x555555, 6, 0.05); 
        scene.add(greySpectrum);

        const animate = () => {
            if (!document.getElementById(containerId) || !this.scenes[containerId]) return;
            const time = Date.now() * 0.001;
            orangeSpectrum.children.forEach(line => {
                const pos = line.geometry.attributes.position;
                const orig = line.userData.originalY;
                const ph = line.userData.phaseOffset;
                const inte = 0.2 + (avgParams * 0.3); 
                for(let i=0; i<pos.count; i++){
                    const wave = Math.sin(i * 0.4 + time + ph) * inte;
                    pos.setY(i, orig[i] + wave);
                }
                pos.needsUpdate = true;
            });
            greySpectrum.children.forEach(line => {
                const pos = line.geometry.attributes.position;
                const orig = line.userData.originalY;
                const ph = line.userData.phaseOffset;
                for(let i=0; i<pos.count; i++){
                    const wave = Math.sin(i * 0.2 + time * 0.5 + ph) * 0.05;
                    pos.setY(i, orig[i] + wave);
                }
                pos.needsUpdate = true;
            });
            renderer.render(scene, camera);
            if(this.scenes[containerId]) this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
    }

    // --- CHART 3: CUBE (INVARIATO) ---
    createCubeChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;

        this.scenes[containerId] = { renderer, camera, frameId: null };
        
        camera.position.set(8, 6, 8); 
        camera.lookAt(0, 0.75, 0); 

        const thick = 0.006; 
        const axLen = 3.5; 
        
        scene.add(this.createThickLine(new THREE.Vector3(0,0,0), new THREE.Vector3(0, axLen, 0), thick)); 
        scene.add(this.createArrow(new THREE.Vector3(0, axLen, 0), {x:0, y:0, z:0}));

        scene.add(this.createThickLine(new THREE.Vector3(0,0,0), new THREE.Vector3(axLen, 0, 0), thick)); 
        scene.add(this.createArrow(new THREE.Vector3(axLen, 0, 0), {x:0, y:0, z:-Math.PI/2}));

        scene.add(this.createThickLine(new THREE.Vector3(0,0,0), new THREE.Vector3(0, 0, axLen), thick)); 
        scene.add(this.createArrow(new THREE.Vector3(0, 0, axLen), {x:Math.PI/2, y:0, z:0}));

        this.addLabel(containerId, "AMIGDALA", 50, 5, 'center', '1.1rem', '#fff');    
        this.addLabel(containerId, "CORTECCIA\nPREFRONTALE", 90, 85, 'left', '1.1rem', '#fff'); 
        this.addLabel(containerId, "STRIATO\nVENTRALE", 10, 85, 'right', '1.1rem', '#fff'); 

        const particleCount = 3000; 
        const geometry = new THREE.BoxGeometry(0.04, 0.04, 0.04); 
        const material = new THREE.MeshBasicMaterial({ 
            color: this.accentColor, 
            transparent: true, 
            opacity: 0.9 
        });
        const mesh = new THREE.InstancedMesh(geometry, material, particleCount);
        scene.add(mesh);

        const dummy = new THREE.Object3D();
        
        const vY = this.normalize(params.emotivo); 
        const vX = this.normalize(params.deumanizzazione);
        const vZ = this.normalize(params.polarizzazione);

        const totalIntensity = (vX + vY + vZ) / 3;
        const visibleParticles = Math.floor(400 + (2600 * totalIntensity));

        const offsets = [];
        const L = 3.5; 

        for(let i=0; i<particleCount; i++) {
            const rX = (Math.random() - 0.5) + (Math.random() - 0.5); 
            const rY = (Math.random() - 0.5) + (Math.random() - 0.5);
            const rZ = (Math.random() - 0.5) + (Math.random() - 0.5);

            const cX = vX * 1.5; 
            const cY = vY * 1.5;
            const cZ = vZ * 1.5;

            const sX = 0.4 + (vX * 1.0); 
            const sY = 0.4 + (vY * 1.0);
            const sZ = 0.4 + (vZ * 1.0);

            offsets.push({
                x: cX + rX * sX,
                y: cY + rY * sY,
                z: cZ + rZ * sZ,
                rotSpeed: (Math.random() - 0.5) * 0.02,
                phase: Math.random() * Math.PI * 2
            });
        }

        const animate = () => {
            if (!document.getElementById(containerId) || !this.scenes[containerId]) return;
            const time = Date.now() * 0.001;

            for(let i=0; i<particleCount; i++) {
                if (i > visibleParticles) {
                    dummy.scale.set(0, 0, 0);
                } else {
                    dummy.scale.set(1, 1, 1);
                    const o = offsets[i];
                    
                    const floatX = Math.sin(time + o.phase) * 0.05;
                    const floatY = Math.cos(time * 0.8 + o.phase) * 0.05;
                    
                    dummy.position.set(
                        o.x + floatX,
                        o.y + floatY,
                        o.z
                    );
                    
                    dummy.rotation.set(
                        time + i, 
                        time * 0.5 + i, 
                        0
                    );
                }
                
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            }
            mesh.instanceMatrix.needsUpdate = true;

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