/* --------------------------------------------------------
   HERO LOAD
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
   GLOBE.GL SETUP
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
    .autoRotateSpeed(0.45);

function resizeGlobe() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.55;
    world.width(size);
    world.height(size);
}
resizeGlobe();
window.addEventListener("resize", resizeGlobe);

/* ARC + RING data */
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

/* ADD HIT EFFECT */
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
   MODE
-------------------------------------------------------- */
const mode = localStorage.getItem("ps_gameMode") || "normal";

let damage = 20;
let questionDelay = 1200;

if (mode === "easy") {
    damage = 10;
    questionDelay = 1500;
}
if (mode === "hard") {
    damage = 30;
    questionDelay = 900;
}

/* --------------------------------------------------------
   GAME STATE
-------------------------------------------------------- */
let health = 100;

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const healthBar = document.getElementById("health-bar");
const heroStatus = document.getElementById("hero-status");

/* --------------------------------------------------------
   QUESTIONS (EASY / NORMAL / HARD) — 30 TOTAL
-------------------------------------------------------- */

const questionsEasy = [
    { question: "Where is Turkey's capital located?", answers: ["Ankara", "Istanbul", "Izmir", "Bursa"], correct: "Ankara", lat: 39.93, lng: 32.86 },
    { question: "What is the capital of France?", answers: ["Paris", "Lyon", "Nice", "Marseille"], correct: "Paris", lat: 48.8566, lng: 2.3522 },
    { question: "What is the capital of Japan?", answers: ["Seoul", "Tokyo", "Beijing", "Osaka"], correct: "Tokyo", lat: 35.6895, lng: 139.6917 },
    { question: "Penguins mainly live near which continent?", answers: ["Africa", "Antarctica", "Europe", "Asia"], correct: "Antarctica", lat: -75, lng: 0 },
    { question: "Where is the Sahara Desert located?", answers: ["Asia", "Africa", "Australia", "South America"], correct: "Africa", lat: 23, lng: 13 },
    { question: "Carnival is famously held in which country?", answers: ["Mexico", "Spain", "Brazil", "Portugal"], correct: "Brazil", lat: -22.9068, lng: -43.1729 },
    { question: "Where are the Pyramids of Giza?", answers: ["Morocco", "Egypt", "Saudi Arabia", "Iran"], correct: "Egypt", lat: 29.9792, lng: 31.1342 },
    { question: "Great Barrier Reef belongs to which country?", answers: ["Australia", "Indonesia", "India", "Philippines"], correct: "Australia", lat: -18.2871, lng: 147.6992 },
    { question: "Which ocean is on USA east coast?", answers: ["Pacific", "Indian", "Arctic", "Atlantic"], correct: "Atlantic", lat: 35, lng: -65 },
    { question: "Where is New York located?", answers: ["Canada", "United States", "UK", "Mexico"], correct: "United States", lat: 40.7128, lng: -74.006 }
];

