/* ------------------------------
   LOAD HERO
------------------------------ */
const heroImage = document.getElementById("hero-image");
const selectedHero = localStorage.getItem("ps_selectedHero") || "Ceres";

const heroImages = {
    Ceres: "../characters/ceres.png",
    Juno: "../characters/juno.png",
    Mars: "../characters/mars.png",
    Venus: "../characters/venus.png"
};

heroImage.src = heroImages[selectedHero];

/* ------------------------------
   INIT GLOBE.GL
------------------------------ */
const world = Globe()(document.getElementById("globe-container"))
    .globeImageUrl("../earth-big.png")
    .backgroundColor("black")
    .showAtmosphere(true)
    .atmosphereColor("#3af2ff")
    .atmosphereAltitude(0.25);

/* Hero konumu (saldırının geldiği yer) */
const heroLat = 10;
const heroLng = 20;

/* ------------------------------
   MODE SETTINGS
------------------------------ */
const mode = localStorage.getItem("ps_gameMode") || "normal";

let damage = mode === "easy" ? 10 : mode === "hard" ? 30 : 20;
let questionDelay = mode === "easy" ? 1600 : mode === "hard" ? 900 : 1200;

/* ------------------------------
   GAME VARIABLES
------------------------------ */
let health = 100;

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const healthBar = document.getElementById("health-bar");
const heroStatus = document.getElementById("hero-status");

/* ------------------------------
   LOCATION-BASED QUESTIONS
------------------------------ */
const questions = [
    {
        question: "Where is Turkey's capital located?",
        answers: ["Ankara", "Istanbul", "Izmir", "Bursa"],
        correct: "Ankara",
        lat: 39.93, lng: 32.85
    },
    {
        question: "On which continent do penguins primarily live?",
        answers: ["Asia", "Antarctica", "Europe", "Africa"],
        correct: "Antarctica",
        lat: -82, lng: 0
    },
    {
        question: "Where is the Amazon Rainforest?",
        answers: ["Africa", "Europe", "South America", "Asia"],
        correct: "South America",
        lat: -3.4653, lng: -62.2159
    }
];

/* ------------------------------
   FIRE VISUAL EFFECTS
------------------------------ */
function fireAt(lat, lng, correct) {
    world.arcsData([{
        startLat: heroLat,
        startLng: heroLng,
        endLat: lat,
        endLng: lng,
        color: correct ? "lime" : "red"
    }])
    .arcStroke(2)
    .arcAltitude(0.25)
    .arcDuration(2000);

    if (!correct) {
        world.ringsData([{ lat, lng }])
            .ringColor(() => "red")
            .ringMaxRadius(5)
            .ringPropagationSpeed(5);
    }
}

/* ------------------------------
   LOAD QUESTION
------------------------------ */
function loadQuestion() {

    if (health <= 0) return endGame(false);

    const q = questions[Math.floor(Math.random() * questions.length)];

    questionText.textContent = q.question;
    answersContainer.innerHTML = "";

    heroStatus.textContent = "Prepare yourself!";
    heroStatus.style.color = "#00eaff";

    q.answers.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = ans;

        btn.onclick = () => checkAnswer(ans === q.correct, q.lat, q.lng);

        answersContainer.appendChild(btn);
    });
}

/* ------------------------------
   CHECK ANSWER
------------------------------ */
function checkAnswer(isCorrect, lat, lng) {

    fireAt(lat, lng, isCorrect);

    if (isCorrect) {
        heroStatus.textContent = "Nice hit!";
        heroStatus.style.color = "#39ff39";
    }
    else {
        health -= damage;
        if (health < 0) health = 0;

        healthBar.style.width = health + "%";

        if (health <= 60 && health > 30) healthBar.style.background = "yellow";
        if (health <= 30) healthBar.style.background = "red";

        heroStatus.textContent = "Wrong! Earth is damaged!";
        heroStatus.style.color = "red";

        heroImage.classList.add("hero-damage");
        setTimeout(() => heroImage.classList.remove("hero-damage"), 300);

        if (health <= 0) {
            setTimeout(() => endGame(false), 800);
            return;
        }
    }

    setTimeout(loadQuestion, questionDelay);
}

/* ------------------------------
   START GAME
------------------------------ */
setTimeout(loadQuestion, 1200);

/* ------------------------------
   GAME END
------------------------------ */
function endGame(win) {
    alert(win ? "You win!" : "You lost...");
}
