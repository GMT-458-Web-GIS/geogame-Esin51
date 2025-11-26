// ==========================================
// 1. OYUN AYARLARI & HERO
// ==========================================
const heroName = localStorage.getItem("ps_selectedHero") || "Ceres";
const difficulty = localStorage.getItem("ps_difficulty") || "normal";

// ... (HeroConfig ve Replikler AYNI KALACAK - Kısaltıyorum) ...
const heroConfig = {
    Ceres: { color: "#ffd700", img: "../characters/ceres.png", quotes: { start: "Stay behind me. I will guard this world.", correct: "A solid strike. The Earth stands firm.", wrong: "My shield weakens... answer carefully.", combo: "You grow stronger with each truth. Continue.", critical: "My shield... is fading. Protect what remains.", win: "The world endures—because of you.", fail: "I... couldn't hold it together. Forgive me." } },
    Juno: { color: "#b43fff", img: "../characters/juno.png", quotes: { start: "Time bends for those who know how to use it. Follow my lead.", correct: "Calculated. Precise. Just as planned.", wrong: "Slow down... and breathe. We'll bend time back.", combo: "Momentum is ours. Don't lose it.", critical: "Time is slipping... but not out of my control yet.", win: "All timelines converge to victory. Well played.", fail: "Even time couldn't save this world... this time." } },
    Mars: { color: "#ff3b3b", img: "../characters/mars.png", quotes: { start: "Alright soldier. We hit hard, we hit fast. Let's show 'em.", correct: "BOOM! That's what I'm talkin' about!", wrong: "Tch— focus! We don't miss twice.", combo: "Ayy, that's a HIT STREAK! Keep smashing!", critical: "Earth is bleeding. We end this NOW!", win: "YEAH! That's a clean knockout!", fail: "...Damn. They broke the planet. My bad." } },
    Venus: { color: "#ff6bd6", img: "../characters/venus.png", quotes: { start: "Let harmony guide you. The universe listens.", correct: "Beautifully done. A perfect choice.", wrong: "It's alright... Every mistake is another lesson.", combo: "Your flow is radiant. Keep it going.", critical: "The Earth is hurting... Let me soothe it—but hurry.", win: "Peace restored. You've done well.", fail: "Even in endings... beauty remains." } }
};
const currentHero = heroConfig[heroName] || heroConfig["Ceres"];

// ==========================================
// 2. YENİ "KORKU/GERİLİM" SES MOTORU (Sinematik)
// ==========================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Gürültü Oluşturucu (Patlamalar için)
function createNoiseBuffer() {
    const bufferSize = audioCtx.sampleRate * 1.5; // 1.5 saniye gürültü
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
}
const noiseBuffer = createNoiseBuffer();

function playSoundEffect(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;

    if (type === 'correct') { 
        // Mistik/Derin Başarı Sesi
        const osc1 = audioCtx.createOscillator(); osc1.type = 'sine'; osc1.frequency.setValueAtTime(300, t);
        const osc2 = audioCtx.createOscillator(); osc2.type = 'triangle'; osc2.frequency.setValueAtTime(600, t);
        const gain = audioCtx.createGain();
        
        osc1.connect(gain); osc2.connect(gain); gain.connect(audioCtx.destination);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5); // Uzun sönümlenme (reverb hissi)

        osc1.start(t); osc1.stop(t + 1.5);
        osc2.start(t); osc2.stop(t + 1.5);
    } 
    else if (type === 'explosion') {
        // DERİN DARBE + METALİK GÜRÜLTÜ (Korkunç)
        // 1. Sub-Bass Darbe (Boom)
        const subOsc = audioCtx.createOscillator(); subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(80, t);
        subOsc.frequency.exponentialRampToValueAtTime(10, t + 1.0);
        const subGain = audioCtx.createGain();
        subGain.gain.setValueAtTime(1.0, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        subOsc.connect(subGain); subGain.connect(audioCtx.destination);
        subOsc.start(t); subOsc.stop(t + 1.0);

        // 2. Gürültü ve Çarpışma (Impact)
        const noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass'; noiseFilter.frequency.setValueAtTime(1000, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.8, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(audioCtx.destination);
        noise.start(t);
    }
    else if (type === 'gameover') {
        // Karanlık Drone (Gerilim)
        const osc = audioCtx.createOscillator(); osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40, t); // Çok kalın
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.setValueAtTime(200, t);
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 2);
        
        osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
        osc.start(t);
    }
}

// ... (Soru Listesi ve Değişkenler AYNI KALACAK) ...
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
let gameDeck = [...(allQuestions[difficulty] || allQuestions["normal"])];

let hp = 100;
let score = 0;
let isGameOver = false;
let currentQ = null;
let timer = 100;
let timerInterval = null;
let streakCount = 0;
let ceresShieldUsed = false;
let junoCounter = 0;

const hpBar = document.getElementById("hp-bar");
const hpText = document.getElementById("hp-text");
const heroImg = document.getElementById("hero-image");
const heroBubble = document.getElementById("hero-bubble");
const questionText = document.getElementById("question-text");
const answersGrid = document.getElementById("answers-grid");
const finalScreen = document.getElementById("final-screen");
const timerText = document.getElementById("timer-text");
const circle = document.querySelector('.progress-ring__circle');
const globeContainer = document.getElementById("globe-container");

heroImg.src = currentHero.img;
speak(currentHero.quotes.start);

