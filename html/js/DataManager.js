export const CARDS_DATA = [
    // --- ESISTENTI --- 
    {
        id: 0,
        template: "corriere",
        source: "Corriere della Sera",
        date: "2 Dicembre 2025",
        author: "Di Alessia Conzonato",
        headline: "Reddito reale, Italia e Grecia sono gli unici due paesi Ue dove le famiglie sono più povere di vent’anni fa",
        body: "L’Italia e la Grecia sono gli unici due Paesi dell’Unione europea dove il reddito reale delle famiglie è diminuito negli ultimi venti anni: rispettivamente a -4% e -5% nel periodo considerato dalle stime di Eurostat.",
        logo: "assets/images/corriere.svg"
    },
    {
        id: 1,
        template: "sky",
        source: " SkyTG24",
        date: "07 DICEMBRE 2025",
        author: "REDAZIONE ESTERI",
        headline: "Gaza, Netanyahu: Ci sono opportunità di pace, presto fase 2. Herzog a New York",
        body: "Hamas si dice pronto a discutere di 'congelare o immagazzinare' il suo arsenale di armi come parte del cessate il fuoco con Israele, afferma un alto funzionario. Il premier israeliano Benjamin Netanyahu ha riferito che si aprono opportunità.",
        logo: "assets/images/sky.svg"
    },
    {
        id: 2,
        source: "BBC News",
        template: "twitter",
        date: "09 DICEMBRE 2025",
        author: "Donald Trump",
        headline: "L'Intelligenza Artificiale supera il test di Turing in diretta globale",
        body: "Un evento senza precedenti ha scosso la comunità scientifica ieri sera quando il modello Syntax-F1 ha conversato per 4 ore con una giuria di filosofi senza essere distinto da un umano, segnando una nuova era.",
        logo: "assets/images/x.svg"
    },
    
    // --- NUOVE NOTIZIE (FICTIONAL / FUTURISTIC) ---
    {
        id: 3,
        source: "The New York Times",
        date: "12 DICEMBRE 2025",
        author: "BY SARAH JENKINS",
        headline: "Global Water Crisis: UN Announces Level 4 Emergency Protocol",
        body: "Following the driest quarter in recorded history, the UN has activated the 'Blue Shield' protocol. Water rationing will act as a temporary measure in G20 nations starting next Monday.",
        logo: "assets/images/logo_nyt.svg"
    },
    {
        id: 4,
        source: "Le Monde",
        date: "14 DICEMBRE 2025",
        author: "PAR PIERRE DUBOIS",
        headline: "Blackout Energetico: L'Europa ripensa il nucleare dopo il crollo della rete centrale",
        body: "Il grande blackout di ieri notte ha lasciato 40 milioni di persone al buio. Bruxelles convoca un summit d'urgenza per riattivare i reattori di quarta generazione fermi dal 2023.",
        logo: "assets/images/logo_lemonde.svg"
    },
    {
        id: 5,
        source: "Bloomberg",
        date: "15 DICEMBRE 2025",
        author: "MARKETS DESK",
        headline: "Crypto Crash: Bitcoin drops 45% following new Quantum Decryption rumors",
        body: "Fear spreads across financial markets as a leaked paper suggests standard SHA-256 encryption might be vulnerable to the new 'Q-System' processors developed in Shenzhen.",
        logo: "assets/images/logo_bloomberg.svg"
    },
    {
        id: 6,
        source: "Al Jazeera",
        date: "18 DICEMBRE 2025",
        author: "MIDDLE EAST MONITOR",
        headline: "New Borders: The treaty of Cairo redraws the map of North Africa",
        body: "A historic signature today in Egypt puts an end to the decade-long resource dispute. Three new autonomous economic zones have been established along the Mediterranean coast.",
        logo: "assets/images/logo_aljazeera.svg"
    },
    {
        id: 7,
        source: "Wired",
        date: "20 DICEMBRE 2025",
        author: "BY KEVIN KELLY",
        headline: "Neural Link 2.0 approved for human trials: The end of screens?",
        body: "The FDA has given the green light. The new interface promises direct retina projection, effectively making smartphones obsolete within the next five years.",
        logo: "assets/images/logo_wired.svg"
    },
    {
        id: 8,
        source: "La Repubblica",
        date: "21 DICEMBRE 2025",
        author: "DI MARCO TRAVAGLIO",
        headline: "Scandalo Dati Biometrici: Violati i server della Sanità Pubblica",
        body: "Il garante della privacy ha bloccato l'accesso ai fascicoli sanitari elettronici dopo che un gruppo di hacker ha messo in vendita le impronte genetiche di 12 milioni di cittadini.",
        logo: "assets/images/logo_repubblica.svg"
    },
    {
        id: 9,
        source: "CNN",
        date: "22 DICEMBRE 2025",
        author: "POLITICS TEAM",
        headline: "Mars Colony 'Ares-1' goes silent: NASA investigates signal loss",
        body: "It has been 48 hours since the last transmission from the Ares-1 outpost. While NASA downplays the event as a 'solar interference', independent observatories report anomaly flashes.",
        logo: "assets/images/logo_cnn.svg"
    },
    {
        id: 10,
        source: "Financial Times",
        date: "23 DICEMBRE 2025",
        author: "ECONOMICS",
        headline: "Universal Basic Income: Germany launches the largest pilot program in history",
        body: "Starting January 1st, 5 million citizens will receive the 'Citizens Dividend'. Critics argue it will spike inflation, while supporters see it as the only answer to AI automation.",
        logo: "assets/images/logo_ft.svg"
    },
    {
        id: 11,
        source: "The Washington Post",
        date: "24 DICEMBRE 2025",
        author: "DEMOCRACY DIES IN DARKNESS",
        headline: "Deepfake Election: Senate passes emergency bill to watermark all video content",
        body: "In a rare bipartisan vote, Congress has mandated cryptographic watermarks for all media content to combat the wave of hyper-realistic AI propaganda generated videos.",
        logo: "assets/images/logo_wapo.svg"
    },
    {
        id: 12,
        source: "National Geographic",
        date: "25 DICEMBRE 2025",
        author: "SCIENCE",
        headline: "The Great Reef Revival: New coral species adapts to warmer oceans",
        body: "A glimmer of hope from the Pacific. Marine biologists have discovered a heat-resistant coral strain that is repopulating the bleached sections of the Great Barrier Reef at record speeds.",
        logo: "assets/images/logo_natgeo.svg"
    }
];

export function getCardById(id) {
    return CARDS_DATA.find(card => card.id === id);
}