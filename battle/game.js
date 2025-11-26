// ==========================================
// 1. OYUN VERİLERİ & HERO ÖZELLİKLERİ
// ==========================================

const heroName = localStorage.getItem("ps_selectedHero") || "Ceres";

// Hero Konfigürasyonu (Metinler ve Renkler)
const heroConfig = {
    Ceres: {
        title: "Solar Guardian",
        color: "#ffd700", // Altın Sarısı
        img: "../characters/ceres.png",
        quotes: {
            start: "Sun spears ready. Let's burn them.",
            correct: "Solar flare hit! Healing Earth.",
            wrong: "My flames are unstable! Watch out!",
            fail: "The sun... is setting..."
        }
    },
    Juno: {
        title: "Shadow Runner",
        color: "#b43fff", // Mor
        img: "../characters/juno.png",
        quotes: {
            start: "Shadows serve me. Awaiting targets.",
            correct: "Target frozen in the void.",
            wrong: "The shadows recoil! Backing up!",
            fail: "Darkness consumes us all..."
        }
    },
    Mars: {
        title: "Planet Brawler",
        color: "#ff3b3b", // Kırmızı/Neon
        img: "../characters/mars.png",
        quotes: {
            start: "Fists ready. Point me to the enemy.",
            correct: "SMASHED! Direct hit!",
            wrong: "Argh! The recoil shocked me!",
            fail: "I couldn't punch hard enough..."
        }
    },
    Venus: {
        title: "Orbital Muse",
        color: "#ff6bd6", // Pembe
        img: "../characters/venus.png",
        quotes: {
            start: "Harmony guides us. Stay focused.",
            correct: "A perfect wave of light.",
            wrong: "My aura is fading! No!",
            fail: "The melody ends here..."
        }
    }
};

const currentHero = heroConfig[heroName] || heroConfig["Ceres"];

// Oyun Durumu
let hp = 100;
let isGameOver = false;

// HTML Elemanları
const hpBar = document.getElementById("hp-bar");
const hpText = document.getElementById("hp-text");
const heroImg = document.getElementById("hero-img");
const heroBubble = document.getElementById("hero-bubble");
const questionText = document.getElementById("question-text");
const answersGrid = document.getElementById("answers-grid");
const gameOverScreen = document.getElementById("game-over-screen");

// ==========================================
// 2. SAHNE KURULUMU (INIT)
// ==========================================

// Hero Resmini Yükle
heroImg.src = currentHero.img;
speak(currentHero.quotes.start);

// Globe Kurulumu
const world = Globe()
    (document.getElementById("globe-container"))
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(true)
    .atmosphereColor(currentHero.color) // Hero renginde atmosfer
    .atmosphereAltitude(0.2)
    // Halka ve Işın Efektleri
    .ringColor(d => d.color)
    .ringMaxRadius(30)
    .ringPropagationSpeed(5)
    .ringRepeatPeriod(200);

world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.5;
world.controls().enableZoom = false;

// Ekran Boyutlandırma (Dünya boyutu)
function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.65;
    world.width(size);
    world.height(size);
}
resize();
window.addEventListener("resize", resize);

// ==========================================
// 3. STARFIELD (ARKA PLAN)
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
    // Sabit Yıldızlar
    ctx.fillStyle = "white";
    stars.forEach(s => {
        ctx.globalAlpha = s.alpha;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI*2); ctx.fill();
    });
    // Kayan Yıldız (Arada bir ekle)
    if(Math.random() < 0.02) {
        shootingStars.push({x: Math.random()*canvas.width, y: 0, speed: 5+Math.random()*5, len: 50+Math.random()*50});
    }
    // Kayan Yıldız Çiz
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    shootingStars.forEach((s, i) => {
        s.x -= s.speed; s.y += s.speed; // Çapraz kayma
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.len, s.y - s.len); ctx.stroke();
        if(s.y > canvas.height) shootingStars.splice(i, 1);
    });
    requestAnimationFrame(animateStars);
}
animateStars();

