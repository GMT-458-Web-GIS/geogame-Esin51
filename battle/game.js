// ==========================================
// 1. OYUN AYARLARI & HERO
// ==========================================
const heroName = localStorage.getItem("ps_selectedHero") || "Ceres";
const difficulty = localStorage.getItem("ps_difficulty") || "normal";

const heroConfig = {
    Ceres: { color: "#ffd700", img: "../characters/ceres.png", quotes: { start: "Shields UP. Protect the core!", correct: "Target destroyed. Healing Earth.", wrong: "Shield breach! I can't hold it!", fail: "The light... is gone..." } },
    Juno: { color: "#b43fff", img: "../characters/juno.png", quotes: { start: "Time bends to my will.", correct: "Frozen in time.", wrong: "Timeline destabilized!", fail: "Lost in the void..." } },
    Mars: { color: "#ff3b3b", img: "../characters/mars.png", quotes: { start: "Ready to crush them!", correct: "ANNIHILATED!", wrong: "Argh! They hit back hard!", fail: "I... failed..." } },
    Venus: { color: "#ff6bd6", img: "../characters/venus.png", quotes: { start: "Harmony is our strength.", correct: "Beautifully done.", wrong: "The aura is shattering!", fail: "Silence falls..." } }
};
const currentHero = heroConfig[heroName] || heroConfig["Ceres"];

// ==========================================
// 2. KORKUNÇ & SİNEMATİK SES MOTORU (AudioContext)
// ==========================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSoundEffect(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;

    // 1. DOĞRU CEVAP (Sci-Fi Power Up)
    if (type === 'correct') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1); // Hızlı yükseliş
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.4);
    } 
    // 2. PATLAMA / YANLIŞ (Derin Boom + Gürültü)
    else if (type === 'explosion') {
        // A. Derin Darbe (Low Frequency)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(20, t + 0.8); // Boom etkisi
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.8);

        // B. Gürültü (Noise - Korkunç etki)
        const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 saniye
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        noise.connect(noiseGain); noiseGain.connect(audioCtx.destination);
        noise.start(t);
    }
    // 3. OYUN BİTTİ (Karanlık Drone)
    else if (type === 'gameover') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, t); // Çok kalın
        osc.frequency.linearRampToValueAtTime(30, t + 2);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.linearRampToValueAtTime(0, t + 2);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 2);
    }
}

