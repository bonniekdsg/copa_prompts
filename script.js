const pageAudio = document.getElementById("page-audio");
const audioStatus = document.getElementById("audio-status");
const audioToggle = document.getElementById("audio-toggle");
const heroBadge = document.querySelector(".hero-badge");
const shield = document.querySelector(".shield");
const backToHero = document.getElementById("back-to-hero");
const heroSection = document.getElementById("topo");

function setAudioState(state) {
    if (state === "playing") {
        audioStatus.innerHTML = 'ÁUDIO <strong>LIGADO</strong>';
        return;
    }

    if (state === "blocked") {
        audioStatus.innerHTML = 'ÁUDIO <strong>BLOQUEADO</strong>';
        return;
    }

    audioStatus.innerHTML = 'ÁUDIO <strong>PAUSADO</strong>';
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

if (backToHero && heroSection) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function getScrollTop() {
        const scroller = document.scrollingElement || document.documentElement;
        return scroller.scrollTop || window.scrollY || document.body.scrollTop || 0;
    }

    function updateBackToHeroVisibility() {
        const triggerPoint = Math.max(260, heroSection.offsetHeight * 0.7);
        backToHero.classList.toggle("is-visible", getScrollTop() > triggerPoint);
    }

    backToHero.addEventListener("click", () => {
        heroSection.scrollIntoView({
            behavior: reducedMotion.matches ? "auto" : "smooth",
            block: "start"
        });
    });

    window.addEventListener("scroll", updateBackToHeroVisibility, { passive: true });
    window.addEventListener("resize", updateBackToHeroVisibility);
    document.addEventListener("scroll", updateBackToHeroVisibility, { passive: true });
    updateBackToHeroVisibility();
}

playAudio();
