// ==========================================
// 1. OYUN AYARLARI VE HERO VERİSİ
// ==========================================
const heroName = localStorage.getItem("ps_selectedHero") || "Ceres";
const difficulty = localStorage.getItem("ps_difficulty") || "normal";

// Hero Konfigürasyonu
const heroConfig = {
    Ceres: {
        color: "#ffd700", // Sarı
        img: "../characters/ceres.png",
        quotes: {
            start: "Shields up. Let's protect the core.",
            correct: "Solar repair engaged.",
            wrong: "Shield holding... but barely!",
            fail: "The sun... is setting..."
        }
    },
    Juno: {
        color: "#b43fff", // Mor
        img: "../characters/juno.png",
        quotes: {
            start: "Time is relative. Make it count.",
            correct: "Time extended.",
            wrong: "Slipping through the void...",
            fail: "Time has run out..."
        }
    },
    Mars: {
        color: "#ff3b3b", // Kırmızı
        img: "../characters/mars.png",
        quotes: {
            start: "Let's smash some high scores!",
            correct: "CRITICAL HIT!",
            wrong: "Missed! The recoil hurts!",
            fail: "Knocked out..."
        }
    },
    Venus: {
        color: "#ff6bd6", // Pembe
        img: "../characters/venus.png",
        quotes: {
            start: "Let's heal the world.",
            correct: "Harmony restored.",
            wrong: "Focus! The aura is breaking!",
            fail: "The melody fades..."
        }
    }
};

const currentHero = heroConfig[heroName] || heroConfig["Ceres"];

// ==========================================
// 2. SES SENTEZLEYİCİSİ (Kod ile Ses Üretimi)
// ==========================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSynthSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'correct') { // Başarı Sesi
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } 
    else if (type === 'wrong') { // Hata Sesi
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    }
    else if (type === 'explosion') { // Patlama
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    }
    else if (type === 'win') { // Zafer Melodisi
        playTone(523.25, 'sine', 0.1, 0);   
        playTone(659.25, 'sine', 0.1, 0.1); 
        playTone(783.99, 'sine', 0.4, 0.2); 
    }
}
function playTone(freq, type, duration, delay) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + duration);
    osc.start(audioCtx.currentTime + delay); osc.stop(audioCtx.currentTime + delay + duration);
}

// ==========================================
// 3. OYUN DEĞİŞKENLERİ
// ==========================================
let hp = 100;
let score = 0;
let isGameOver = false;
let currentQ = null;
let timer = 100;
let timerInterval = null;

// Hero Pasif Değişkenleri
let marsStreak = 0;
let junoCounter = 0;
let ceresShieldUsed = false;

// HTML Elementleri
const hpBar = document.getElementById("hp-bar");
const hpText = document.getElementById("hp-text");
const heroImg = document.getElementById("hero-img");
const heroBubble = document.getElementById("hero-bubble");
const questionText = document.getElementById("question-text");
const answersGrid = document.getElementById("answers-grid");
const finalScreen = document.getElementById("final-screen");
const timerText = document.getElementById("timer-text");
const circle = document.querySelector('.progress-ring__circle');

// Init Hero
heroImg.src = currentHero.img;
speak(currentHero.quotes.start);

// ==========================================
// 4. GLOBE INIT (DÜNYA)
// ==========================================
const world = Globe()
    (document.getElementById("globe-container"))
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
// 5. STARFIELD (ARKA PLAN)
// ==========================================
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
let stars = [], shootingStars = [];

function initStars() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for(let i=0; i<200; i++) {
        stars.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, size: Math.random()*1.5, alpha: Math.random()});
    }
}
initStars();
window.addEventListener("resize", initStars);

function animateStars() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = "white";
    stars.forEach(s => {
        ctx.globalAlpha = s.alpha;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI*2); ctx.fill();
    });
    if(Math.random() < 0.02) shootingStars.push({x: Math.random()*canvas.width, y: 0, speed: 5+Math.random()*5, len: 50+Math.random()*50});
    ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1;
    shootingStars.forEach((s, i) => {
        s.x -= s.speed; s.y += s.speed;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.len, s.y - s.len); ctx.stroke();
        if(s.y > canvas.height) shootingStars.splice(i, 1);
    });
    requestAnimationFrame(animateStars);
}
animateStars();

