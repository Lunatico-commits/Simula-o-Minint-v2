import confetti from 'canvas-confetti';

// Safe instance without worker issues
const safeConfetti = typeof confetti.create === 'function'
  ? confetti.create(undefined, { resize: true, useWorker: false })
  : confetti;

/**
 * Standard celebratory canvas confetti burst.
 */
export function fireConfetti() {
  try {
    safeConfetti({
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
    // Initial big burst
    safeConfetti({
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
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);

      // Left cannon
      safeConfetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0.05, y: 0.75 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#10b981'],
        disableForReducedMotion: true,
      });

      // Right cannon
      safeConfetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 0.95, y: 0.75 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#ef4444'],
        disableForReducedMotion: true,
      });
    }, 300);
  } catch (err) {
    console.error('Erro ao disparar confetes de graduação:', err);
  }
}

/**
 * Custom full-screen celebratory confetti sequence for PvP "Vitória de Honra" duels!
 */
export function fireHonorVictoryConfetti() {
  try {
    // Initial multi-burst from center and sides
    safeConfetti({
      particleCount: 160,
      spread: 120,
      origin: { y: 0.45 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#10b981', '#3b82f6', '#ec4899', '#ffffff'],
      disableForReducedMotion: true,
    });

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 45 * (timeLeft / duration);

      // Left side streamer
      safeConfetti({
        particleCount,
        angle: 60,
        spread: 60,
        origin: { x: 0.08, y: 0.65 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#ffffff'],
        disableForReducedMotion: true,
      });

      // Right side streamer
      safeConfetti({
        particleCount,
        angle: 120,
        spread: 60,
        origin: { x: 0.92, y: 0.65 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#ffffff'],
        disableForReducedMotion: true,
      });
    }, 280);
  } catch (err) {
    console.error('Erro ao disparar confetes da Vitória de Honra:', err);
  }
}

