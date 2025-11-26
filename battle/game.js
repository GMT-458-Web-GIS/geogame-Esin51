// =====================================
// HERO LOAD
// =====================================
const heroImage = document.getElementById("hero-image");
const selectedHero = localStorage.getItem("ps_selectedHero") || "Ceres";

const heroImages = {
    Ceres: "../characters/ceres.png",
    Juno: "../characters/juno.png",
    Mars: "../characters/mars.png",
    Venus: "../characters/venus.png",
};

heroImage.src = heroImages[selectedHero];

// =====================================
// GLOBE INIT
// =====================================
const world = Globe()(document.getElementById("globe-container"))
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(true)
    .autoRotate(true)
    .autoRotateSpeed(0.4);

// resize globe
function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.55;
    world.width(size);
    world.height(size);
}
resize();
window.addEventListener("resize", resize);

// =====================================
// GAME VARIABLES
// =====================================
let health = 100;

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const heroStatus = document.getElementById("hero-status");
const healthBar = document.getElementById("health-bar");

// =====================================
// SAMPLE QUESTIONS (TEST)
// =====================================
const questions = [
    {
        question: "Where is Turkey's capital located?",
        answers: ["Ankara", "Istanbul", "Izmir", "Bursa"],
        correct: "Ankara",
    },
    {
        question: "What is the capital of France?",
        answers: ["Paris", "Lyon", "Nice", "Marseille"],
        correct: "Paris",
    }
];

// =====================================
// LOAD QUESTION
// =====================================
function loadQuestion() {

    const q = questions[Math.floor(Math.random() * questions.length)];

    questionText.textContent = q.question;
    answersContainer.innerHTML = "";   // TEMİZLE -> ÖNEMLİ

    q.answers.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = ans;

        btn.onclick = () => checkAnswer(ans === q.correct);

        answersContainer.appendChild(btn);
    });
}

// =====================================
// CHECK ANSWER
// =====================================
function checkAnswer(correct) {
    heroStatus.textContent = correct ? "Correct!" : "Wrong!";
    heroStatus.style.color = correct ? "#39ff39" : "red";

    setTimeout(loadQuestion, 1000);
}

// =====================================
// START GAME
// =====================================
setTimeout(loadQuestion, 1500);
