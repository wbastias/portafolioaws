const robot = document.getElementById("robot");
const telon = document.querySelector(".capa-telon");
const audioTelon = new Audio("sonido/manivela.mp3"); // 👈 ESTA LÍNEA FALTABA

const posicionesRobot = [
    { src: "img/inicio.png", bottom: 0, left: -190, width: 310},
    { src: "img/arriba.png", bottom: 0, left: -165, width: 310 },
    { src: "img/haciadelante.png", bottom: 0, left: -175, width: 310 },
    { src: "img/abajo.png", bottom: 0, left: -150, width: 310 },
];

const contadorClicks = document.getElementById("contador-clicks");
let clicks = 0;
const maxClicks = 4;
let puedeClick = true;
let index = 0;

let pasoTelon = 0;
const maxPasosTelon = 4;

function aplicarEstado(i) {
    const estado = posicionesRobot[i];

    robot.src = estado.src;
    robot.style.width = estado.width + "px";
    robot.style.bottom = estado.bottom + "px";
    robot.style.left = estado.left + "px";
}

aplicarEstado(index);

robot.addEventListener("click", () => {
    if (!puedeClick) return;

    puedeClick = false;

    // ✅ SUMA CLICK
    if (clicks < maxClicks) {
        clicks++;
        contadorClicks.textContent = clicks + " / " + maxClicks;
    }

    index++;

    if (index >= posicionesRobot.length) {
        index = 0;
    }

    aplicarEstado(index);

    if (pasoTelon < maxPasosTelon) {
        pasoTelon++;
    }

    telon.className = "capa capa-telon paso-" + pasoTelon;

    // ✅ CUANDO LLEGA A 4, MUESTRA SOL Y LUNA
    if (clicks === maxClicks) {
        solyluna.classList.add("visible");
    }

    audioTelon.currentTime = 0;
    audioTelon.play();

    setTimeout(() => {
        audioTelon.pause();
        audioTelon.currentTime = 0;
        puedeClick = true;
    }, 2000);
});

const capaInfo = document.querySelector(".capa-info");
const capaViaje = document.querySelector(".capa-viaje");

let flotacion = 0;

function animarDialogos() {
    flotacion += 0.04;

    const movimientoInfo = Math.sin(flotacion) * 15;
    const movimientoViaje = Math.sin(flotacion + Math.PI) * 15;

    capaInfo.style.marginTop = movimientoInfo + "px";
    capaViaje.style.marginTop = movimientoViaje + "px";

    requestAnimationFrame(animarDialogos);
}

animarDialogos();

const btnReset = document.getElementById("btn-reset");

btnReset.addEventListener("click", () => {

    if (!puedeClick) return;

    puedeClick = false;

    const bajar = setInterval(() => {

        if (pasoTelon <= 0) {
            clearInterval(bajar);

            // reset final
            clicks = 0;
            contadorClicks.textContent = "0 / " + maxClicks;

            index = 0;
            aplicarEstado(index);

            puedeClick = true;
            return;
        }

        // 👇 baja un paso
        pasoTelon--;

        telon.className = "capa capa-telon paso-" + pasoTelon;

    }, 500); // 👈 velocidad de bajada
});

const solyluna = document.getElementById("solyluna");

solyluna.addEventListener("click", () => {
    if (clicks === maxClicks) {
        window.location.href = "porta.html";
    } else {
        solyluna.classList.add("click-anim");

        setTimeout(() => {
            solyluna.classList.remove("click-anim");
        }, 150);
    }
});

