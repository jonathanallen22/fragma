import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class MiniTotem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
        this.loadModel();
        this.animate();
        
        window.addEventListener('resize', this.onResize.bind(this));
    }

    init() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        
        // CAMERA: La allontano un po' (zoom out) per evitare tagli ai bordi
        // I valori (width / -1.5) aumentano il campo visivo rispetto a prima
        this.camera = new THREE.OrthographicCamera(
            this.width / -1.8, this.width / 1.8,
            this.height / 1.8, this.height / -1.8,
            0.1, 1000
        );
        
        // Posizione standard
        this.camera.position.set(0, 10, 100);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);

        // LUCI
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xFF4824, 2, 200);
        pointLight.position.set(20, 20, 20);
        this.scene.add(pointLight);
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            'assets/totem.glb',
            (gltf) => {
                this.model = gltf.scene;
                
                // 1. SCALA: Lo rimpicciolisco leggermente per sicurezza (da 12 a 10)
                this.model.scale.set(50, 50, 50);

                // 2. POSIZIONE: Lo alzo! Prima era -10, ora 0 o +5 per non tagliarlo sotto
                this.model.position.y = -5; 

                // 3. ROTAZIONE INIZIALE: Dritto perfetto
                this.model.rotation.set(0, 0, 0);

                // MATERIALE
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshStandardMaterial({
                            color: 0xFF4824,
                            emissive: 0xFF4824,
                            emissiveIntensity: 0.4,
                            wireframe: true,
                        });
                    }
                });

                this.scene.add(this.model);
            }
        );
    }

    onResize() {
        if (!this.container) return;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        // Aggiorna proporzioni camera per non deformare
        this.camera.left = this.width / -1.8;
        this.camera.right = this.width / 1.8;
        this.camera.top = this.height / 1.8;
        this.camera.bottom = this.height / -1.8;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (this.model) {
            // --- LOGICA "DRITTO" ---
            // Ruota SOLO su Y (come una trottola)
            this.model.rotation.y += 0.005;

            // BLOCCO GLI ALTRI ASSI:
            // Anche se il modello 3D originale fosse storto, questo lo raddrizza ogni frame
            this.model.rotation.x = 0; 
            this.model.rotation.z = 0; 
        }

        this.renderer.render(this.scene, this.camera);
    }
}