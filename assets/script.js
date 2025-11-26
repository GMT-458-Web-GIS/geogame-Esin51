/* --------------------------------------------------------
   PAGE SWITCHING
-------------------------------------------------------- */
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    // Starfield only on main page
    document.getElementById("starfield").style.display =
        id === "page-main" ? "block" : "none";
}

function goHowToPlay() {
    const name = document.getElementById("playerName").value.trim();
    if (!name) {
        alert("Please enter your name first.");
        return;
    }
    showPage("page-howto");
}

/* --------------------------------------------------------
   HERO SELECT
-------------------------------------------------------- */
let selectedHero = null;
const selectSound = document.getElementById("select-sfx");

document.addEventListener("click", (e) => {
    const box = e.target.closest(".char-box");
    if (!box) return;

    // Remove old selection
    document.querySelectorAll(".char-box").forEach(b => b.classList.remove("selected"));

    // Add new selection
    box.classList.add("selected");
    selectedHero = box.dataset.hero;

    // Play sound
    if (selectSound) {
        selectSound.currentTime = 0;
        selectSound.play().catch(()=>{});
    }
});

function confirmHero() {
    if (!selectedHero) {
        alert("Please select a hero first.");
        return;
    }

    // Save data for battle page
    const name = document.getElementById("playerName").value.trim() || "Player";
    localStorage.setItem("ps_playerName", name);
    localStorage.setItem("ps_selectedHero", selectedHero);

    // GO TO BATTLE PAGE
    window.location.href = "battle/index.html";
}

/* --------------------------------------------------------
   STARFIELD (A + D Versions Combined)
-------------------------------------------------------- */
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    const DPR = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * DPR;
    canvas.height = window.innerHeight * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let stars = [];
let shooting = [];

function initStars(count = 250) {
    stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 40 + Math.random() * 80,
            size: Math.random() * 2 + .5
        })
    }
}
initStars();

function newShootingStar() {
    shooting.push({
        x: Math.random() * canvas.width,
        y: -50,
        vx: -300 - Math.random()*200,
        vy: 300 + Math.random()*200,
        life: 0,
        maxLife: 1 + Math.random()*1.5
    });
}

let tOld = 0;
let timer = 0;
let nextStar = 1.5;

function loop(t) {
    let dt = (t - tOld) / 1000;
    tOld = t;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // normal stars
    ctx.fillStyle = "white";
    for (let s of stars) {
        s.y += s.speed * dt;
        if (s.y > canvas.height) {
            s.y = -5;
            s.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
        ctx.fill();
    }

    // shooting stars timer
    timer += dt;
    if (timer > nextStar) {
        newShootingStar();
        timer = 0;
        nextStar = 1 + Math.random()*2.5;
    }

    // draw shooting stars
    for (let i = shooting.length-1; i >= 0; i--) {
        let sh = shooting[i];
        sh.life += dt;
        if (sh.life > sh.maxLife) {
            shooting.splice(i,1);
            continue;
        }
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;

        let alpha = 1 - sh.life/sh.maxLife;
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx*0.15, sh.y - sh.vy*0.15);
        ctx.stroke();
    }

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
