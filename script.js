document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

const pageAudio = document.getElementById("page-audio");
const audioStatus = document.getElementById("audio-status");
const audioToggle = document.getElementById("audio-toggle");
const heroBadge = document.querySelector(".hero-badge");
const shield = document.querySelector(".shield");
const backToHero = document.getElementById("back-to-hero");
const heroSection = document.getElementById("topo");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let scrollAnimationFrame = null;

function getScrollTop() {
    const scroller = document.scrollingElement || document.documentElement;
    return scroller.scrollTop || window.scrollY || document.body.scrollTop || 0;
}

function setScrollTop(value) {
    const scroller = document.scrollingElement || document.documentElement;
    scroller.scrollTop = value;
    document.body.scrollTop = value;
    window.scrollTo(0, value);
}

function easeInOutCubic(progress) {
    return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function smoothScrollToElement(target, duration = 1250) {
    if (reducedMotion.matches) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        return;
    }

    if (scrollAnimationFrame) {
        cancelAnimationFrame(scrollAnimationFrame);
    }

    const scroller = document.scrollingElement || document.documentElement;
    const start = getScrollTop();
    const maxScroll = Math.max(0, scroller.scrollHeight - window.innerHeight);
    const end = Math.min(maxScroll, Math.max(0, start + target.getBoundingClientRect().top));
    const distance = end - start;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setScrollTop(start + distance * easeInOutCubic(progress));

        if (progress < 1) {
            scrollAnimationFrame = requestAnimationFrame(step);
            return;
        }

        scrollAnimationFrame = null;
    }

    scrollAnimationFrame = requestAnimationFrame(step);
}

function setAudioState(state) {
    audioToggle.classList.toggle("is-playing", state === "playing");

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
    function updateBackToHeroVisibility() {
        const triggerPoint = Math.max(260, heroSection.offsetHeight * 0.7);
        backToHero.classList.toggle("is-visible", getScrollTop() > triggerPoint);
    }

    backToHero.addEventListener("click", () => {
        smoothScrollToElement(heroSection, 1250);
    });

    window.addEventListener("scroll", updateBackToHeroVisibility, { passive: true });
    window.addEventListener("resize", updateBackToHeroVisibility);
    document.addEventListener("scroll", updateBackToHeroVisibility, { passive: true });
    updateBackToHeroVisibility();
}

document.querySelectorAll('.top-nav a[href^="#"]').forEach((link) => {
    const targetId = link.hash.slice(1);
    const target = document.getElementById(targetId);

    if (!target) {
        return;
    }

    link.addEventListener("click", (event) => {
        event.preventDefault();
        history.pushState(null, "", link.hash);
        smoothScrollToElement(target, 1350);
    });
});

const animatedSections = document.querySelectorAll(".content-section");

if (animatedSections.length) {
    if (reducedMotion.matches) {
        animatedSections.forEach((section) => section.classList.add("is-visible"));
    } else {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.32,
            rootMargin: "0px 0px -4% 0px"
        });

        animatedSections.forEach((section) => sectionObserver.observe(section));
    }
}

playAudio();
