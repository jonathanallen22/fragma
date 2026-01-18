// js/LLMClient.js

export class LLMClient {
    constructor(endpoint = "http://localhost:5001/generate") {
        this.endpoint = endpoint;
        this.abortController = null;
    }

    /**
     * Lancia la generazione del testo.
     * @param {string} originalText - Il testo base della notizia.
     * @param {object} params - Oggetto { opacita, deumanizzazione, ... } (0-100)
     * @param {function} onChunk - Callback eseguita ogni volta che arriva un pezzo di testo.
     * @param {function} onStart - Callback eseguita quando inizia la connessione.
     * @param {function} onError - Callback per gestire errori.
     */
    async streamText(originalText, params, onChunk, onStart, onError) {
        // 1. KILLER SWITCH: Se c'è una generazione in corso, interrompila.
        if (this.abortController) {
            this.abortController.abort();
        }

        // 2. Prepara il nuovo controller
        this.abortController = new AbortController();
        const signal = this.abortController.signal;

        // 3. Mappatura Parametri (da 0-100 a 1-5 per il backend)
        const mappedParams = {
            p1: Math.ceil(params.opacita / 20) || 1,
            p2: Math.ceil(params.deumanizzazione / 20) || 1,
            p3: Math.ceil(params.emotivo / 20) || 1,
            p4: Math.ceil(params.moralizzazione / 20) || 1,
            p5: Math.ceil(params.assertivita / 20) || 1,
            p6: Math.ceil(params.polarizzazione / 20) || 1
        };

        try {
            if(onStart) onStart();

            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    testo: originalText, 
                    params: mappedParams 
                }),
                signal: signal
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                // Passa il pezzo di testo al frontend
                if(onChunk) onChunk(chunk);
            }

        } catch (err) {
            if (err.name === 'AbortError') {
                console.log("🚫 Gen interrotta per nuovi parametri.");
            } else {
                console.error("LLM Error:", err);
                if(onError) onError(err);
            }
        }
    }
}