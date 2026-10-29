// Baby Shower de Isabella — CDMX, domingo 29 de noviembre de 2026 a la 1:00 p. m.
const eventDate = new Date('2026-11-29T13:00:00-06:00');
const byId = (id) => document.getElementById(id);

// Animaciones al aparecer en pantalla; respaldo para navegadores sin IntersectionObserver.
const reveals = document.querySelectorAll('.reveal:not(.visible)');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('visible'));
}

// Cuenta regresiva.
function updateCountdown() {
  const remaining = eventDate.getTime() - Date.now();
  if (remaining <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach((id) => { if (byId(id)) byId(id).textContent = '00'; });
    if (byId('countdownNote')) byId('countdownNote').textContent = '¡Hoy celebramos! Gracias por acompañarnos ♡';
    return;
  }
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  [['days', days], ['hours', hours], ['minutes', minutes], ['seconds', seconds]].forEach(([id, value]) => {
    if (byId(id)) byId(id).textContent = String(value).padStart(2, '0');
  });
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

// Melodía de cuna original, sintetizada en el navegador: no requiere MP3 ni utiliza una canción comercial.
// En iPhone/Safari el audio comienza después de que la persona toca el botón.
const musicButton = byId('music');
const musicLabel = byId('musicLabel');
let audioContext = null;
let musicTimer = null;
let musicOn = false;
let noteIndex = 0;
// Melodía original en una escala suave; cada nota tiene duración de medio compás.
const lullaby = [523.25, 659.25, 587.33, 523.25, 392.00, 440.00, 523.25, 493.88,
                 440.00, 392.00, 349.23, 392.00, 440.00, 523.25, 440.00, 392.00];
const bassNotes = [261.63, 220.00, 196.00, 220.00];
function playTone(frequency, startAt, duration, volume, type = 'sine') {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.12);
  gain.gain.setValueAtTime(volume, startAt + Math.max(0.15, duration - 0.18));
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}
function playLullabyStep() {
  if (!audioContext || !musicOn) return;
  const now = audioContext.currentTime + 0.02;
  const note = lullaby[noteIndex % lullaby.length];
  playTone(note, now, 0.95, 0.045, 'sine');
  // Una nota grave suave cada cuatro pasos crea un acompañamiento original.
  if (noteIndex % 4 === 0) {
    const bass = bassNotes[Math.floor(noteIndex / 4) % bassNotes.length];
    playTone(bass, now, 1.65, 0.018, 'triangle');
  }
  noteIndex += 1;
}
async function toggleMusic() {
  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Audio no disponible');
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === 'suspended') await audioContext.resume();
    musicOn = !musicOn;
    if (musicOn) {
      playLullabyStep();
      musicTimer = window.setInterval(playLullabyStep, 760);
      musicLabel.textContent = 'Pausar canción';
      musicButton.setAttribute('aria-label', 'Pausar canción de cuna');
      musicButton.setAttribute('aria-pressed', 'true');
    } else {
      window.clearInterval(musicTimer);
      musicTimer = null;
      musicLabel.textContent = 'Canción de cuna';
      musicButton.setAttribute('aria-label', 'Reproducir canción de cuna');
      musicButton.setAttribute('aria-pressed', 'false');
    }
  } catch (error) {
    alert('Tu navegador no pudo iniciar el audio. Intenta de nuevo tocando el botón de canción de cuna.');
  }
}
musicButton?.addEventListener('click', toggleMusic);
