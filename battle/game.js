// ==========================================
// 1. GAME DATA & CONFIG
// ==========================================

// Hero Görselleri
const heroImage = document.getElementById("hero-image");
const selectedHeroName = localStorage.getItem("ps_selectedHero") || "Ceres";
const heroImages = {
    Ceres: "../characters/ceres.png",
    Juno: "../characters/juno.png",
    Mars: "../characters/mars.png",
    Venus: "../characters/venus.png",
};
heroImage.src = heroImages[selectedHeroName] || heroImages["Ceres"];

// Oyun Durumu
let gameState = {
    hp: 100,
    score: 0,
    questionIndex: 0,
    correctCount: 0,
    difficulty: 'normal',
    isGameOver: false,
    timer: 15,
    maxTime: 15,
    timerInterval: null
};

// Düşman Tipleri
const enemyTypes = {
    meteor: { name: "METEOR SHOWER", theme: "ui-theme-meteor", color: "orange", bg: "radial-gradient(circle, #261100, #000)" },
    ship:   { name: "ALIEN CRUISER", theme: "ui-theme-ship",   color: "cyan",   bg: "radial-gradient(circle, #001526, #000)" },
    void:   { name: "VOID SERPENT",  theme: "ui-theme-void",   color: "purple", bg: "radial-gradient(circle, #1a0026, #000)" },
    brute:  { name: "ASTRA BRUTE",   theme: "ui-theme-brute",  color: "red",    bg: "radial-gradient(circle, #260000, #000)" }
};

// Soru Havuzu
const questionsPool = [
    { q: "Where is the Eiffel Tower?", ans: ["Paris", "London", "Berlin", "Rome"], cor: "Paris", lat: 48.85, lng: 2.35 },
    { q: "Capital of Japan?", ans: ["Tokyo", "Osaka", "Seoul", "Beijing"], cor: "Tokyo", lat: 35.68, lng: 139.69 },
    { q: "Largest Ocean?", ans: ["Pacific", "Atlantic", "Indian", "Arctic"], cor: "Pacific", lat: 0, lng: 160 },
    { q: "Pyramids location?", ans: ["Egypt", "Mexico", "Peru", "Sudan"], cor: "Egypt", lat: 29.97, lng: 31.13 },
    { q: "Amazon Rainforest?", ans: ["Brazil", "Canada", "Russia", "China"], cor: "Brazil", lat: -3.4, lng: -62 },
    { q: "Penguin habitat?", ans: ["Antarctica", "Alaska", "Greenland", "Norway"], cor: "Antarctica", lat: -75, lng: 0 },
    { q: "Capital of USA?", ans: ["Washington DC", "New York", "LA", "Chicago"], cor: "Washington DC", lat: 38.90, lng: -77.03 },
    { q: "Taj Mahal country?", ans: ["India", "Pakistan", "Nepal", "Iran"], cor: "India", lat: 27.17, lng: 78.04 },
    { q: "Sydney Opera House?", ans: ["Australia", "UK", "USA", "NZ"], cor: "Australia", lat: -33.85, lng: 151.21 },
    { q: "Colosseum city?", ans: ["Rome", "Milan", "Athens", "Venice"], cor: "Rome", lat: 41.89, lng: 12.49 }
];

let currentDeck = [];
let currentEnemy = null;

// ==========================================
// 2. WORLD SETUP (GLOBE.GL)
// ==========================================
const worldElement = document.getElementById("globe-container");
const world = Globe()
    (worldElement)
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(true)
    .atmosphereColor("#4444ff")
    .atmosphereAltitude(0.2)
    .ringColor(d => d.color)
    .ringMaxRadius(d => d.radius)
    .ringPropagationSpeed(d => d.speed)
    .ringRepeatPeriod(d => d.repeat);

world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.5;
world.controls().enableZoom = false;

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.45;
    world.width(size);
    world.height(size);
}
resize();
window.addEventListener("resize", resize);

// ==========================================
// 3. LOGIC FUNCTIONS
// ==========================================

