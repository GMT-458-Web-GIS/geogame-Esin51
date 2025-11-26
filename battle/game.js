const canvas = document.getElementById("world-canvas");
const ctx = canvas.getContext("2d");

let worldImg = new Image();
worldImg.src = "../assets/world_clean.png";

let rotation = 0;
let reflectionPulse = 0; 
let pulseActive = false;

/* Dünya çizimi */
function drawWorld() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // yavaş dönüş
    rotation += 0.0008;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation);
    ctx.drawImage(worldImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ctx.restore();

    // reflection pulse (düşman ölünce)
    if (pulseActive) {
        reflectionPulse -= 0.02;
        if (reflectionPulse <= 0) {
            pulseActive = false;
            reflectionPulse = 0;
        }

        ctx.fillStyle = `rgba(0,255,150,${reflectionPulse})`;
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, Math.PI*2);
        ctx.fill();
    }

    requestAnimationFrame(drawWorld);
}

worldImg.onload = drawWorld;

/* Pulse tetikle */
export function enemyDeathPulse(color) {
    reflectionPulse = 0.4;
    pulseActive = true;
}
