import confetti from 'canvas-confetti';

let confettiCanvas: HTMLCanvasElement | null = null;
let customConfettiInstance: ReturnType<typeof confetti.create> | null = null;
let activeConfettiIntervals: Array<ReturnType<typeof setInterval>> = [];

/**
 * Retrieves or initializes a dedicated fixed canvas element for confetti.
 * Ensures strict viewport containment (fixed, inset-0, z-9999, pointer-events-none)
 * so it never stretches the document layout or interferes with UI clicks.
 */
function getConfettiRunner() {
  if (typeof window === 'undefined') return null;

  try {
    if (!confettiCanvas || !document.body.contains(confettiCanvas)) {
      // Remove any leftover canvas with same ID
      const existing = document.getElementById('duel-confetti-canvas');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }

      confettiCanvas = document.createElement('canvas');
      confettiCanvas.id = 'duel-confetti-canvas';
      confettiCanvas.style.position = 'fixed';
      confettiCanvas.style.top = '0';
      confettiCanvas.style.left = '0';
      confettiCanvas.style.width = '100vw';
      confettiCanvas.style.height = '100vh';
      confettiCanvas.style.pointerEvents = 'none';
      confettiCanvas.style.zIndex = '9999';
      confettiCanvas.style.overflow = 'hidden';
      document.body.appendChild(confettiCanvas);

      if (typeof confetti.create === 'function') {
        customConfettiInstance = confetti.create(confettiCanvas, {
          resize: true,
          useWorker: false,
        });
      }
    }

    if (customConfettiInstance) {
      return customConfettiInstance;
    }
  } catch (err) {
    console.warn('[confetti] Fallback to global confetti:', err);
  }

  return confetti;
}

/**
 * Clears all active confetti animations, cancels timers, and removes the fixed canvas immediately.
 */
export function clearConfetti() {
  // Clear all running intervals
  activeConfettiIntervals.forEach((interval) => {
    try {
      clearInterval(interval);
    } catch (_) {}
  });
  activeConfettiIntervals = [];

  // Reset confetti instance
  try {
    if (customConfettiInstance && typeof customConfettiInstance.reset === 'function') {
      customConfettiInstance.reset();
    }
    if (typeof confetti.reset === 'function') {
      confetti.reset();
    }
  } catch (e) {}

  // Remove canvas if present
  if (confettiCanvas && document.body.contains(confettiCanvas)) {
    try {
      document.body.removeChild(confettiCanvas);
    } catch (e) {}
    confettiCanvas = null;
    customConfettiInstance = null;
  }
}

/**
 * Standard celebratory canvas confetti burst.
 */
export function fireConfetti() {
  try {
    const runner = getConfettiRunner();
    if (!runner) return;
    runner({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#10b981', '#3b82f6', '#ec4899', '#ffffff'],
      disableForReducedMotion: true,
    });
  } catch (err) {
    console.error('Erro ao disparar confetes:', err);
  }
}

/**
 * Grand dual-cannon fireworks confetti for Level Up & Rank Title Unlocks!
 */
export function fireRankUpConfetti() {
  try {
    const runner = getConfettiRunner();
    if (!runner) return;

    // Initial big burst
    runner({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#fbbf24', '#ffffff', '#10b981', '#ef4444'],
      disableForReducedMotion: true,
    });

    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        const idx = activeConfettiIntervals.indexOf(interval);
        if (idx !== -1) activeConfettiIntervals.splice(idx, 1);
        return;
      }

      const particleCount = 40 * (timeLeft / duration);

      // Left cannon
      runner({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0.05, y: 0.75 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#10b981'],
        disableForReducedMotion: true,
      });

      // Right cannon
      runner({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 0.95, y: 0.75 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#ef4444'],
        disableForReducedMotion: true,
      });
    }, 300);

    activeConfettiIntervals.push(interval);
  } catch (err) {
    console.error('Erro ao disparar confetes de graduação:', err);
  }
}

/**
 * Custom full-screen celebratory confetti sequence for PvP "Vitória de Honra" duels!
 */
export function fireHonorVictoryConfetti() {
  fireDuelVictoryFullScreenConfetti();
}

/**
 * Fullscreen multi-wave celebratory confetti animation with custom shapes (stars, circles, squares),
 * gold/amber MININT victory palette, and multi-angle cannons for Duel victories.
 */
export function fireDuelVictoryFullScreenConfetti() {
  try {
    const runner = getConfettiRunner();
    if (!runner) return;

    const victoryColors = [
      '#f59e0b', // Amber / Gold
      '#fbbf24', // Yellow Gold
      '#fef08a', // Light Yellow Gold
      '#10b981', // Emerald Green (Angolan / Merit)
      '#3b82f6', // MININT Police Blue
      '#8b5cf6', // Honor Purple
      '#ec4899', // Crimson / Rose
      '#ffffff', // Pure White Sparkle
      '#06b6d4', // Cyan Energy
    ];

    // 1. Initial explosive center starburst with high spread and custom shapes
    runner({
      particleCount: 180,
      spread: 140,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.4 },
      colors: victoryColors,
      shapes: ['star', 'circle', 'square'],
      scalar: 1.2,
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    // 2. Continuous multi-wave cannon sequence (Left & Right dual fire + Center top rain)
    const duration = 3.8 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        const idx = activeConfettiIntervals.indexOf(interval);
        if (idx !== -1) activeConfettiIntervals.splice(idx, 1);
        return;
      }

      const progress = timeLeft / duration;
      const particleCount = Math.max(15, Math.floor(55 * progress));

      // Left corner cannon firing upward across the screen
      runner({
        particleCount,
        angle: 60,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0.02, y: 0.8 },
        colors: ['#f59e0b', '#fbbf24', '#fef08a', '#10b981', '#ffffff'],
        shapes: ['star', 'circle', 'square'],
        scalar: 1.1,
        zIndex: 9999,
        disableForReducedMotion: true,
      });

      // Right corner cannon firing upward across the screen
      runner({
        particleCount,
        angle: 120,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0.98, y: 0.8 },
        colors: ['#3b82f6', '#06b6d4', '#fbbf24', '#ec4899', '#ffffff'],
        shapes: ['star', 'circle', 'square'],
        scalar: 1.1,
        zIndex: 9999,
        disableForReducedMotion: true,
      });

      // Top shower cascade for full-screen coverage
      if (Math.random() > 0.4) {
        runner({
          particleCount: 20,
          angle: 90,
          spread: 120,
          startVelocity: 25,
          origin: { x: Math.random() * 0.8 + 0.1, y: 0 },
          colors: victoryColors,
          shapes: ['circle', 'square', 'star'],
          gravity: 0.9,
          drift: (Math.random() - 0.5) * 1.5,
          scalar: 0.95,
          zIndex: 9999,
          disableForReducedMotion: true,
        });
      }
    }, 240);

    activeConfettiIntervals.push(interval);
  } catch (err) {
    console.error('Erro ao disparar confetes de vitória em tela cheia:', err);
  }
}
