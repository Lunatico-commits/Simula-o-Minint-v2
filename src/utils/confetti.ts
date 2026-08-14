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
  fireDuelVictoryFullScreenConfetti();
}

/**
 * Fullscreen multi-wave celebratory confetti animation with custom shapes (stars, circles, squares),
 * gold/amber MININT victory palette, and multi-angle cannons for Duel victories.
 */
export function fireDuelVictoryFullScreenConfetti() {
  try {
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
    safeConfetti({
      particleCount: 180,
      spread: 140,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.4 },
      colors: victoryColors,
      shapes: ['star', 'circle', 'square'],
      scalar: 1.2,
      zIndex: 99999,
      disableForReducedMotion: true,
    });

    // 2. Continuous multi-wave cannon sequence (Left & Right dual fire + Center top rain)
    const duration = 3.8 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const progress = timeLeft / duration;
      const particleCount = Math.max(15, Math.floor(55 * progress));

      // Left corner cannon firing upward across the screen
      safeConfetti({
        particleCount,
        angle: 60,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0.02, y: 0.8 },
        colors: ['#f59e0b', '#fbbf24', '#fef08a', '#10b981', '#ffffff'],
        shapes: ['star', 'circle', 'square'],
        scalar: 1.1,
        zIndex: 99999,
        disableForReducedMotion: true,
      });

      // Right corner cannon firing upward across the screen
      safeConfetti({
        particleCount,
        angle: 120,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0.98, y: 0.8 },
        colors: ['#3b82f6', '#06b6d4', '#fbbf24', '#ec4899', '#ffffff'],
        shapes: ['star', 'circle', 'square'],
        scalar: 1.1,
        zIndex: 99999,
        disableForReducedMotion: true,
      });

      // Top shower cascade for full-screen coverage
      if (Math.random() > 0.4) {
        safeConfetti({
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
          zIndex: 99999,
          disableForReducedMotion: true,
        });
      }
    }, 240);
  } catch (err) {
    console.error('Erro ao disparar confetes de vitória em tela cheia:', err);
  }
}


