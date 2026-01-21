// js/SceneManager.js

export class SceneManager {
    constructor() {
        this.scenes = {
            intro: document.getElementById('scene-intro'),
            instructions: document.getElementById('scene-instructions'),
            carousel: document.getElementById('scene-carousel'),
            'pre-edit': document.getElementById('scene-pre-edit'),
            edit: document.getElementById('scene-edit'),
            processing: document.getElementById('scene-processing'),
            impact: document.getElementById('scene-impact')
        };
        
        this.globalHeader = document.getElementById('global-header');
        this.currentScene = 'intro';
        
        // Setup iniziale
        Object.values(this.scenes).forEach(el => {
            if(el) {
                gsap.set(el, { autoAlpha: 0, scale: 1.1 });
                el.classList.add('hidden');
                el.classList.remove('active');
            }
        });
        
        // Intro attiva
        if(this.scenes.intro) {
            this.scenes.intro.classList.remove('hidden');
            gsap.set(this.scenes.intro, { autoAlpha: 1, scale: 1 });
            this.scenes.intro.classList.add('active');
        }
    }

    goTo(sceneName) {
        if (!this.scenes[sceneName]) {
            console.warn(`⚠️ SceneManager: Scena '${sceneName}' non trovata.`);
            return;
        }

        console.log(`🎬 MOVING TO: ${sceneName}`);

        const oldScene = this.scenes[this.currentScene];
        const newScene = this.scenes[sceneName];

        // HEADER
        if (this.globalHeader) {
            if (sceneName !== 'intro') {
                this.globalHeader.classList.remove('hidden');
                gsap.to(this.globalHeader, { autoAlpha: 1, duration: 0.5 });
            } else {
                gsap.to(this.globalHeader, { autoAlpha: 0, duration: 0.5 });
            }
        }

        // SEQUENZA TRANSIZIONE
        const tl = gsap.timeline({
            onComplete: () => {
                this.currentScene = sceneName;
                if (sceneName === 'instructions') this.playInstructionsSequence();
            }
        });

        if(oldScene) {
            tl.to(oldScene, { 
                autoAlpha: 0, scale: 0.95, duration: 0.8, ease: "power3.inOut",
                onComplete: () => {
                    oldScene.classList.remove('active');
                    oldScene.classList.add('hidden');
                }
            });
        }

        if(newScene) {
            tl.fromTo(newScene, 
                { autoAlpha: 0, scale: 1.1 },
                { 
                    autoAlpha: 1, scale: 1, duration: 1, ease: "power3.out",
                    onStart: () => {
                        newScene.classList.remove('hidden');
                        newScene.classList.add('active');
                    }
                }, "-=0.5"
            );
        }
    }

    // --- NUOVO METODO: Resetta animazione istruzioni ---
    resetInstructionsState() {
        gsap.killTweensOf(".instruct-line");
        gsap.killTweensOf(".line-1");
        gsap.killTweensOf(".line-2");
        gsap.killTweensOf(".line-3");
        gsap.set(".instruct-line", { autoAlpha: 0, y: 50 });
    }

    playInstructionsSequence() {
        this.resetInstructionsState(); // Reset prima di partire
        const tl = gsap.timeline({
            delay: 0.5,
            onComplete: () => setTimeout(() => this.goTo('carousel'), 2000)
        });
        tl.to(".line-1", { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" })
          .to(".line-2", { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.3")
          .to(".line-3", { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.3");
    }
}