// ==========================================
// 3. 30 SORU VERİTABANI (TAMAMI)
// ==========================================
const allQuestions = {
    easy: [
        { q: "Where is Turkey's capital?", ans: ["Ankara", "Istanbul", "Izmir", "Bursa"], cor: "Ankara", lat: 39.93, lng: 32.86 },
        { q: "Capital of France?", ans: ["Paris", "Lyon", "Nice", "Marseille"], cor: "Paris", lat: 48.85, lng: 2.35 },
        { q: "Capital of Japan?", ans: ["Tokyo", "Kyoto", "Osaka", "Seoul"], cor: "Tokyo", lat: 35.68, lng: 139.69 },
        { q: "Penguins live where?", ans: ["Antarctica", "Africa", "Europe", "Asia"], cor: "Antarctica", lat: -75, lng: 0 },
        { q: "Sahara Desert is in?", ans: ["Africa", "Asia", "Australia", "USA"], cor: "Africa", lat: 23, lng: 13 },
        { q: "Carnival country?", ans: ["Brazil", "Spain", "Mexico", "Portugal"], cor: "Brazil", lat: -22.90, lng: -43.17 },
        { q: "Pyramids of Giza?", ans: ["Egypt", "Morocco", "Iran", "Sudan"], cor: "Egypt", lat: 29.97, lng: 31.13 },
        { q: "Great Barrier Reef?", ans: ["Australia", "Indonesia", "India", "Fiji"], cor: "Australia", lat: -18.28, lng: 147.69 },
        { q: "Ocean on USA East Coast?", ans: ["Atlantic", "Pacific", "Indian", "Arctic"], cor: "Atlantic", lat: 35, lng: -65 },
        { q: "New York location?", ans: ["USA", "UK", "Canada", "Mexico"], cor: "USA", lat: 40.71, lng: -74.00 }
    ],
    normal: [
        { q: "Sushi origin?", ans: ["Japan", "China", "Korea", "Thai"], cor: "Japan", lat: 35.68, lng: 139.69 },
        { q: "Tango origin?", ans: ["Argentina", "Brazil", "Spain", "Cuba"], cor: "Argentina", lat: -34.60, lng: -58.38 },
        { q: "Paella origin?", ans: ["Spain", "Italy", "Greece", "France"], cor: "Spain", lat: 39.46, lng: -0.37 },
        { q: "Kimchi origin?", ans: ["South Korea", "Japan", "China", "Vietnam"], cor: "South Korea", lat: 37.56, lng: 126.97 },
        { q: "Baklava is linked to?", ans: ["Turkey", "Brazil", "Norway", "Canada"], cor: "Turkey", lat: 41.00, lng: 28.97 },
        { q: "Flamenco dance?", ans: ["Spain", "Italy", "Portugal", "France"], cor: "Spain", lat: 37.38, lng: -5.98 },
        { q: "Cairo location?", ans: ["Egypt", "Sudan", "Iraq", "Iran"], cor: "Egypt", lat: 30.04, lng: 31.23 },
        { q: "Duduk instrument?", ans: ["Armenia", "Finland", "Chile", "India"], cor: "Armenia", lat: 40.17, lng: 44.49 },
        { q: "Hula dance?", ans: ["Hawaii (USA)", "Japan", "NZ", "Fiji"], cor: "Hawaii (USA)", lat: 21.30, lng: -157.85 },
        { q: "Istanbul continents?", ans: ["Europe & Asia", "Asia & Africa", "EU & US", "None"], cor: "Europe & Asia", lat: 41.00, lng: 28.97 }
    ],
    hard: [
        { q: "Amazon Rainforest?", ans: ["Brazil", "Peru", "Colombia", "Chile"], cor: "Brazil", lat: -3.4, lng: -62 },
        { q: "Siberian Tundra?", ans: ["Russia", "Canada", "Greenland", "Norway"], cor: "Russia", lat: 66.5, lng: 90 },
        { q: "Galapagos Islands?", ans: ["Ecuador", "Chile", "Peru", "Panama"], cor: "Ecuador", lat: -0.95, lng: -90.96 },
        { q: "Serengeti?", ans: ["Tanzania", "Kenya", "South Africa", "Namibia"], cor: "Tanzania", lat: -2.33, lng: 34.83 },
        { q: "Khoomei singing?", ans: ["Mongolia", "Germany", "Pakistan", "Spain"], cor: "Mongolia", lat: 47.88, lng: 106.90 },
        { q: "Haka dance?", ans: ["New Zealand", "Indonesia", "Fiji", "S.Africa"], cor: "New Zealand", lat: -41.28, lng: 174.77 },
        { q: "Angkor Wat?", ans: ["Cambodia", "Thailand", "Vietnam", "Laos"], cor: "Cambodia", lat: 13.41, lng: 103.86 },
        { q: "Reggae origin?", ans: ["Jamaica", "Cuba", "DR", "Puerto Rico"], cor: "Jamaica", lat: 17.97, lng: -76.79 },
        { q: "Mount Etna?", ans: ["Italy", "Greece", "Turkey", "Spain"], cor: "Italy", lat: 37.75, lng: 14.99 },
        { q: "Kora instrument?", ans: ["West Africa", "Scandinavia", "Asia", "America"], cor: "West Africa", lat: 13.45, lng: -16.57 }
    ]
};

// Desteden soruyu silmek için kopya oluşturuyoruz
let gameDeck = [...(allQuestions[difficulty] || allQuestions["normal"])];

// ==========================================
// 4. OYUN DEĞİŞKENLERİ
// ==========================================
let hp = 100;
let score = 0;
let isGameOver = false;
let currentQ = null;
let timer = 100;
let timerInterval = null;

// Hero Pasifleri
let marsStreak = 0;
let junoCounter = 0;
let ceresShieldUsed = false;

// Elementler
const hpBar = document.getElementById("hp-bar");
const hpText = document.getElementById("hp-text");
const heroImg = document.getElementById("hero-img");
const heroBubble = document.getElementById("hero-bubble");
const questionText = document.getElementById("question-text");
const answersGrid = document.getElementById("answers-grid");
const finalScreen = document.getElementById("final-screen");
const timerText = document.getElementById("timer-text");
const circle = document.querySelector('.progress-ring__circle');
const globeContainer = document.getElementById("globe-container");

// Init Hero
heroImg.src = currentHero.img;
speak(currentHero.quotes.start);

// ==========================================
// 5. GLOBE INIT
// ==========================================
const world = Globe()
    (globeContainer)
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(true)
    .atmosphereColor(currentHero.color) 
    .atmosphereAltitude(0.2)
    .ringColor(d => d.color)
    .ringMaxRadius(d => d.maxR)
    .ringPropagationSpeed(d => d.speed)
    .ringRepeatPeriod(d => d.repeat);

world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.5;
world.controls().enableZoom = false;

// Resize
function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.65;
    world.width(size);
    world.height(size);
}
resize();
window.addEventListener("resize", resize);

// ==========================================
// 6. OYUN DÖNGÜSÜ
// ==========================================
function loadQuestion() {
    if(isGameOver) return;
    
    // Soru bitti mi? (Victory)
    if(gameDeck.length === 0) {
        gameOver(true);
        return;
    }

    world.ringsData([]); 
    world.atmosphereColor(currentHero.color);
    world.pointOfView({ altitude: 2.5 }, 1000); // Kamerayı geri çek

    // Rastgele seç ve desteden çıkar (NO REPEAT)
    const randomIndex = Math.floor(Math.random() * gameDeck.length);
    currentQ = gameDeck[randomIndex];
    gameDeck.splice(randomIndex, 1); // Sil

    questionText.textContent = currentQ.q;
    answersGrid.innerHTML = "";
    
    let opts = [...currentQ.ans].sort(() => Math.random() - 0.5);
    opts.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(opt, btn);
        answersGrid.appendChild(btn);
    });
}

