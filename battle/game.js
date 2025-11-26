/* --------------------------------------------------------
   LOAD HERO & EARTH
-------------------------------------------------------- */
const heroImage = document.getElementById("hero-image");
const selectedHero = localStorage.getItem("ps_selectedHero") || "Ceres";

const heroImages = {
    Ceres: "../characters/ceres.png",
    Juno: "../characters/juno.png",
    Mars: "../characters/mars.png",
    Venus: "../characters/venus.png"
};

heroImage.src = heroImages[selectedHero];

const earthImage = document.getElementById("earth-image");


/* --------------------------------------------------------
   READ MODE FROM LOCALSTORAGE
-------------------------------------------------------- */
const mode = localStorage.getItem("ps_gameMode") || "normal";

let damage = 20;
let questionDelay = 1200;

if (mode === "easy") {
    damage = 10;
    questionDelay = 1600;
}
if (mode === "hard") {
    damage = 30;
    questionDelay = 900;
}


/* --------------------------------------------------------
   BASE SETUP
-------------------------------------------------------- */
let health = 100;

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const healthBar = document.getElementById("health-bar");
const heroStatus = document.getElementById("hero-status");


/* --------------------------------------------------------
   QUESTIONS (TEMP)
-------------------------------------------------------- */
const questions = [
    {
        question: "Which planet is closest to the Sun?",
        answers: ["Venus", "Mercury", "Earth", "Mars"],
        correct: "Mercury"
    },
    {
        question: "What is the capital of Japan?",
        answers: ["Seoul", "Tokyo", "Beijing", "Bangkok"],
        correct: "Tokyo"
    },
    {
        question: "Which gas do plants absorb?",
        answers: ["Oxygen", "Carbon Dioxide", "Hydrogen", "Helium"],
        correct: "Carbon Dioxide"
    }
];


/* --------------------------------------------------------
   LOAD QUESTION
-------------------------------------------------------- */
function loadQuestion() {

    if (health <= 0) {
        endGame(false);
        return;
    }

    const q = questions[Math.floor(Math.random() * questions.length)];

    questionText.textContent = q.question;
    answersContainer.innerHTML = "";
    heroStatus.textContent = "Prepare yourself!";
    heroStatus.style.color = "#00eaff";

    q.answers.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = ans;

        btn.onclick = () => checkAnswer(ans === q.correct);

        answersContainer.appendChild(btn);
    });
}


/* --------------------------------------------------------
   CHECK ANSWER
-------------------------------------------------------- */
function checkAnswer(isCorrect) {

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

        // Earth damage animation
        earthImage.classList.add("earth-damage");
        setTimeout(() => earthImage.classList.remove("earth-damage"), 400);

        // Hero shake animation
        heroImage.classList.add("hero-damage");
        setTimeout(() => heroImage.classList.remove("hero-damage"), 300);

        if (health <= 0) {
            setTimeout(() => endGame(false), 800);
            return;
        }
    }

    // Next question
    setTimeout(loadQuestion, questionDelay);
}


/* --------------------------------------------------------
   INIT FIRST QUESTION
-------------------------------------------------------- */
setTimeout(loadQuestion, 1200);


/* --------------------------------------------------------
   GAME END (placeholder)
-------------------------------------------------------- */
function endGame(win) {
    alert(win ? "You win!" : "You lost...");
}

const earthImage = document.getElementById("earth-image");
const heroImage = document.getElementById("hero-image");
