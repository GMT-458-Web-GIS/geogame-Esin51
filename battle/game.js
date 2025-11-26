/* --------------------------------------------------------
   HERO
-------------------------------------------------------- */
const heroImage = document.getElementById("hero-image");
const selectedHero = localStorage.getItem("ps_selectedHero") || "Ceres";

const heroImages = {
    Ceres: "../characters/ceres.png",
    Juno: "../characters/juno.png",
    Mars: "../characters/mars.png",
    Venus: "../characters/venus.png"
};

if (heroImages[selectedHero]) {
    heroImage.src = heroImages[selectedHero];
}

/* --------------------------------------------------------
   GLOBE
-------------------------------------------------------- */
const globeContainer = document.getElementById("globe-container");

const world = Globe()(globeContainer)
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(true)
    .atmosphereColor("#3cf")
    .atmosphereAltitude(0.25)
    .autoRotate(true)
    .autoRotateSpeed(0.65);

function resizeGlobe() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.60;
    world.width(size);
    world.height(size);
}
resizeGlobe();
window.addEventListener("resize", resizeGlobe);

/* ARC + RING EFFECTS */
let arcData = [];
let ringData = [];

world
    .arcsData(arcData)
    .arcStartLat("startLat")
    .arcStartLng("startLng")
    .arcEndLat("endLat")
    .arcEndLng("endLng")
    .arcColor("color")
    .arcAltitude(0.25)
    .arcStroke(0.8)
    .arcDashLength(0.6)
    .arcDashGap(0.2)
    .arcDashAnimateTime(1200);

world
    .ringsData(ringData)
    .ringLat("lat")
    .ringLng("lng")
    .ringMaxRadius("maxRadius")
    .ringPropagationSpeed("propagationSpeed")
    .ringRepeatPeriod("repeatPeriod")
    .ringColor("color");

function addHitEffect(lat, lng) {
    const heroLat = 0;
    const heroLng = -150;

    const arc = {
        startLat: heroLat,
        startLng: heroLng,
        endLat: lat,
        endLng: lng,
        color: ["#ffcc55", "#ff2200"]
    };
    arcData.push(arc);
    world.arcsData(arcData);

    const ring = {
        lat,
        lng,
        maxRadius: 6,
        propagationSpeed: 2,
        repeatPeriod: 700,
        color: ["rgba(255,220,120,0.9)", "rgba(255,50,0,0.4)"]
    };
    ringData.push(ring);
    world.ringsData(ringData);

    setTimeout(() => {
        arcData = arcData.filter(a => a !== arc);
        world.arcsData(arcData);
    }, 1500);

    setTimeout(() => {
        ringData = ringData.filter(r => r !== ring);
        world.ringsData(ringData);
    }, 2000);
}

/* --------------------------------------------------------
   ZORLUK
-------------------------------------------------------- */
const mode = localStorage.getItem("ps_gameMode") || "normal";

let damage = 20;
let questionDelay = 1200;

if (mode === "easy") { damage = 10; questionDelay = 1600; }
if (mode === "hard") { damage = 30; questionDelay = 900; }

/* --------------------------------------------------------
   GAME STATE
-------------------------------------------------------- */
let health = 100;

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const healthBar = document.getElementById("health-bar");
const heroStatus = document.getElementById("hero-status");

/* --------------------------------------------------------
   SORULAR (kısaltılmış)
   — Dilersen 100 tane daha eklerim
-------------------------------------------------------- */
const questions = [
    {
        question: "Where is Turkey's capital located?",
        answers: ["Ankara", "Istanbul", "Izmir", "Bursa"],
        correct: "Ankara",
        lat: 39.93, lng: 32.86
    },
    {
        question: "What is the capital of Japan?",
        answers: ["Tokyo", "Seoul", "Beijing", "Osaka"],
        correct: "Tokyo",
        lat: 35.6895, lng: 139.6917
    },
    {
        question: "Penguins naturally live near which continent?",
        answers: ["Africa", "Antarctica", "Europe", "Asia"],
        correct: "Antarctica",
        lat: -75, lng: 0
    }
];

/* --------------------------------------------------------
   SORU YÜKLE
-------------------------------------------------------- */
function loadQuestion() {
    const q = questions[Math.floor(Math.random() * questions.length)];

    questionText.textContent = q.question;
    questionText.dataset.lat = q.lat;
    questionText.dataset.lng = q.lng;

    heroStatus.textContent = "Answer quickly!";
    heroStatus.style.color = "#00eaff";

    answersContainer.innerHTML = "";

    q.answers.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = ans;

        btn.onclick = () => checkAnswer(q, ans === q.correct);

        answersContainer.appendChild(btn);
    });
}

/* --------------------------------------------------------
   CEVAP KONTROL
-------------------------------------------------------- */
function checkAnswer(q, isCorrect) {

    if (!isCorrect) {
        health -= damage;
        if (health < 0) health = 0;

        healthBar.style.width = health + "%";

        if (health <= 60 && health > 30) healthBar.style.background = "yellow";
        if (health <= 30) healthBar.style.background = "red";

        heroStatus.textContent = "Wrong! Earth is hit!";
        heroStatus.style.color = "red";

        addHitEffect(q.lat, q.lng);

        heroImage.classList.add("hero-damage");
        setTimeout(() => heroImage.classList.remove("hero-damage"), 300);

        if (health <= 0) setTimeout(() => endGame(false), 900);
    } else {
        heroStatus.textContent = "Correct!";
        heroStatus.style.color = "#39ff39";
    }

    setTimeout(loadQuestion, questionDelay);
}

/* --------------------------------------------------------
   INIT
-------------------------------------------------------- */
setTimeout(loadQuestion, 1500);

/* --------------------------------------------------------
   GAME END
-------------------------------------------------------- */
function endGame(win) {
    alert(win ? "You win!" : "Earth has fallen...");
}

/* --------------------------------------------------------
   STARFIELD
-------------------------------------------------------- */
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    const DPR = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * DPR;
    canvas.height = window.innerHeight * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let stars = [];
function initStars() {
    stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5
        });
    }
}
initStars();

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";

    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(drawStars);
}
drawStars();
