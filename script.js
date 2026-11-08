// Simple three-page invitation — no email collection or email sending.
// The Yes button takes Mou directly to the Thank You page.

const pages = {
  welcome: document.getElementById("welcome-page"),
  invite: document.getElementById("invite-page"),
  thanks: document.getElementById("thanks-page")
};

function showPage(pageName) {
  Object.values(pages).forEach(page => page.classList.remove("active"));
  pages[pageName].classList.add("active");
}

document.getElementById("continue-btn").addEventListener("click", () => showPage("invite"));

const frame = document.getElementById("button-frame");
const noButton = document.getElementById("no-btn");
const hint = document.getElementById("hint");

function moveNoButton() {
  const maxX = Math.max(0, frame.clientWidth - noButton.offsetWidth - 12);
  const maxY = Math.max(0, frame.clientHeight - noButton.offsetHeight - 12);
  const x = 6 + Math.random() * maxX;
  const y = 6 + Math.random() * maxY;
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
  hint.textContent = "Hehe, that button is a little shy! Try the Yes button 😉";
}

noButton.addEventListener("mouseenter", moveNoButton);
noButton.addEventListener("focus", moveNoButton);
noButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton();
}, { passive: false });
noButton.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
});

document.getElementById("yes-btn").addEventListener("click", () => {
  showPage("thanks");
});


// A soft original ambient melody made with the browser's Web Audio API.
// Browsers require a user gesture before sound can start; use the music button.
const musicButton = document.getElementById("music-toggle");
let audioContext = null;
let musicTimer = null;
let musicStep = 0;
let musicPlaying = false;

const melody = [60, 64, 67, 72, 67, 64, 62, 65, 69, 74, 69, 65, 60, 64, 67, 71];
const noteFrequency = midi => 440 * Math.pow(2, (midi - 69) / 12);

function playSoftNote(midi, startTime, duration, volume, wave = "sine") {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(noteFrequency(midi), startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.04);
}

function playMusicBeat() {
  if (!audioContext || !musicPlaying) return;
  const now = audioContext.currentTime;
  const note = melody[musicStep % melody.length];
  playSoftNote(note, now, 1.8, 0.035, "sine");

  // Quiet, warm chord tones underneath the melody.
  if (musicStep % 4 === 0) {
    playSoftNote(note - 12, now, 3.2, 0.012, "triangle");
    playSoftNote(note + 7, now, 2.8, 0.009, "sine");
  }
  musicStep += 1;
}

musicButton.addEventListener("click", async () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      musicButton.textContent = "Music unavailable in this browser";
      return;
    }
    audioContext = new AudioContextClass();
  }

  if (musicPlaying) {
    musicPlaying = false;
    window.clearInterval(musicTimer);
    musicTimer = null;
    await audioContext.suspend();
    musicButton.classList.remove("playing");
    musicButton.setAttribute("aria-pressed", "false");
    musicButton.textContent = "♫ Play soft music";
  } else {
    await audioContext.resume();
    musicPlaying = true;
    playMusicBeat();
    musicTimer = window.setInterval(playMusicBeat, 850);
    musicButton.classList.add("playing");
    musicButton.setAttribute("aria-pressed", "true");
    musicButton.textContent = "Ⅱ Pause music";
  }
});
