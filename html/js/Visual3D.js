// js/Visual3D.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Visual3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // 2. SETUP SCENA
        this.scene = new THREE.Scene();
        // Nebbia nera per sfumare il modello in fondo
        this.scene.fog = new THREE.FogExp2(0x000000, 0.02);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 15; 
        this.camera.position.y = 0;  

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.model = null;
        this.totemGroup = null;

    // ... (codice precedente) ...
        
        // Luci: Potenziamole per il metallo
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Più bassa, ambiente cupo
        this.scene.add(ambientLight);

        // Luce principale (Sole arancio/rosso)
        const dirLight = new THREE.DirectionalLight(0xff4824, 5); // Molto intensa
        dirLight.position.set(5, 5, 10);
        this.scene.add(dirLight);

        // LUCE DI RIMBALZO (Blu/Ciano) - Fondamentale per vedere i volumi al buio
        const fillLight = new THREE.PointLight(0x0088ff, 3, 50);
        fillLight.position.set(-5, 0, 5);
        this.scene.add(fillLight);

        // ...
        // 3. AVVIA CARICAMENTO
        this.loadModel();
        
        // 4. EVENTI
        window.addEventListener('resize', () => this.onResize());
        
        // 5. LOOP
        this.animate();
    }
loadModel() {
        const loader = new GLTFLoader();

        this.totemGroup = new THREE.Group();
        this.scene.add(this.totemGroup);

        // Posizione iniziale
        this.totemGroup.rotation.z = 0;  
        this.totemGroup.rotation.x = Math.PI / 8  ; 

        loader.load('assets/totem.glb', (gltf) => {
            this.model = gltf.scene;

            this.model.traverse((child) => {
                if (child.isMesh) {
                    
                    // A. IL CORPO: METALLO SCURO (Non nero piatto!)
                    // MeshStandardMaterial reagisce alla luce.
                    // Colore 0x111111 (Grigio scurissimo) invece di 0x000000
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x111111,    
                        metalness: 1.0,     // È metallo puro
                        roughness: 0.2,     // Abbastanza lucido (riflette le luci)
                        polygonOffset: true,
                        polygonOffsetFactor: 1,
                        polygonOffsetUnits: 1
                    });

                    // B. I BORDI: PIÙ DETTAGLI
                    // Abbassiamo la soglia da 15 a 1.
                    // "1" significa: "Disegna una riga su qualsiasi cambio di angolazione".
                    // Questo farà apparire TUTTI i dettagli interni del logo.
                    const edgesGeometry = new THREE.EdgesGeometry(child.geometry, 1); 
                    
                    // Usiamo un colore Ciano o Arancio per farli "accendere", il bianco è moscio.
                    // Qui ho messo un Ciano Elettrico (0x00ffff) che spacca col nero.
                    // Se lo vuoi arancio metti: 0xff4824
                    const edgesMaterial = new THREE.LineBasicMaterial({ 
                        color: 0xffffff, // O prova 0x00ffff (Ciano)
                        linewidth: 1     // Nota: su Chrome Windows le linee restano spesso a 1px per limiti del browser
                    });
                    
                    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
                    child.add(edges);
                }
            });

            const scale = 1.4; 
            this.model.scale.set(scale, scale, scale);
            this.model.position.y = -2.3; 

            this.totemGroup.add(this.model);
            console.log("🗿 Totem caricato: Metallo + Full Edges");

        }, undefined, (error) => {
            console.error("Errore modello:", error);
        });
    }
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.model) {
            this.model.rotation.y += 0.002; 
        }

        this.renderer.render(this.scene, this.camera);
    }
}