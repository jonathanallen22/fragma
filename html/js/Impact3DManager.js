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
        
        // Doppio resize di sicurezza per evitare grafici neri
        setTimeout(() => this.handleResize(), 50);
        setTimeout(() => this.handleResize(), 500);
    }

    // Metodo chiamato dal main.js quando cambia la slide
    handleResize() {
        Object.keys(this.scenes).forEach(id => {
            const container = document.getElementById(id);
            const sceneData = this.scenes[id];
            
            if (container && sceneData && sceneData.renderer && sceneData.camera) {
                // Fallback a 500x400 se il container è ancora collassato
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

    // --- CHART 1: SURFACE ---
    createSurfaceChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;
        
        this.scenes[containerId] = { renderer, camera, frameId: null };
        camera.position.set(4, 3.5, 4);
        camera.lookAt(0, -0.5, 0);

        const axisMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.8 });
        const mkLine = (p1, p2) => scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1, p2]), axisMat));
        mkLine(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 2, 0));
        mkLine(new THREE.Vector3(-2.5, -0.5, 0), new THREE.Vector3(2.5, -0.5, 0));
        mkLine(new THREE.Vector3(0, -0.5, -2.5), new THREE.Vector3(0, -0.5, 2.5));

        this.addLabel(containerId, "LIVELLO INIBIZIONE", 50, 10);
        this.addLabel(containerId, "MODIFICA\nMESSAGGIO", 15, 80, 'left');
        this.addLabel(containerId, "SFORZO\nCOGNITIVO", 85, 80, 'right');
        
        const pAss = this.normalize(params.assertivita);
        const geometry = new THREE.PlaneGeometry(5, 5, 30, 30);
        const material = new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: true, transparent: true, opacity: 0.3 });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2; plane.position.y = -0.5;
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
            dot.position.set(0, Math.sin(0 - time) * amp - 0.5, 0);
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

        const axisMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const gridMat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.5 });
        
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-3.5, 2.5, 0), new THREE.Vector3(-3.5, -2.0, 0), new THREE.Vector3(3.8, -2.0, 0)
        ]), axisMat));

        const ticks = 6;
        const labels = ["2H", "4H", "8H", "12H", "1G", "1S"];
        for(let i=1; i<=ticks; i++) {
            const x = -3.5 + (i * (7.0 / ticks));
            scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -2.0, -0.1), new THREE.Vector3(x, 2.0, -0.1)]), gridMat));
            if(i < ticks) this.addLabel(containerId, labels[i-1], 5 + ((x + 3.5)/7.5)*90, 92, 'center', '0.7rem');
        }

        this.addLabel(containerId, "IMPRINTING COGNITIVO", 50, 5);
        this.addLabel(containerId, "TESTO\nMODIFICATO", 12, 42, 'right');
        this.addLabel(containerId, "TESTO\nORIGINALE", 12, 70, 'right');

        const group = new THREE.Group();
        const createCurve = (yBase, color, amplitude) => {
            const pts = [];
            for(let x=-3.5; x<=3.5; x+=0.1) pts.push(new THREE.Vector3(x, yBase, 0));
            return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: color }));
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

    // --- CHART 3: SPHERES (ISOMETRICA E ASSI FISSI) ---
    createCubeChart(containerId, params) {
        const result = this.createBaseScene(containerId);
        if(!result) return;
        const { scene, camera, renderer } = result;

        this.scenes[containerId] = { renderer, camera, frameId: null };
        
        // Vista Isometrica Pura (X=Y=Z)
        camera.position.set(5, 5, 5); 
        camera.lookAt(0, 0, 0);

        const axisMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, linewidth: 2 });
        const mkAx = (end) => scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), end]), axisMat));
        
        mkAx(new THREE.Vector3(0, 3, 0)); // Y (Alto)
        mkAx(new THREE.Vector3(3, 0, 0)); // X (Dx)
        mkAx(new THREE.Vector3(0, 0, 3)); // Z (Sx)

        // Etichette Bianche e Grandi
        this.addLabel(containerId, "AMIGDALA", 50, 5, 'center', '1.1rem', '#ffffff');    
        this.addLabel(containerId, "CORTECCIA\nPREFRONTALE", 90, 85, 'left', '1.1rem', '#ffffff'); 
        this.addLabel(containerId, "STRIATO\nVENTRALE", 10, 85, 'right', '1.1rem', '#ffffff'); 

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

        // Posizioni sugli assi
        const s1 = createBall(this.whiteColor, new THREE.Vector3(0, 1.8, 0)); // Y
        const s2 = createBall(0xaaaaaa, new THREE.Vector3(1.8, 0, 0));        // X
        const s3 = createBall(0xaaaaaa, new THREE.Vector3(0, 0, 1.8));        // Z

        const animate = () => {
            if (!document.getElementById(containerId) || !this.scenes[containerId]) return;
            const time = Date.now() * 0.002;
            
            // Pulsazione Sfere
            const sc1 = 0.6 + (pEmo * 0.8) + Math.sin(time * 3) * 0.05; s1.scale.set(sc1, sc1, sc1);
            if(pEmo > 0.5) s1.children[0].material.color.setHex(this.accentColor);
            
            const sc2 = 0.6 + (pLog * 0.7); s2.scale.set(sc2, sc2, sc2);
            const sc3 = 0.6 + (pBias * 0.7); s3.scale.set(sc3, sc3, sc3);

            renderer.render(scene, camera);
            if(this.scenes[containerId]) this.scenes[containerId].frameId = requestAnimationFrame(animate);
        };
        animate();
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
        label.style.fontSize = fontSize || '0.75rem';
        label.style.color = color || '#aaa'; 
        label.style.textShadow = '0px 0px 4px #000';
        container.appendChild(label);
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