function checkAnswer(selected, btn) {
    if(isGameOver) return;
    document.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);
    
    if(selected === currentQ.cor) {
        // --- DOĞRU ---
        btn.classList.add("correct");
        playSoundEffect('correct');
        
        let earned = 100;
        // Hero Passives
        if(heroName === "Mars") {
            earned = Math.floor(earned * 1.15);
            marsStreak++;
            if(marsStreak >= 3) { earned *= 2; speak("CRITICAL HIT! 2X POINTS!"); marsStreak = 0; } 
            else speak(currentHero.quotes.correct);
        }
        else if(heroName === "Venus") { updateHealth(3); speak("Earth is healing..."); }
        else if(heroName === "Juno") {
            junoCounter++;
            if(junoCounter >= 3) { timer += 3; speak("Time extended!"); junoCounter = 0; } 
            else speak(currentHero.quotes.correct);
        }
        else speak(currentHero.quotes.correct);

        score += earned;
        updateHealth(0); // Update UI
        
        // Yeşil Efekt
        world.atmosphereColor("#39ff39");
        world.ringsData([{ lat: currentQ.lat, lng: currentQ.lng, color: "#39ff39", maxR: 20, speed: 2, repeat: 200 }]);
        
        setTimeout(loadQuestion, 1500);

    } else {
        // --- YANLIŞ ---
        btn.classList.add("wrong");
        playSoundEffect('explosion');
        if(heroName === "Mars") marsStreak = 0;

        let dmg = 20;
        // Hero Passives
        if(heroName === "Ceres") { dmg *= 0.75; speak("Shield absorbed impact!"); } 
        else if(heroName === "Venus" && hp < 40) { dmg *= 0.90; speak(currentHero.quotes.wrong); } 
        else { speak(currentHero.quotes.wrong); }

        updateHealth(-dmg);
        
        // Ceres Emergency
        if(heroName === "Ceres" && hp < 30 && !ceresShieldUsed) {
            hp += 15; ceresShieldUsed = true; speak("SOLAR SHIELD ACTIVATED!");
        }

        // DÜNYA SARSINTISI (FIXED ANCHOR)
        globeContainer.classList.add("shake-globe");
        setTimeout(() => globeContainer.classList.remove("shake-globe"), 500);
        document.body.classList.add("shake-screen");
        setTimeout(() => document.body.classList.remove("shake-screen"), 500);

        // Kırmızı Efekt
        world.atmosphereColor("red");
        world.pointOfView({ lat: currentQ.lat, lng: currentQ.lng, altitude: 2 }, 800);
        setTimeout(() => {
            world.ringsData([{ lat: currentQ.lat, lng: currentQ.lng, color: "red", maxR: 40, speed: 8, repeat: 100 }]);
        }, 800);

        let delay = (heroName === "Juno") ? 1500 : 2500;
        setTimeout(loadQuestion, delay);
    }
}

function updateHealth(amount) {
    hp += amount;
    if(hp > 100) hp = 100;
    hpBar.style.width = hp + "%";
    hpText.textContent = `SHIELD: ${Math.floor(hp)}%`;

    if(hp > 60) hpBar.style.background = "linear-gradient(90deg, #00ff00, #adff2f)";
    else if(hp > 30) hpBar.style.background = "linear-gradient(90deg, #ffd700, #ff8c00)";
    else hpBar.style.background = "linear-gradient(90deg, #ff4500, #ff0000)";

    if(hp <= 0) { hp = 0; gameOver(false); }
}

function speak(text) {
    heroBubble.textContent = text;
    heroBubble.classList.add("visible");
}

// Timer
const circumference = circle.r.baseVal.value * 2 * Math.PI;
circle.style.strokeDasharray = `${circumference} ${circumference}`;

function startTimer() {
    timerInterval = setInterval(() => {
        if(isGameOver) return;
        timer--;
        timerText.textContent = timer;
        const offset = circumference - (timer / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        if(timer <= 0) gameOver(false);
    }, 1000);
}
startTimer();

function gameOver(win) {
    isGameOver = true;
    clearInterval(timerInterval);
    finalScreen.classList.remove("hidden");
    document.getElementById("final-score").textContent = score;
    document.getElementById("final-hero-msg").textContent = win ? "Planet Secured. Well done." : currentHero.quotes.fail;
    document.getElementById("final-title").textContent = win ? "VICTORY" : "GAME OVER";
    document.getElementById("final-title").style.color = win ? "#39ff39" : "red";
    playSoundEffect('gameover');
}

loadQuestion();