// ==========================================
// 4. SORU SİSTEMİ
// ==========================================
const questions = [
    { q: "Where is the Eiffel Tower?", ans: ["Paris", "London", "Berlin", "Rome"], cor: "Paris", lat: 48.85, lng: 2.35 },
    { q: "Capital of Japan?", ans: ["Tokyo", "Osaka", "Seoul", "Beijing"], cor: "Tokyo", lat: 35.68, lng: 139.69 },
    { q: "Amazon Rainforest?", ans: ["Brazil", "Canada", "Russia", "China"], cor: "Brazil", lat: -3.4, lng: -62 },
    { q: "Great Pyramids?", ans: ["Egypt", "Mexico", "Peru", "Sudan"], cor: "Egypt", lat: 29.97, lng: 31.13 },
    { q: "Which city is in USA?", ans: ["New York", "London", "Paris", "Dubai"], cor: "New York", lat: 40.71, lng: -74.00 }
];

let currentQ = null;

function loadQuestion() {
    if(isGameOver) return;
    
    // Dünyayı temizle
    world.ringsData([]);
    
    // Rastgele Soru
    currentQ = questions[Math.floor(Math.random() * questions.length)];
    
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
    
    // Butonları kilitle
    document.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);
    
    if(selected === currentQ.cor) {
        // --- DOĞRU CEVAP ---
        btn.classList.add("correct");
        speak(currentHero.quotes.correct);
        
        // Hero Animasyonu (Hafif Zıplama/Parlam)
        heroImg.style.transform = "scale(1.1) translateY(-10px)";
        setTimeout(() => heroImg.style.transform = "scale(1) translateY(0)", 300);

        // Dünya Efekti (Hero renginde iyileştirme ışını)
        // Burada basitçe doğru konuma Hero renginde bir halka koyuyoruz
        world.ringsData([{ lat: currentQ.lat, lng: currentQ.lng, color: currentHero.color, maxR: 15, propagationSpeed: 2, repeatPeriod: 500 }]);

        setTimeout(loadQuestion, 2000);
    } else {
        // --- YANLIŞ CEVAP ---
        btn.classList.add("wrong");
        speak(currentHero.quotes.wrong);
        
        // Hero Sarsılması (Shake)
        heroImg.classList.add("shake-hero");
        setTimeout(() => heroImg.classList.remove("shake-hero"), 500);
        
        // Ekran Sarsılması
        document.body.classList.add("shake-screen");
        setTimeout(() => document.body.classList.remove("shake-screen"), 500);

        // Hasar Ver
        updateHealth(-25);

        // Dünya Efekti (Kırmızı Patlama - Bomba)
        world.pointOfView({ lat: currentQ.lat, lng: currentQ.lng, altitude: 2 }, 1000); // Kamera dön
        
        // Kırmızı Halka
        setTimeout(() => {
            world.ringsData([{ lat: currentQ.lat, lng: currentQ.lng, color: "red", maxR: 40, propagationSpeed: 10, repeatPeriod: 100 }]);
        }, 800);

        setTimeout(loadQuestion, 2500);
    }
}

// ==========================================
// 5. HP & OYUN SONU
// ==========================================
function updateHealth(amount) {
    hp += amount;
    if(hp > 100) hp = 100;
    if(hp < 0) hp = 0;

    hpBar.style.width = hp + "%";
    hpText.textContent = `SHIELD INTEGRITY: ${hp}%`;

    // Renk Değişimi
    if(hp > 60) hpBar.style.background = "linear-gradient(90deg, #00ff00, #adff2f)"; // Yeşil
    else if(hp > 30) hpBar.style.background = "linear-gradient(90deg, #ffd700, #ff8c00)"; // Sarı
    else hpBar.style.background = "linear-gradient(90deg, #ff4500, #ff0000)"; // Kırmızı

    if(hp === 0) {
        gameOver();
    }
}

function gameOver() {
    isGameOver = true;
    speak(currentHero.quotes.fail);
    setTimeout(() => {
        gameOverScreen.classList.remove("hidden");
        world.atmosphereColor("red"); // Dünya ölüyor
    }, 1500);
}

// Konuşma Balonu Fonksiyonu
function speak(text) {
    heroBubble.textContent = text;
    heroBubble.classList.add("visible");
    // 3 saniye sonra balonu gizle (opsiyonel)
    // setTimeout(() => heroBubble.classList.remove("visible"), 3000);
}

// Başlat
loadQuestion();