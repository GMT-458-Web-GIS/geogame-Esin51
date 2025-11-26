// ==========================================
// 1. GAME CONFIG & STATE
// ==========================================
const heroImage = document.getElementById("hero-image");
const selectedHeroName = localStorage.getItem("ps_selectedHero") || "Ceres";
const heroImages = {
    Ceres: "../characters/ceres.png",
    Juno: "../characters/juno.png",
    Mars: "../characters/mars.png",
    Venus: "../characters/venus.png",
};
heroImage.src = heroImages[selectedHeroName] || heroImages["Ceres"];

// Hero Colors (Reflection için)
const heroColors = {
    Ceres: "#ffd447", // Gold
    Juno: "#b43fff",  // Purple
    Mars: "#ff3b3b",  // Red
    Venus: "#ff6bd6"  // Pink
};

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

// ==========================================
// 2. WORLD & RENDERING (Globe.gl)
// ==========================================
const worldElement = document.getElementById("globe-container");
const world = Globe()
    (worldElement)
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(true)
    .atmosphereColor("#4444ff") // Başlangıç rengi
    .atmosphereAltitude(0.2)
    // --- EFEKT KATMANLARI ---
    .ringColor(d => d.color)
    .ringMaxRadius(d => d.radius)
    .ringPropagationSpeed(d => d.speed)
    .ringRepeatPeriod(d => d.repeat);

// Controls
world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.5;
world.controls().enableZoom = false; // Zoom kilitli (sinematik)

function resize() {
    // Dünya boyutu: Ekranın %45'i (Seçim B)
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.45;
    world.width(size);
    world.height(size);
}
resize();
window.addEventListener("resize", resize);

// ==========================================
// 3. ENEMY & DATA SYSTEM
// ==========================================
const enemyTypes = {
    meteor: { name: "METEOR SHOWER", theme: "ui-theme-meteor", color: "orange", bg: "radial-gradient(circle, #261100, #000)" },
    ship:   { name: "ALIEN CRUISER", theme: "ui-theme-ship",   color: "cyan",   bg: "radial-gradient(circle, #001526, #000)" },
    void:   { name: "VOID SERPENT",  theme: "ui-theme-void",   color: "purple", bg: "radial-gradient(circle, #1a0026, #000)" },
    brute:  { name: "ASTRA BRUTE",   theme: "ui-theme-brute",  color: "red",    bg: "radial-gradient(circle, #260000, #000)" }
};

// Soru Havuzu (Örnek 10 soru - normalde daha geniş olur)
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
// 4. HERO DIALOGUE SYSTEM (PHASES)
// ==========================================
function getHeroQuote(phase, type) {
    // Basit bir faz sistemi
    // Phase 1: Funny, Phase 2: Serious, Phase 3: Panic/Command
    const quotes = {
        Ceres: {
            start: ["Hehe, warm-up time.", "Let's burn them nicely."],
            mid:   ["Focus! They are getting hot.", "Sun flares ready."],
            end:   ["ANSWER NOW!", "EARTH IS BURNING! REACT!"]
        },
        Juno: {
            start: ["Too slow... kidding.", "Cute little aliens."],
            mid:   ["Shadows are rising.", "Stay sharp."],
            end:   ["MOVE. NOW.", "DON'T HESITATE!"]
        },
        Mars: {
            start: ["Let me punch it!", "Tiny ships. Hah!"],
            mid:   ["Hit harder! Answer faster!", "They keep coming!"],
            end:   ["SMASH THE BUTTON!", "NO! DEFEND THE PLANET!"]
        },
        Venus: {
            start: ["Aww, look at them.", "Let's bring harmony."],
            mid:   ["Please focus.", "The harmony is breaking."],
            end:   ["SAVE US!", "THE LIGHT IS FADING!"]
        }
    };

    const heroQ = quotes[selectedHeroName] || quotes["Ceres"];
    if (gameState.questionIndex < 3) return heroQ.start[Math.floor(Math.random() * heroQ.start.length)];
    if (gameState.questionIndex < 7) return heroQ.mid[Math.floor(Math.random() * heroQ.mid.length)];
    return heroQ.end[Math.floor(Math.random() * heroQ.end.length)];
}

// ==========================================
// 5. UI & DIFFICULTY LOGIC
// ==========================================

