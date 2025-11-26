/* BASE SETUP */
let health = 100;

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const healthBar = document.getElementById("health-bar");
const heroStatus = document.getElementById("hero-status");


/* SAMPLE QUESTIONS FOR NOW */
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
    }
];


/* SHOW QUESTION */
function loadQuestion() {
    const q = questions[Math.floor(Math.random() * questions.length)];

    questionText.textContent = q.question;
    answersContainer.innerHTML = "";

    q.answers.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = ans;

        btn.onclick = () => checkAnswer(ans === q.correct);
        answersContainer.appendChild(btn);
    });
}


/* ANSWER CHECK */
function checkAnswer(isCorrect) {
    if (isCorrect) {
        heroStatus.textContent = "Nice hit!";
        heroStatus.style.color = "#39ff39";
    } else {
        health -= 20;
        healthBar.style.width = health + "%";

        if (health < 60) healthBar.style.background = "yellow";
        if (health < 30) healthBar.style.background = "red";

        heroStatus.textContent = "Wrong! Earth is damaged!";
        heroStatus.style.color = "red";
    }

    setTimeout(loadQuestion, 1200);
}


/* INIT */
setTimeout(loadQuestion, 1200);