// Hero Konuşmaları
function getHeroQuote() {
    const quotes = {
        Ceres: { start: ["Let's burn them nicely."], mid: ["Focus! They are getting hot."], end: ["ANSWER NOW!"] },
        Juno: { start: ["Too slow... kidding."], mid: ["Shadows are rising."], end: ["MOVE. NOW."] },
        Mars: { start: ["Let me punch it!"], mid: ["Hit harder!"], end: ["SMASH THE BUTTON!"] },
        Venus: { start: ["Let's bring harmony."], mid: ["The harmony is breaking."], end: ["SAVE US!"] }
    };
    const heroQ = quotes[selectedHeroName] || quotes["Ceres"];
    
    if (gameState.questionIndex < 3) return heroQ.start[0];
    if (gameState.questionIndex < 7) return heroQ.mid[0];
    return heroQ.end[0];
}

// Oyunu Başlat
function startGameLoop(difficulty) {
    console.log("Starting game with difficulty:", difficulty);
    gameState.difficulty = difficulty;

    // Menüyü Gizle
    const diffScreen = document.getElementById("difficulty-screen");
    diffScreen.style.opacity = "0";
    setTimeout(() => {
        diffScreen.style.display = "none";
    }, 500);

    // Soru Destesi Hazırla
    currentDeck = [...questionsPool].sort(() => 0.5 - Math.random()).slice(0, 10);
    
    loadNextQuestion();
}

function loadNextQuestion() {
    if (gameState.hp <= 0) { endGame(false); return; }
    if (gameState.questionIndex >= 10) { endGame(true); return; }

    const qData = currentDeck[gameState.questionIndex];
    gameState.questionIndex++;

    // Düşman ve Tema
    const types = Object.keys(enemyTypes);
    const rndType = types[Math.floor(Math.random() * types.length)];
    currentEnemy = enemyTypes[rndType];

    // UI Güncelleme
    const uiContainer = document.getElementById("battle-ui");
    uiContainer.className = ""; 
    uiContainer.classList.add(currentEnemy.theme);
    document.getElementById("dynamic-background").style.background = currentEnemy.bg;
    
    document.getElementById("enemy-name").textContent = currentEnemy.name;
    document.getElementById("enemy-name").style.color = currentEnemy.color;
    document.getElementById("hero-msg").textContent = getHeroQuote();

    // Soru Yerleştirme
    document.getElementById("question-text").textContent = qData.q;
    const ansGrid = document.getElementById("answers-grid");
    ansGrid.innerHTML = "";
    
    let answers = [...qData.ans].sort(() => Math.random() - 0.5);
    answers.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = ans;
        btn.onclick = () => handleAnswer(btn, ans, qData);
        ansGrid.appendChild(btn);
    });

    // Zamanlayıcı
    let timeLimit = 15 - (gameState.questionIndex * 0.8);
    if (timeLimit < 8) timeLimit = 8;
    startTimer(timeLimit, qData);
}

// Zamanlayıcı Mantığı
function startTimer(seconds, qData) {
    gameState.maxTime = seconds;
    gameState.timer = seconds;
    clearInterval(gameState.timerInterval);
    
    const circle = document.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;

    document.getElementById("timer-text").textContent = Math.floor(seconds);
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer -= 0.1;
        const percent = (gameState.timer / gameState.maxTime);
        const offset = circumference - (percent * circumference);
        circle.style.strokeDashoffset = offset;
        
        document.getElementById("timer-text").textContent = Math.ceil(gameState.timer);

        if (gameState.timer <= 0) {
            clearInterval(gameState.timerInterval);
            handleAnswer(null, null, qData);
        }
    }, 100);
}

