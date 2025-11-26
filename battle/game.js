// =====================================
// 1. AYARLAR & DEĞİŞKENLER
// =====================================
let health = 100;
let timeLeft = 100; // 100 saniye
let isGameOver = false;
let currentDifficulty = 'normal';
let timerInterval = null;

const difficultyScreen = document.getElementById("difficulty-screen");
const questionArea = document.getElementById("question-area");
const healthBar = document.getElementById("health-bar");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const heroStatus = document.getElementById("hero-status");
const gameOverScreen = document.getElementById("game-over-screen");
const timerDisplay = document.getElementById("game-timer");
const endTitle = document.getElementById("end-title");
const endReason = document.getElementById("end-reason");

// =====================================
// 2. DÜNYA (GLOBE) AYARLARI
// =====================================
const world = Globe()
    (document.getElementById("globe-container"))
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(true)
    .atmosphereColor("#3a228a")
    .atmosphereAltitude(0.15)
    .ringColor(() => "red")
    .ringMaxRadius(30)
    .ringPropagationSpeed(8)
    .ringRepeatPeriod(200);

world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.6;
world.controls().enableZoom = false;

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.55;
    world.width(size);
    world.height(size);
}
resize();
window.addEventListener("resize", resize);

// =====================================
// 3. SORULAR
// =====================================
const questionData = [
    { question: "Where is Turkey's capital located?", answers: ["Ankara", "Istanbul", "Izmir", "Bursa"], correct: "Ankara", lat: 39.93, lng: 32.86 },
    { question: "What is the capital of France?", answers: ["Paris", "Lyon", "Nice", "Marseille"], correct: "Paris", lat: 48.85, lng: 2.35 },
    { question: "What is the capital of Japan?", answers: ["Seoul", "Tokyo", "Beijing", "Osaka"], correct: "Tokyo", lat: 35.68, lng: 139.69 },
    { question: "Penguins mainly live near which continent?", answers: ["Africa", "Antarctica", "Europe", "Asia"], correct: "Antarctica", lat: -75, lng: 0 },
    { question: "Where is the Sahara Desert located?", answers: ["Asia", "Africa", "Australia", "South America"], correct: "Africa", lat: 23, lng: 13 },
    { question: "Carnival is famously held in which country?", answers: ["Mexico", "Spain", "Brazil", "Portugal"], correct: "Brazil", lat: -22.90, lng: -43.17 },
    { question: "Where are the Pyramids of Giza?", answers: ["Morocco", "Egypt", "Saudi Arabia", "Iran"], correct: "Egypt", lat: 29.97, lng: 31.13 },
    { question: "Sushi belongs to which country?", answers: ["China", "Japan", "Thailand", "Vietnam"], correct: "Japan", lat: 35.68, lng: 139.69 },
    { question: "Tango originally developed in?", answers: ["Rio", "Buenos Aires", "Madrid", "Lisbon"], correct: "Buenos Aires", lat: -34.60, lng: -58.38 },
    { question: "Paella is from which country?", answers: ["Italy", "Spain", "Greece", "France"], correct: "Spain", lat: 39.46, lng: -0.37 },
    { question: "Kimchi belongs to which culture?", answers: ["Japan", "China", "South Korea", "Malaysia"], correct: "South Korea", lat: 37.56, lng: 126.97 },
    { question: "Baklava is strongly linked to?", answers: ["Turkey", "Norway", "Brazil", "Canada"], correct: "Turkey", lat: 41.00, lng: 28.97 },
    { question: "Amazon rainforest mainly located in?", answers: ["Brazil", "Peru", "Colombia", "Bolivia"], correct: "Brazil", lat: -3.4, lng: -62 },
    { question: "The tundra of Siberia is in?", answers: ["Canada", "Russia", "Greenland", "Norway"], correct: "Russia", lat: 66.5, lng: 90 },
    { question: "Galapagos Islands belong to?", answers: ["Peru", "Chile", "Ecuador", "Panama"], correct: "Ecuador", lat: -0.95, lng: -90.96 },
    { question: "Serengeti grasslands are in?", answers: ["Kenya", "South Africa", "Tanzania", "Namibia"], correct: "Tanzania", lat: -2.33, lng: 34.83 },
    { question: "Where is Angkor Wat located?", answers: ["Thailand", "Cambodia", "Laos", "Myanmar"], correct: "Cambodia", lat: 13.41, lng: 103.86 }
];

