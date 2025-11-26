// =====================================
// 1. HERO LOAD (KAHRAMAN SEÇİMİ)
// =====================================
const heroImage = document.getElementById("hero-image");
const selectedHero = localStorage.getItem("ps_selectedHero") || "Ceres";

const heroImages = {
    Ceres: "../characters/ceres.png",
    Juno: "../characters/juno.png",
    Mars: "../characters/mars.png",
    Venus: "../characters/venus.png",
};

// Resim varsa yükle
if (heroImages[selectedHero]) {
    heroImage.src = heroImages[selectedHero];
}

// =====================================
// 2. GLOBE INIT (DÜNYA AYARLARI)
// =====================================
const worldElement = document.getElementById("globe-container");

const world = Globe()
    (worldElement)
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)") // Arka plan şeffaf
    .showAtmosphere(true)
    .atmosphereColor("lightblue")
    .atmosphereAltitude(0.15)
    // --- BOMBA EFEKTİ (RINGS) AYARLARI ---
    .ringColor(() => "red")           // Halkalar kırmızı
    .ringMaxRadius(20)                // Halkanın büyüyeceği maksimum çap
    .ringPropagationSpeed(4)          // Yayılma hızı
    .ringRepeatPeriod(400);           // Halkanın tekrar etme sıklığı

// Otomatik Dönme Ayarları
world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.6;

// Ekran Boyutlandırma
function resize() {
    // Globe boyutunu ekranın %55'i kadar yapıyoruz
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.55;
    world.width(size);
    world.height(size);
}
resize();
window.addEventListener("resize", resize);

// =====================================
// 3. SORU HAVUZU (VERDİĞİN VERİLER)
// =====================================

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

// Tüm soruları birleştiriyoruz
const allQuestions = [...questionsEasy, ...questionsNormal, ...questionsHard];

// =====================================
// 4. OYUN DEĞİŞKENLERİ
// =====================================
let health = 100;
let currentQuestion = null;

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const heroStatus = document.getElementById("hero-status");
const healthBar = document.getElementById("health-bar");

// =====================================
// 5. SORU YÜKLEME FONKSİYONU
// =====================================
function loadQuestion() {
    // 1. Dünyadaki bombaları (halkaları) temizle
    world.ringsData([]);

    // 2. Rastgele bir soru seç
    currentQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];

    // 3. Ekrana yaz
    questionText.textContent = currentQuestion.question;
    answersContainer.innerHTML = "";
    heroStatus.textContent = "Waiting for command...";
    heroStatus.style.color = "white";

    // 4. Şıkları karıştır (Shuffle)
    let shuffledAnswers = [...currentQuestion.answers];
    shuffledAnswers.sort(() => Math.random() - 0.5);

    // 5. Butonları oluştur
    shuffledAnswers.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = ans;
        btn.onclick = () => checkAnswer(ans);
        answersContainer.appendChild(btn);
    });
}

// =====================================
// 6. CEVAP KONTROLÜ (BOMBA BURADA)
// =====================================
function checkAnswer(selectedAnswer) {
    // Tüm butonları pasif yap (üst üste tıklanmasın)
    const buttons = document.querySelectorAll(".answer-btn");
    buttons.forEach(b => b.disabled = true);

    const isCorrect = selectedAnswer === currentQuestion.correct;

    if (isCorrect) {
        // DOĞRU CEVAP
        heroStatus.textContent = "Target Secured!";
        heroStatus.style.color = "#39ff39"; // Yeşil
        
        // Kısa süre sonra yeni soru
        setTimeout(loadQuestion, 1500);

    } else {
        // YANLIŞ CEVAP - SALDIRI (BOMBA)
        heroStatus.textContent = "WARNING! LOCATION UNDER ATTACK!";
        heroStatus.style.color = "red";

        // 1. Can Azalt
        health -= 15;
        if(health < 0) health = 0;
        healthBar.style.width = health + "%";
        healthBar.style.backgroundColor = "red"; // Bar kırmızıya döner

        // 2. BOMBA PATLAT (Dünyayı o noktaya çevir ve halka oluştur)
        triggerExplosion(currentQuestion.lat, currentQuestion.lng);

        // 3. Biraz uzun beklet (efekti görsün), sonra yeni soru
        setTimeout(() => {
            healthBar.style.backgroundColor = "#39ff39"; // Rengi düzelt
            loadQuestion();
        }, 3000);
    }
}

// =====================================
// 7. PATLAMA EFEKTİ (TRIGGER EXPLOSION)
// =====================================
function triggerExplosion(lat, lng) {
    // Kamerayı o konuma çevir
    world.pointOfView({ lat: lat, lng: lng, altitude: 2.5 }, 1000);

    // O konumda kırmızı halka verisi oluştur
    const explosionData = [{
        lat: lat,
        lng: lng
    }];

    // Globe'a veriyi gönder
    world.ringsData(explosionData);
}

// =====================================
// 8. OYUNU BAŞLAT
// =====================================
setTimeout(loadQuestion, 1000);