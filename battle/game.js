// =====================================
// OYUN DEĞİŞKENLERİ
// =====================================
let gameState = {
    difficulty: 'normal',
    health: 100,
    isPlaying: false
};

// HTML Elemanlarını Seç
const difficultyScreen = document.getElementById("difficulty-screen");
const healthBar = document.getElementById("health-bar");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const heroStatus = document.getElementById("hero-status");

// =====================================
// GLOBE INIT (DÜNYA AYARLARI) - HATA DÜZELTİLDİ
// =====================================
const worldElement = document.getElementById("globe-container");

// Globe'u başlat
const world = Globe()(worldElement)
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)") // Arka plan şeffaf
    .showAtmosphere(true);

// ÖNEMLİ DÜZELTME: autoRotate'i zincirleme (chaining) dışına aldık.
// Konsol hatası burada çözülüyor.
world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.5;
world.controls().enableZoom = false; // Zoom'u kapatalım ki oyun bozulmasın

// Ekran Boyutlandırma
function resize() {
    // Dünyayı ekranın ortasına uygun boyutta yerleştir
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.6;
    world.width(size);
    world.height(size);
}
// İlk açılışta ve ekran değişince çalıştır
resize();
window.addEventListener("resize", resize);


// =====================================
// SORU HAVUZU (Örnek)
// =====================================
const questions = [
    {
        question: "Which planet is known as the Red Planet?",
        answers: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: "Mars"
    },
    {
        question: "What lies at the center of our galaxy?",
        answers: ["A Neutron Star", "A Black Hole", "A White Dwarf", "Another Sun"],
        correct: "A Black Hole"
    },
    {
        question: "Which is the largest planet in the solar system?",
        answers: ["Earth", "Saturn", "Jupiter", "Neptune"],
        correct: "Jupiter"
    }
];


// =====================================
// OYUNU BAŞLATMA FONKSİYONU
// =====================================
// HTML'deki onclick="startGame('...')" bu fonksiyonu çağırır.
window.startGame = function(selectedDifficulty) {
    console.log("Oyun başlatılıyor. Zorluk:", selectedDifficulty);
    
    gameState.difficulty = selectedDifficulty;
    gameState.isPlaying = true;
    gameState.health = 100;

    // 1. Zorluk ekranını gizle (Efektli geçiş için opacity kullanabiliriz ama şimdilik direkt gizliyoruz)
    difficultyScreen.style.display = "none";

    // 2. İlk soruyu yükle
    heroStatus.textContent = "Hostiles detected! Engage!";
    loadNextQuestion();
}


// =====================================
// SORU YÜKLEME
// =====================================
function loadNextQuestion() {
    if (gameState.health <= 0) {
        endGame();
        return;
    }

    // Rastgele bir soru seç
    const q = questions[Math.floor(Math.random() * questions.length)];

    questionText.textContent = q.question;
    answersContainer.innerHTML = ""; // Önceki butonları temizle

    // Şıkları karıştır
    let shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);

    shuffledAnswers.forEach(ans => {
        const btn = document.createElement("button");
        // Basit bir stil verelim (CSS dosyan varsa oradan çeker)
        btn.style.padding = "15px 25px";
        btn.style.margin = "5px";
        btn.style.fontSize = "18px";
        btn.style.cursor = "pointer";
        btn.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        btn.style.color = "#00eaff";
        btn.style.border = "2px solid #00eaff";
        btn.style.borderRadius = "10px";
        btn.style.fontFamily = "'Orbitron', sans-serif";

        btn.textContent = ans;
        
        // Tıklanınca cevabı kontrol et
        btn.onclick = () => checkAnswer(ans === q.correct);
        
        answersContainer.appendChild(btn);
    });
}

// =====================================
// CEVAP KONTROLÜ
// =====================================
function checkAnswer(isCorrect) {
    const buttons = answersContainer.querySelectorAll("button");
    buttons.forEach(b => b.disabled = true); // Butonları kilitle

    if (isCorrect) {
        heroStatus.textContent = "Target eliminated! Good shot.";
        heroStatus.style.color = "#4dff88";
        // Zorluğa göre puan ekleme vs. buraya gelir
    } else {
        heroStatus.textContent = "Missed! We took damage!";
        heroStatus.style.color = "#ff4d4d";
        
        // Can azaltma
        gameState.health -= 20;
        if(gameState.health < 0) gameState.health = 0;
        healthBar.style.width = gameState.health + "%";

        // Dünyayı sars (Basit efekt)
        worldElement.style.transform = "translate(-50%, -60%) translateX(10px)";
        setTimeout(() => {
            worldElement.style.transform = "translate(-50%, -60%) translateX(-10px)";
        }, 100);
        setTimeout(() => {
            worldElement.style.transform = "translate(-50%, -60%)";
        }, 200);
    }

    // 1.5 saniye sonra yeni soru
    setTimeout(loadNextQuestion, 1500);
}

// =====================================
// OYUN BİTİŞİ
// =====================================
function endGame() {
    questionText.textContent = "GAME OVER";
    answersContainer.innerHTML = "";
    heroStatus.textContent = "The planet has fallen...";
    heroStatus.style.color = "red";
}