const questionsNormal = [
    { question: "Sushi belongs to which country?", answers: ["China", "Japan", "Thailand", "Vietnam"], correct: "Japan", lat: 35.6895, lng: 139.6917 },
    { question: "Tango originally developed in?", answers: ["Rio", "Buenos Aires", "Madrid", "Lisbon"], correct: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
    { question: "Paella is from which country?", answers: ["Italy", "Spain", "Greece", "France"], correct: "Spain", lat: 39.4699, lng: -0.3763 },
    { question: "Kimchi belongs to which culture?", answers: ["Japan", "China", "South Korea", "Malaysia"], correct: "South Korea", lat: 37.5665, lng: 126.978 },
    { question: "Baklava is strongly linked to?", answers: ["Turkey", "Norway", "Brazil", "Canada"], correct: "Turkey", lat: 41.0082, lng: 28.9784 },
    { question: "Flamenco dance is from?", answers: ["Italy", "Spain", "Portugal", "France"], correct: "Spain", lat: 37.3891, lng: -5.9845 },
    { question: "Cairo is located in?", answers: ["Egypt", "Sudan", "Ethiopia", "Iraq"], correct: "Egypt", lat: 30.0444, lng: 31.2357 },
    { question: "Duduk instrument originates from?", answers: ["Finland", "Armenia", "Chile", "India"], correct: "Armenia", lat: 40.1792, lng: 44.4991 },
    { question: "Hula dance belongs to?", answers: ["Japan", "Hawaii (USA)", "New Zealand", "India"], correct: "Hawaii (USA)", lat: 21.3069, lng: -157.8583 },
    { question: "Istanbul lies on which continents?", answers: ["Europe & Asia", "Asia & Africa", "Europe & Africa", "America"], correct: "Europe & Asia", lat: 41.0082, lng: 28.9784 }
];

const questionsHard = [
    { question: "Amazon rainforest mainly located in?", answers: ["Brazil", "Peru", "Colombia", "Bolivia"], correct: "Brazil", lat: -3.4, lng: -62 },
    { question: "The tundra of Siberia is in?", answers: ["Canada", "Russia", "Greenland", "Norway"], correct: "Russia", lat: 66.5, lng: 90 },
    { question: "Galapagos Islands belong to?", answers: ["Peru", "Chile", "Ecuador", "Panama"], correct: "Ecuador", lat: -0.95, lng: -90.96 },
    { question: "Serengeti grasslands are in?", answers: ["Kenya", "South Africa", "Tanzania", "Namibia"], correct: "Tanzania", lat: -2.33, lng: 34.83 },
    { question: "Khoomei throat singing comes from?", answers: ["Mongolia", "Germany", "Pakistan", "Spain"], correct: "Mongolia", lat: 47.8864, lng: 106.9057 },
    { question: "Haka dance belongs to?", answers: ["New Zealand", "Indonesia", "Fiji", "South Africa"], correct: "New Zealand", lat: -41.2865, lng: 174.7762 },
    { question: "Where is Angkor Wat located?", answers: ["Thailand", "Cambodia", "Laos", "Myanmar"], correct: "Cambodia", lat: 13.4125, lng: 103.867 },
    { question: "Reggae was born in?", answers: ["Cuba", "Jamaica", "DR", "Puerto Rico"], correct: "Jamaica", lat: 17.9712, lng: -76.7920 },
    { question: "Mount Etna is in?", answers: ["Greece", "Italy (Sicily)", "Turkey", "Iceland"], correct: "Italy (Sicily)", lat: 37.7510, lng: 14.9934 },
    { question: "The kora instrument belongs to?", answers: ["West Africa", "Scandinavia", "East Asia", "Central America"], correct: "West Africa", lat: 13.4549, lng: -16.5790 }
];

/* POOL BY MODE */
let questionPool = [];
if (mode === "easy") questionPool = questionsEasy;
else if (mode === "hard") questionPool = questionsHard;
else questionPool = questionsEasy.concat(questionsNormal);

/* --------------------------------------------------------
   LOAD QUESTION
-------------------------------------------------------- */
function loadQuestion() {
    if (health <= 0) return endGame(false);

    const q = questionPool[Math.floor(Math.random() * questionPool.length)];

    questionText.textContent = q.question;
    answersContainer.innerHTML = "";

    heroStatus.textContent = "Answer quickly to protect Earth!";
    heroStatus.style.color = "#00eaff";

    q.answers.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = ans;
        btn.onclick = () => checkAnswer(q, ans === q.correct);
        answersContainer.appendChild(btn);
    });
}

/* --------------------------------------------------------
   CHECK ANSWER
-------------------------------------------------------- */
function checkAnswer(question, isCorrect) {
    if (isCorrect) {
        heroStatus.textContent = "Nice hit! Correct answer.";
        heroStatus.style.color = "#39ff39";
    } else {
        health -= damage;
        if (health < 0) health = 0;
        healthBar.style.width = health + "%";

        if (health <= 60 && health > 30) healthBar.style.background = "yellow";
        if (health <= 30) healthBar.style.background = "red";

        heroStatus.textContent = "Wrong! The correct location is under attack!";
        heroStatus.style.color = "red";

        addHitEffect(question.lat, question.lng);

        heroImage.classList.add("hero-damage");
        setTimeout(() => heroImage.classList.remove("hero-damage"), 300);

        if (health <= 0) {
            return setTimeout(() => endGame(false), 900);
        }
    }

    setTimeout(loadQuestion, questionDelay);
}

/* --------------------------------------------------------
   GAME START
-------------------------------------------------------- */
setTimeout(loadQuestion, 1000);

/* --------------------------------------------------------
   GAME END
-------------------------------------------------------- */
function endGame(win) {
    alert(win ? "You win!" : "You lost… Earth is destroyed.");
}

/* --------------------------------------------------------
   STARFIELD BACKGROUND
-------------------------------------------------------- */
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let stars = [];
let shooting = [];

function initStars(count = 200) {
    stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 40 + Math.random() * 80,
            size: Math.random() * 2 + 0.5
        });
    }
}
initStars();

function newShootingStar() {
    shooting.push({
        x: Math.random() * canvas.width,
        y: -50,
        vx: -300 - Math.random() * 200,
        vy: 300 + Math.random() * 200,
        life: 0,
        maxLife: 1 + Math.random() * 1.5
    });
}

let last = 0;
let timer = 0;
let nextStar = 1.5;

function starLoop(t) {
    let dt = (t - last) / 1000;
    last = t;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    for (const s of stars) {
        s.y += s.speed * dt;
        if (s.y > canvas.height) {
            s.y = -5;
            s.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    }

    timer += dt;
    if (timer > nextStar) {
        newShootingStar();
        timer = 0;
        nextStar = 1 + Math.random() * 2.5;
    }

    ctx.lineWidth = 2;
    for (let i = shooting.length - 1; i >= 0; i--) {
        const sh = shooting[i];
        sh.life += dt;
        if (sh.life > sh.maxLife) {
            shooting.splice(i, 1);
            continue;
        }

        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;

        const alpha = 1 - sh.life / sh.maxLife;
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;

        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 0.15, sh.y - sh.vy * 0.15);
        ctx.stroke();
    }

    requestAnimationFrame(starLoop);
}
requestAnimationFrame(starLoop);
