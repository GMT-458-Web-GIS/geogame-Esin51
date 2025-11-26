// =====================================
// HERO LOAD
// =====================================
const heroImage = document.getElementById("hero-image");
// LocalStorage boşsa varsayılan olarak 'Ceres' seç
const selectedHero = localStorage.getItem("ps_selectedHero") || "Ceres";

const heroImages = {
    Ceres: "../characters/ceres.png",
    Juno: "../characters/juno.png",
    Mars: "../characters/mars.png",
    Venus: "../characters/venus.png",
};

// Eğer resim yolu doğruysa yükler, yoksa boş kalır (hata vermemesi için kontrol eklenebilir)
if (heroImages[selectedHero]) {
    heroImage.src = heroImages[selectedHero];
}

// =====================================
// GLOBE INIT (DÜNYA AYARLARI)
// =====================================
const worldElement = document.getElementById("globe-container");

// Zincirleme fonksiyonda hata çıkaran autoRotate'i ayırdık
const world = Globe()
    (worldElement)
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(true);

// Dönme ayarını (Auto Rotate) controls üzerinden yapıyoruz:
world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.5;

// Resize (Ekran Boyutlandırma)
function resize() {
    // Ekranın kısa kenarına göre boyut alalım
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.55;
    world.width(size);
    world.height(size);
}
// İlk açılışta ve ekran değişince çalıştır
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
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: ["Mars", "Venus", "Jupiter", "Saturn"],
        correct: "Mars",
    }
];

// =====================================
// LOAD QUESTION
// =====================================
function loadQuestion() {
    // Rastgele bir soru seç
    const q = questions[Math.floor(Math.random() * questions.length)];

    questionText.textContent = q.question;
    answersContainer.innerHTML = "";   // Önceki butonları temizle

    q.answers.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = ans;

        // Tıklanınca cevabı kontrol et
        btn.onclick = () => checkAnswer(ans === q.correct);

        answersContainer.appendChild(btn);
    });
}

// =====================================
// CHECK ANSWER
// =====================================
function checkAnswer(isCorrect) {
    if (isCorrect) {
        heroStatus.textContent = "Correct! Attack initiated!";
        heroStatus.style.color = "#39ff39";
        // Doğru bildiğinde yapılacaklar (Can azaltma vs.) buraya eklenebilir.
    } else {
        heroStatus.textContent = "Wrong! Look out!";
        heroStatus.style.color = "red";
        health -= 10; // Örnek can azaltma
        if(health < 0) health = 0;
        healthBar.style.width = health + "%";
    }

    // 1.5 saniye sonra yeni soru getir
    setTimeout(loadQuestion, 1500);
}

// =====================================
// START GAME
// =====================================
// Oyunun başladığını göstermek için kısa bir gecikme
setTimeout(loadQuestion, 1000);