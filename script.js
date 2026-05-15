const pageAudio = document.getElementById("page-audio");
const audioStatus = document.getElementById("audio-status");
const audioToggle = document.getElementById("audio-toggle");
const heroBadge = document.querySelector(".hero-badge");
const shield = document.querySelector(".shield");

function setAudioState(state) {
    if (state === "playing") {
        audioStatus.textContent = "Áudio tocando";
        audioToggle.textContent = "Bloquear áudio";
        return;
    }

    if (state === "blocked") {
        audioStatus.textContent = "Áudio bloqueado";
        audioToggle.textContent = "Ativar áudio";
        return;
    }

    audioStatus.textContent = "Áudio pausado";
    audioToggle.textContent = "Ativar áudio";
}

function playAudio() {
    pageAudio.volume = 0.55;
    const playAttempt = pageAudio.play();

    if (playAttempt !== undefined) {
        playAttempt
            .then(() => setAudioState("playing"))
            .catch(() => setAudioState("blocked"));
    }
}

audioToggle.addEventListener("click", () => {
    if (pageAudio.paused) {
        playAudio();
        return;
    }

    pageAudio.pause();
    setAudioState("paused");
});

pageAudio.addEventListener("play", () => setAudioState("playing"));
pageAudio.addEventListener("pause", () => setAudioState("paused"));

if (heroBadge && shield) {
    const tilt = {
        currentX: 0,
        currentY: 0,
        currentScale: 1,
        targetX: 0,
        targetY: 0,
        targetScale: 1,
        frame: null
    };

    function renderTilt() {
        tilt.currentX += (tilt.targetX - tilt.currentX) * 0.18;
        tilt.currentY += (tilt.targetY - tilt.currentY) * 0.18;
        tilt.currentScale += (tilt.targetScale - tilt.currentScale) * 0.18;

        shield.style.setProperty("--tilt-x", `${tilt.currentX.toFixed(2)}deg`);
        shield.style.setProperty("--tilt-y", `${tilt.currentY.toFixed(2)}deg`);
        shield.style.setProperty("--tilt-scale", tilt.currentScale.toFixed(3));

        const isSettled =
            Math.abs(tilt.targetX - tilt.currentX) < 0.01 &&
            Math.abs(tilt.targetY - tilt.currentY) < 0.01 &&
            Math.abs(tilt.targetScale - tilt.currentScale) < 0.001;

        if (!isSettled) {
            tilt.frame = requestAnimationFrame(renderTilt);
            return;
        }

        tilt.frame = null;
    }

    function startTilt() {
        if (!tilt.frame) {
            tilt.frame = requestAnimationFrame(renderTilt);
        }
    }

    heroBadge.addEventListener("pointermove", (event) => {
        const rect = heroBadge.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        tilt.targetX = -y * 16;
        tilt.targetY = x * 16;
        tilt.targetScale = 1.025;
        startTilt();
    });

    heroBadge.addEventListener("pointerleave", () => {
        tilt.targetX = 0;
        tilt.targetY = 0;
        tilt.targetScale = 1;
        startTilt();
    });
}

playAudio();