// Difficulty Screen Init
const diffOptions = [
    { id: 'easy', name: 'EASY', desc: 'Casual Orbit', class: 'diff-easy' },
    { id: 'normal', name: 'NORMAL', desc: 'Standard Galaxy', class: 'diff-normal' },
    { id: 'hard', name: 'HARD', desc: 'Solar Storm', class: 'diff-hard' },
    { id: 'chaos', name: 'CHAOS', desc: 'Void Mode', class: 'diff-chaos' }
];

const diffContainer = document.getElementById("difficulty-options");
diffOptions.forEach(opt => {
    const div = document.createElement("div");
    div.className = `diff-card ${opt.class}`;
    div.innerHTML = `<h2>${opt.name}</h2><p>${opt.desc}</p>`;
    div.onclick = () => startGame(opt.id);
    diffContainer.appendChild(div);
});

function startGame(difficulty) {
    gameState.difficulty = difficulty;
    document.getElementById("difficulty-screen").classList.add("hidden");
    
    // Soru destesini hazırla (Randomize)
    currentDeck = [...questionsPool].sort(() => 0.5 - Math.random()).slice(0, 10);
    
    loadNextQuestion();
}

// ==========================================
// 6. BATTLE LOOP
// ==========================================
const uiContainer = document.getElementById("battle-ui");
const bgContainer = document.getElementById("dynamic-background");
const bubbleMsg = document.getElementById("hero-msg");
const bubbleBox = document.getElementById("hero-bubble");
const hpBar = document.getElementById("hp-bar");
const hpText = document.getElementById("hp-text");

function loadNextQuestion() {
    if (gameState.hp <= 0) { endGame(false); return; }
    if (gameState.questionIndex >= 10) { endGame(true); return; }

    const qData = currentDeck[gameState.questionIndex];
    gameState.questionIndex++;

    // 1. DÜŞMAN BELİRLE (Random)
    const types = Object.keys(enemyTypes);
    const rndType = types[Math.floor(Math.random() * types.length)];
    currentEnemy = enemyTypes[rndType];

    // 2. UI TEMASINI GÜNCELLE (Seçim E: Dinamik UI)
    uiContainer.className = ""; // Reset
    uiContainer.classList.add(currentEnemy.theme);
    
    bubbleBox.parentElement.className = ""; // Parent container reset if needed
    // Bubble border color CSS handles via theme class on body or container.
    // Burada battle-ui class'ını body'e de verebiliriz global etki için:
    document.body.className = currentEnemy.theme;

    // 3. ARKA PLAN & EFEKT
    bgContainer.style.background = currentEnemy.bg;
    document.getElementById("enemy-name").textContent = currentEnemy.name;
    document.getElementById("enemy-name").style.color = currentEnemy.color;

    // 4. HERO KONUŞSUN
    bubbleMsg.textContent = getHeroQuote();

    // 5. SORUYU YAZ
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

    // 6. ZAMANI BAŞLAT (Her soruda azalıyor)
    // 15sn'den başlayıp 8sn'ye kadar düşüyor
    let timeLimit = 15 - (gameState.questionIndex * 0.8);
    if (timeLimit < 8) timeLimit = 8;
    startTimer(timeLimit, qData);
}

// ==========================================
// 7. TIMER & ANSWER HANDLING
// ==========================================
const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

function startTimer(seconds, qData) {
    gameState.maxTime = seconds;
    gameState.timer = seconds;
    clearInterval(gameState.timerInterval);
    
    document.getElementById("timer-text").textContent = Math.floor(seconds);
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer -= 0.1;
        const percent = (gameState.timer / gameState.maxTime) * 100;
        setProgress(percent);
        document.getElementById("timer-text").textContent = Math.ceil(gameState.timer);

        if (gameState.timer <= 0) {
            clearInterval(gameState.timerInterval);
            handleAnswer(null, null, qData); // Time's up
        }
    }, 100);
}

