function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    // starfield sadece main ekranda gözüksün
    const starCanvas = document.getElementById("starfield");
    starCanvas.style.display = (id === "page-main") ? "block" : "none";
}

function goHowToPlay() {
    const name = document.getElementById("playerName").value.trim();
    if (!name) return alert("Enter your name first!");
    showPage("page-howto");
}

/* ----------------------------------------
   CHARACTER SELECT + WHITE GLOW
----------------------------------------- */

let selectedHero = null;
const selectedText = document.getElementById("heroSelectedText");

document.querySelectorAll(".char-box").forEach(box => {
    box.addEventListener("click", () => {

        // ses aç
        const selectSfx = document.getElementById("select-sfx");
        if (selectSfx) {
            selectSfx.currentTime = 0;
            selectSfx.play().catch(()=>{});
        }

        // diğerlerini kaldır
        document.querySelectorAll(".char-box").forEach(b => b.classList.remove("selected"));

        // seç
        box.classList.add("selected");
        selectedHero = box.dataset.hero;

        // ekranda yazı göster
        showSelectedHeroText(selectedHero);
    });
});

function showSelectedHeroText(name) {
    selectedText.innerHTML = `${name.toUpperCase()} SELECTED`;
    selectedText.style.opacity = 1;
    selectedText.style.transform = "translateX(-50%) translateY(0)";

    setTimeout(() => {
        selectedText.style.opacity = 0;
        selectedText.style.transform = "translateX(-50%) translateY(-10px)";
    }, 1600);
}

function confirmHero() {
    if (!selectedHero) return alert("Please select a hero!");
    alert("Hero locked: " + selectedHero);
}

/* ----------------------------------------
   STARFIELD
----------------------------------------- */

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let stars = [];
let shootingStars = [];
let lastTime = 0;

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createStars(count) {
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
createStars(250);

let shootingTimer = 0;
let nextShooting = 1.5 + Math.random() * 2.5;

functi