// ... (Globe Init ve Resize AYNI KALACAK) ...
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

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.65;
    world.width(size);
    world.height(size);
}
resize();
window.addEventListener("resize", resize);

// ==========================================
// 6. OYUN DÖNGÜSÜ (GÜNCELLENDİ)
// ==========================================
function loadQuestion() {
    if(isGameOver) return;
    if(gameDeck.length === 0) { gameOver(true); return; }

    world.ringsData([]); 
    world.atmosphereColor(currentHero.color);
    world.pointOfView({ altitude: 2.5 }, 1000);

    const randomIndex = Math.floor(Math.random() * gameDeck.length);
    currentQ = gameDeck[randomIndex];
    gameDeck.splice(randomIndex, 1); 

    questionText.textContent = "Scanning the globe..."; 
    answersGrid.innerHTML = ""; 

    setTimeout(() => {
        questionText.textContent = currentQ.q;
        let opts = [...currentQ.ans].sort(() => Math.random() - 0.5);
        opts.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "answer-btn";
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(opt, btn);
            answersGrid.appendChild(btn);
        });
    }, 800);
}

function checkAnswer(selected, btn) {
    if(isGameOver) return;
    document.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);
    
    if(selected === currentQ.cor) {
        // --- DOĞRU ---
        btn.classList.add("correct");
        playSoundEffect('correct');
        
        let earned = 100;
        streakCount++;

        if(heroName === "Mars") earned = Math.floor(earned * 1.15);
        if(heroName === "Venus") updateHealth(3);
        if(heroName === "Juno") { junoCounter++; if(junoCounter >= 3) { timer += 3; junoCounter = 0; } }

        if(streakCount === 3) {
            speak(currentHero.quotes.combo);
            if(heroName === "Mars") earned *= 2; 
        } else {
            speak(currentHero.quotes.correct);
        }

        score += earned;
        updateHealth(0); 
        
        world.atmosphereColor("#39ff39");
        world.ringsData([{ lat: currentQ.lat, lng: currentQ.lng, color: "#39ff39", maxR: 20, speed: 2, repeat: 200 }]);
        
        setTimeout(loadQuestion, 1500);

    } else {
        // --- YANLIŞ (KORKU EFEKTLERİ) ---
        btn.classList.add("wrong");
        playSoundEffect('explosion'); // YENİ KORKUNÇ SES
        
        streakCount = 0; junoCounter = 0;
        let dmg = 20;
        if(heroName === "Ceres") dmg *= 0.75; 
        if(heroName === "Venus" && hp < 40) dmg *= 0.90; 

        updateHealth(-dmg);
        
        if(hp < 30 && hp > 0) speak(currentHero.quotes.critical);
        else speak(currentHero.quotes.wrong);

        // YENİ: DÜNYA HASAR FLASH ANİMASYONU
        globeContainer.classList.add("globe-damaged");
        setTimeout(() => globeContainer.classList.remove("globe-damaged"), 600);

        // MEVCUT SARSINTILAR
        globeContainer.classList.add("shake-globe");
        setTimeout(() => globeContainer.classList.remove("shake-globe"), 600);
        document.body.classList.add("shake-screen");
        setTimeout(() => document.body.classList.remove("shake-screen"), 600);

        // KIRMIZI ATMOSFER VE HALKA
        world.atmosphereColor("red");
        world.pointOfView({ lat: currentQ.lat, lng: currentQ.lng, altitude: 2 }, 800);
        setTimeout(() => {
            world.ringsData([{ lat: currentQ.lat, lng: currentQ.lng, color: "red", maxR: 50, speed: 10, repeat: 50 }]);
        }, 800);

        let delay = (heroName === "Juno") ? 1500 : 2500;
        setTimeout(loadQuestion, delay);
    }
}

// ... (UpdateHealth, Speak, Timer, GameOver AYNI KALACAK) ...
function updateHealth(amount) {
    hp += amount; if(hp > 100) hp = 100;
    hpBar.style.width = hp + "%"; hpText.textContent = `SHIELD: ${Math.floor(hp)}%`;
    if(heroName === "Ceres" && hp < 30 && !ceresShieldUsed) { hp += 15; ceresShieldUsed = true; }
    if(hp > 60) hpBar.style.background = "linear-gradient(90deg, #00ff00, #adff2f)";
    else if(hp > 30) hpBar.style.background = "linear-gradient(90deg, #ffd700, #ff8c00)";
    else hpBar.style.background = "linear-gradient(90deg, #ff4500, #ff0000)";
    if(hp <= 0) { hp = 0; gameOver(false); }
}
function speak(text) { heroBubble.textContent = text; heroBubble.classList.add("visible"); }
const circumference = circle.r.baseVal.value * 2 * Math.PI;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
function startTimer() {
    timerInterval = setInterval(() => {
        if(isGameOver) return; timer--; timerText.textContent = timer;
        const offset = circumference - (timer / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        if(timer <= 0) gameOver(false);
    }, 1000);
}
startTimer();
function gameOver(win) {
    isGameOver = true; clearInterval(timerInterval);
    finalScreen.classList.remove("hidden");
    document.getElementById("final-score").textContent = score;
    const endQuote = win ? currentHero.quotes.win : currentHero.quotes.fail;
    document.getElementById("final-hero-msg").textContent = `"${endQuote}"`;
    document.getElementById("final-title").textContent = win ? "VICTORY" : "GAME OVER";
    document.getElementById("final-title").style.color = win ? "#39ff39" : "red";
    playSoundEffect('gameover');
}
loadQuestion();