function handleAnswer(btnElement, selectedAns, qData) {
    clearInterval(gameState.timerInterval);
    
    // Disable buttons
    document.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);

    const isCorrect = selectedAns === qData.cor;

    if (isCorrect) {
        if(btnElement) btnElement.classList.add("correct");
        gameState.score += Math.ceil(gameState.timer * 10); // Hız bonusu
        gameState.correctCount++;
        bubbleMsg.textContent = "Target Eliminated!";
        
        // DÜŞMAN PATLAMA EFEKTİ & REFLECTION (Seçim A)
        triggerEnemyDeath(qData.lat, qData.lng, currentEnemy.color);
        
        setTimeout(loadNextQuestion, 1500);
    } else {
        if(btnElement) btnElement.classList.add("wrong");
        // Doğruyu göster
        document.querySelectorAll(".answer-btn").forEach(b => {
            if (b.textContent === qData.cor) b.classList.add("correct");
        });

        // HASAR & SARSINTI
        takeDamage(20);
        bubbleMsg.textContent = "IMPACT CONFIRMED! DAMAGE CRITICAL!";
        
        // Dünya'da patlama (Bomba efekti)
        world.pointOfView({ lat: qData.lat, lng: qData.lng, altitude: 2.0 }, 500);
        setTimeout(() => {
            world.ringsData([{ lat: qData.lat, lng: qData.lng, color: 'red', radius: 30, speed: 5, repeat: 200 }]);
        }, 500);

        setTimeout(loadNextQuestion, 2500);
    }
}

// ==========================================
// 8. DAMAGE & REFLECTION (VISUALS)
// ==========================================

function triggerEnemyDeath(lat, lng, colorName) {
    // 1. REFLECTION PULSE: Dünya rengini düşman rengine çakıyoruz
    // Globe.gl atmosphereColor kullanarak yapıyoruz
    const flashColor = colorName === 'orange' ? '#ffaa00' :
                       colorName === 'cyan'   ? '#00ffff' :
                       colorName === 'purple' ? '#ff00ff' : '#ff0000';
    
    // Anlık Parlama
    world.atmosphereColor(flashColor);
    world.atmosphereAltitude(0.5); // Yükselt

    // 300ms sonra normale dön (Pulse Effect)
    setTimeout(() => {
        world.atmosphereColor("#4444ff"); // Default
        world.atmosphereAltitude(0.2);
    }, 400);

    // 2. Patlama Halkası (Düşman renginde)
    world.ringsData([{ lat: lat, lng: lng, color: flashColor, radius: 40, speed: 8, repeat: 100 }]);
}

function takeDamage(amount) {
    gameState.hp -= amount;
    if(gameState.hp < 0) gameState.hp = 0;
    
    // UI Güncelle
    hpBar.style.width = gameState.hp + "%";
    hpText.textContent = `SHIELD: ${gameState.hp}%`;
    
    // Renk değişimi
    if(gameState.hp < 30) {
        hpBar.style.background = "red";
        hpBar.style.boxShadow = "0 0 20px red";
        // Screen Shake
        document.body.style.transform = "translate(5px, 5px)";
        setTimeout(() => document.body.style.transform = "translate(-5px, -5px)", 50);
        setTimeout(() => document.body.style.transform = "translate(0, 0)", 100);
    } else if (gameState.hp < 60) {
        hpBar.style.background = "orange";
    }
}

// ==========================================
// 9. GAME OVER / VICTORY
// ==========================================
function endGame(win) {
    const finalScreen = document.getElementById("final-screen");
    const finalTitle = document.getElementById("final-title");
    const finalMsg = document.getElementById("final-hero-msg");
    const finalScore = document.getElementById("final-score");
    const finalAcc = document.getElementById("final-acc");

    finalScreen.classList.remove("hidden");
    
    finalScore.textContent = gameState.score;
    const acc = Math.floor((gameState.correctCount / 10) * 100);
    finalAcc.textContent = acc + "%";

    if (win) {
        // VICTORY (Seçim E: Hero Aura + Glow)
        finalTitle.textContent = "VICTORY";
        finalTitle.style.color = "#00ff00";
        finalTitle.style.textShadow = "0 0 30px #00ff00";
        finalMsg.textContent = selectedHeroName === "Mars" ? "EARTH IS SAFE. I SMASHED THEM GOOD." : "Harmony restored. Well done.";
        
        // VICTORY ANIMATION: Green Pulse
        let pulse = true;
        setInterval(() => {
            world.atmosphereColor(pulse ? "#00ff00" : "#ffffff");
            pulse = !pulse;
        }, 2000);

    } else {
        // DEFEAT (Seçim B: Burning World)
        finalTitle.textContent = "DEFEAT";
        finalTitle.style.color = "red";
        finalTitle.style.textShadow = "0 0 30px red";
        finalMsg.textContent = "We failed... The planet has fallen.";
        
        // DEFEAT ANIMATION: Red Atmosphere
        world.atmosphereColor("#ff0000");
        world.atmosphereAltitude(0.6);
        world.ringsData([]); // Efektleri temizle
    }
}