// ==========================================
// 6. SORULAR (COĞRAFYA)
// ==========================================
const allQuestions = {
    easy: [
        { q: "Where is Turkey's capital?", ans: ["Ankara", "Istanbul", "Izmir", "Bursa"], cor: "Ankara", lat: 39.93, lng: 32.86 },
        { q: "Capital of France?", ans: ["Paris", "Lyon", "Nice", "Marseille"], cor: "Paris", lat: 48.85, lng: 2.35 },
        { q: "Capital of Japan?", ans: ["Tokyo", "Osaka", "Seoul", "Beijing"], cor: "Tokyo", lat: 35.68, lng: 139.69 },
        { q: "Where is Sahara Desert?", ans: ["Africa", "Asia", "Australia", "USA"], cor: "Africa", lat: 23, lng: 13 },
        { q: "Carnival is in?", ans: ["Brazil", "Spain", "Mexico", "Italy"], cor: "Brazil", lat: -22.90, lng: -43.17 }
    ],
    normal: [
        { q: "Sushi is from?", ans: ["Japan", "China", "Korea", "Thai"], cor: "Japan", lat: 35.68, lng: 139.69 },
        { q: "Tango is from?", ans: ["Argentina", "Brazil", "Spain", "Cuba"], cor: "Argentina", lat: -34.60, lng: -58.38 },
        { q: "Cairo is in?", ans: ["Egypt", "Sudan", "Iraq", "Iran"], cor: "Egypt", lat: 30.04, lng: 31.23 },
        { q: "Istanbul connects?", ans: ["Europe & Asia", "Asia & Africa", "EU & US", "None"], cor: "Europe & Asia", lat: 41.00, lng: 28.97 }
    ],
    hard: [
        { q: "Amazon Rainforest?", ans: ["Brazil", "Peru", "Colombia", "Chile"], cor: "Brazil", lat: -3.4, lng: -62 },
        { q: "Galapagos Islands?", ans: ["Ecuador", "Chile", "Peru", "Panama"], cor: "Ecuador", lat: -0.95, lng: -90.96 },
        { q: "Angkor Wat?", ans: ["Cambodia", "Thailand", "Vietnam", "Laos"], cor: "Cambodia", lat: 13.41, lng: 103.86 },
        { q: "Mount Etna?", ans: ["Italy", "Greece", "Turkey", "Spain"], cor: "Italy", lat: 37.75, lng: 14.99 }
    ]
};
const gameDeck = allQuestions[difficulty] || allQuestions["normal"];

// ==========================================
// 7. OYUN LOOP
// ==========================================
function loadQuestion() {
    if(isGameOver) return;
    world.ringsData([]); 
    world.atmosphereColor(currentHero.color);
    world.pointOfView({ altitude: 2.5 }, 1000); // Kamerayı düzelt

    currentQ = gameDeck[Math.floor(Math.random() * gameDeck.length)];
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
        playSynthSound('correct');
        
        // 1. Base Score
        let earned = 100;

        // 2. HERO PASSIVES (CORRECT)
        if(heroName === "Mars") {
            earned = Math.floor(earned * 1.15);
            marsStreak++;
            if(marsStreak >= 3) {
                earned *= 2; 
                speak("CRITICAL HIT! 2X POINTS!");
                marsStreak = 0;
            } else speak(currentHero.quotes.correct);
        }
        else if(heroName === "Venus") {
            updateHealth(3);
            speak("Earth is healing...");
        }
        else if(heroName === "Juno") {
            junoCounter++;
            if(junoCounter >= 3) {
                timer += 3; 
                speak("Time extended!");
                junoCounter = 0;
            } else speak(currentHero.quotes.correct);
        }
        else speak(currentHero.quotes.correct);

        score += earned;
        
        // YEŞİL EFEKT (İyileşme)
        world.atmosphereColor("#39ff39");
        world.ringsData([{ lat: currentQ.lat, lng: currentQ.lng, color: "#39ff39", maxR: 20, speed: 2, repeat: 200 }]);
        
        setTimeout(loadQuestion, 1500);

    } else {
        // --- YANLIŞ ---
        btn.classList.add("wrong");
        playSynthSound('wrong');
        playSynthSound('explosion');
        if(heroName === "Mars") marsStreak = 0;

        // 1. Base Damage
        let dmg = 20;

        // 2. HERO PASSIVES (WRONG)
        if(heroName === "Ceres") {
            dmg *= 0.75;
            speak("Shield absorbed impact!");
        } else if(heroName === "Venus" && hp < 40) {
            dmg *= 0.90;
            speak(currentHero.quotes.wrong);
        } else {
            speak(currentHero.quotes.wrong);
        }

        updateHealth(-dmg);
        
        // CERES ACİL KALKAN
        if(heroName === "Ceres" && hp < 30 && !ceresShieldUsed) {
            hp += 15; ceresShieldUsed = true;
            speak("SOLAR SHIELD ACTIVATED!");
        }

        // KIRMIZI EFEKT (Hasar)
        heroImg.classList.add("shake-hero");
        setTimeout(() => heroImg.classList.remove("shake-hero"), 500);
        document.body.classList.add("shake-screen");
        setTimeout(() => document.body.classList.remove("shake-screen"), 500);

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

// TIMER
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
    document.getElementById("final-hero-msg").textContent = win ? "Mission Accomplished!" : currentHero.quotes.fail;
    document.getElementById("final-title").textContent = win ? "VICTORY" : "GAME OVER";
    if(win) playSynthSound('win'); else playSynthSound('explosion');
}

loadQuestion();