// Cevap Kontrolü
function handleAnswer(btnElement, selectedAns, qData) {
    clearInterval(gameState.timerInterval);
    document.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);

    const isCorrect = selectedAns === qData.cor;

    if (isCorrect) {
        if(btnElement) btnElement.classList.add("correct");
        gameState.score += Math.ceil(gameState.timer * 10);
        gameState.correctCount++;
        document.getElementById("hero-msg").textContent = "Target Eliminated!";
        
        // Düşman Patlama (Yansıma Efekti)
        const flashColor = currentEnemy.color === 'orange' ? '#ffaa00' :
                           currentEnemy.color === 'cyan'   ? '#00ffff' :
                           currentEnemy.color === 'purple' ? '#ff00ff' : '#ff0000';
        
        world.atmosphereColor(flashColor);
        world.atmosphereAltitude(0.5);
        setTimeout(() => {
            world.atmosphereColor("#4444ff");
            world.atmosphereAltitude(0.2);
        }, 400);

        world.ringsData([{ lat: qData.lat, lng: qData.lng, color: flashColor, radius: 40, speed: 8, repeat: 100 }]);
        
        setTimeout(loadNextQuestion, 1500);
    } else {
        if(btnElement) btnElement.classList.add("wrong");
        // Doğruyu göster
        document.querySelectorAll(".answer-btn").forEach(b => {
            if (b.textContent === qData.cor) b.classList.add("correct");
        });

        // Hasar
        gameState.hp -= 20;
        if(gameState.hp < 0) gameState.hp = 0;
        document.getElementById("hp-bar").style.width = gameState.hp + "%";
        document.getElementById("hp-text").textContent = `SHIELD: ${gameState.hp}%`;

        if(gameState.hp < 30) document.getElementById("hp-bar").style.background = "red";

        // Sarsıntı
        document.body.style.transform = "translate(5px, 5px)";
        setTimeout(() => document.body.style.transform = "translate(0, 0)", 100);

        world.pointOfView({ lat: qData.lat, lng: qData.lng, altitude: 2.0 }, 500);
        setTimeout(() => {
            world.ringsData([{ lat: qData.lat, lng: qData.lng, color: 'red', radius: 30, speed: 5, repeat: 200 }]);
        }, 500);

        setTimeout(loadNextQuestion, 2500);
    }
}

function endGame(win) {
    const finalScreen = document.getElementById("final-screen");
    finalScreen.classList.remove("hidden");
    
    document.getElementById("final-score").textContent = gameState.score;
    document.getElementById("final-acc").textContent = Math.floor((gameState.correctCount / 10) * 100) + "%";

    const title = document.getElementById("final-title");
    const msg = document.getElementById("final-hero-msg");

    if (win) {
        title.textContent = "VICTORY";
        title.style.color = "#00ff00";
        msg.textContent = "Planet saved successfully.";
        let pulse = true;
        setInterval(() => {
            world.atmosphereColor(pulse ? "#00ff00" : "#ffffff");
            pulse = !pulse;
        }, 2000);
    } else {
        title.textContent = "DEFEAT";
        title.style.color = "red";
        msg.textContent = "The planet has fallen.";
        world.atmosphereColor("#ff0000");
    }
}

// ==========================================
// 4. INITIALIZATION (SAYFA YÜKLENİNCE)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("System Ready");

    const diffContainer = document.getElementById("difficulty-options");
    // ÖNEMLİ: Eski içerik varsa temizle (2 kere çıkmasını engeller)
    diffContainer.innerHTML = ""; 

    const diffOptions = [
        { id: 'easy', name: 'EASY', desc: 'Casual Orbit', class: 'diff-easy' },
        { id: 'normal', name: 'NORMAL', desc: 'Standard Galaxy', class: 'diff-normal' },
        { id: 'hard', name: 'HARD', desc: 'Solar Storm', class: 'diff-hard' },
        { id: 'chaos', name: 'CHAOS', desc: 'Void Mode', class: 'diff-chaos' }
    ];

    diffOptions.forEach(opt => {
        const div = document.createElement("div");
        div.className = `diff-card ${opt.class}`;
        div.innerHTML = `<h2>${opt.name}</h2><p>${opt.desc}</p>`;
        
        div.addEventListener("click", () => {
            startGameLoop(opt.id);
        });

        diffContainer.appendChild(div);
    });
});