let currentQuestion = null;

// =====================================
// 4. OYUN BAŞLAT
// =====================================
window.startGame = function(difficulty) {
    currentDifficulty = difficulty;
    difficultyScreen.style.display = "none";
    questionArea.classList.remove("hidden");
    
    // Süreye göre zorluk ayarı (İstersen)
    timeLeft = 100;
    
    startTimer();
    loadQuestion();
}

// =====================================
// 5. ZAMANLAYICI (TIMER)
// =====================================
function startTimer() {
    timerDisplay.textContent = timeLeft;
    
    timerInterval = setInterval(() => {
        if(isGameOver) {
            clearInterval(timerInterval);
            return;
        }

        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if(timeLeft <= 0) {
            triggerGameOver("Time's Up!");
        }
    }, 1000);
}

// =====================================
// 6. OYUN MANTIĞI
// =====================================

function loadQuestion() {
    if (isGameOver) return;

    // Kamerayı GERİ ÇEK (Dünya yukarıda kalmasın)
    // altitude 2.5 yaparak kamerayı uzaklaştırıyoruz
    world.pointOfView({ altitude: 2.5 }, 1000); 
    world.ringsData([]); // Efektleri temizle

    currentQuestion = questionData[Math.floor(Math.random() * questionData.length)];

    questionText.textContent = currentQuestion.question;
    answersContainer.innerHTML = "";
    heroStatus.textContent = "Waiting for input...";
    heroStatus.style.color = "#00eaff";

    let shuffled = [...currentQuestion.answers].sort(() => Math.random() - 0.5);

    shuffled.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = ans;
        btn.onclick = () => checkAnswer(ans, btn);
        answersContainer.appendChild(btn);
    });
}

function checkAnswer(selectedAns, btnElement) {
    if (isGameOver) return;

    const allBtns = document.querySelectorAll(".answer-btn");
    allBtns.forEach(b => b.disabled = true);

    if (selectedAns === currentQuestion.correct) {
        // DOĞRU
        btnElement.classList.add("correct");
        heroStatus.textContent = "CORRECT! Target Secured.";
        heroStatus.style.color = "#39ff39";
        setTimeout(loadQuestion, 1500);

    } else {
        // YANLIŞ
        btnElement.classList.add("wrong");
        allBtns.forEach(b => {
            if (b.textContent === currentQuestion.correct) b.classList.add("correct");
        });

        heroStatus.textContent = "WRONG! IMPACT DETECTED!";
        heroStatus.style.color = "red";

        let damage = 20;
        if(currentDifficulty === 'hard') damage = 40;
        if(currentDifficulty === 'easy') damage = 10;
        
        takeDamage(damage);

        // SALDIRI EFEKTİ
        // Kamerayı yaklaştır (Bomba düşüyor gibi)
        world.pointOfView({ 
            lat: currentQuestion.lat, 
            lng: currentQuestion.lng, 
            altitude: 1.5 
        }, 800);

        setTimeout(() => {
            world.ringsData([{
                lat: currentQuestion.lat,
                lng: currentQuestion.lng
            }]);
            
            // CSS Sarsıntısı
            const globeDiv = document.getElementById("globe-container");
            globeDiv.style.transform = "translate(-50%, -50%) translate(10px, 10px)";
            setTimeout(() => globeDiv.style.transform = "translate(-50%, -50%) translate(-10px, -10px)", 50);
            setTimeout(() => globeDiv.style.transform = "translate(-50%, -50%)", 100);

        }, 800);

        setTimeout(loadQuestion, 3000);
    }
}

function takeDamage(amount) {
    health -= amount;
    if (health < 0) health = 0;
    
    healthBar.style.width = health + "%";
    
    if (health <= 30) healthBar.style.background = "red";

    if (health === 0) {
        triggerGameOver("Planet Destroyed");
    }
}

function triggerGameOver(reason) {
    isGameOver = true;
    clearInterval(timerInterval);
    endTitle.textContent = "GAME OVER";
    endReason.textContent = reason;
    
    setTimeout(() => {
        gameOverScreen.classList.remove("hidden");
        world.atmosphereColor("red");
    }, 1000);
}