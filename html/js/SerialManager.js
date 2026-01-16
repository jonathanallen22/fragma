// js/SerialManager.js

export class SerialManager {
    constructor(onDataCallback) {
        this.port = null;
        this.reader = null;
        this.keepReading = false;
        this.onData = onDataCallback; 
        this.buffer = "";
    }

    // Avvia il popup di connessione (deve essere scatenato da un click/tasto)
    async connect() {
        if (!("serial" in navigator)) {
            alert("Web Serial API non supportata. Usa Chrome o Edge.");
            return;
        }

        try {
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: 115200 }); // Deve essere 115200 come su Arduino
            console.log("🔌 Arduino Connesso con successo!");
            
            this.keepReading = true;
            this.readLoop();
        } catch (err) {
            console.error("Errore di connessione:", err);
        }
    }

    async readLoop() {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        try {
            while (this.keepReading) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                    this.buffer += value;
                    this.processBuffer();
                }
            }
        } catch (error) {
            console.error("Errore durante la lettura:", error);
        } finally {
            reader.releaseLock();
        }
    }

    processBuffer() {
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop(); 

        for (const line of lines) {
            try {
                const cleanLine = line.trim();
                if (cleanLine.startsWith('{') && cleanLine.endsWith('}')) {
                    const data = JSON.parse(cleanLine);
                    if (this.onData) this.onData(data);
                }
            } catch (e) {
                // Salta pacchetti JSON corrotti
            }
        }
    }
}