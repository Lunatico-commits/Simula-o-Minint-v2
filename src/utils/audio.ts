// Web Audio API helper for quiz interaction sounds

export type SoundPack = 'arcade' | 'military' | 'minimalist';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('minint_sound_enabled');
  return saved === null ? true : saved === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('minint_sound_enabled', String(enabled));
}

export function getSoundPack(): SoundPack {
  if (typeof window === 'undefined') return 'arcade';
  const saved = localStorage.getItem('minint_sound_pack');
  if (saved === 'military' || saved === 'minimalist' || saved === 'arcade') {
    return saved;
  }
  return 'arcade';
}

export function setSoundPack(pack: SoundPack): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('minint_sound_pack', pack);
}

// --- SOUND GENERATORS BY PACK ---

export function playCorrectSound(): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const pack = getSoundPack();
    const now = ctx.currentTime;

    if (pack === 'arcade') {
      // 8-bit retro dual chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (pack === 'military') {
      // Dignified brass horn double chime
      const notes = [293.66, 440.00, 587.33]; // D4, A4, D5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.06;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.14, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.28);
      });
    } else {
      // Minimalist soft sine chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880.00, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playIncorrectSound(): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const pack = getSoundPack();
    const now = ctx.currentTime;

    if (pack === 'arcade') {
      // 8-bit retro pitch drop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (pack === 'military') {
      // Low filtered solemn thud
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Minimalist soft muted bump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playQuizCompleteSound(): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const pack = getSoundPack();
    const now = ctx.currentTime;

    if (pack === 'arcade') {
      // 8-bit Mario style chord
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.07;
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      });
    } else if (pack === 'military') {
      // Bugle call fanfare
      const notes = [293.66, 369.99, 440.00, 587.33]; // D4, F#4, A4, D5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.14, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } else {
      // Minimalist 3-note glass chime
      const notes = [659.25, 880.00, 1108.73]; // E5, A5, C#6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    }
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playVictorySound(): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const pack = getSoundPack();
    const now = ctx.currentTime;

    if (pack === 'arcade') {
      // Arcade chiptune victory sequence
      const notes = [440.00, 554.37, 659.25, 880.00, 1108.73]; // A4, C#5, E5, A5, C#6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.08;
        osc.type = idx === 4 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.09, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 4 ? 0.45 : 0.2));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + (idx === 4 ? 0.45 : 0.2));
      });
    } else if (pack === 'military') {
      // Grand military salute fanfare
      const notes = [293.66, 392.00, 493.88, 587.33]; // D4, G4, B4, D5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.1;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.16, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.55 : 0.3));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + (idx === 3 ? 0.55 : 0.3));
      });
    } else {
      // Minimalist major 7th chord chime
      const notes = [440.00, 554.37, 659.25, 830.61]; // A4, C#5, E5, G#5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    }
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playLevelUpSound(): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const pack = getSoundPack();
    const now = ctx.currentTime;

    if (pack === 'arcade') {
      // 8-bit power-up sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.28);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (pack === 'military') {
      // Solemn rank promotion chime
      const notes = [220.00, 329.63, 440.00, 554.37, 659.25]; // A3, E4, A4, C#5, E5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.14, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.38);
      });
    } else {
      // Minimalist dual-tone rise
      const notes = [587.33, 880.00]; // D5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.09;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    }
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playClickSound(): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const pack = getSoundPack();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (pack === 'arcade') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    } else if (pack === 'military') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.03);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.015);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (pack === 'military' ? 0.03 : pack === 'arcade' ? 0.025 : 0.015));
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playTickSound(secondsRemaining?: number): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Frequency increases slightly as seconds decrease (more urgent)
    const baseFreq = secondsRemaining !== undefined && secondsRemaining <= 3 ? 1200 : 800;
    const freq = secondsRemaining !== undefined ? baseFreq + (5 - Math.min(5, secondsRemaining)) * 100 : 800;

    osc.type = secondsRemaining !== undefined && secondsRemaining <= 3 ? 'square' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq / 2, now + 0.04);

    const volume = secondsRemaining !== undefined && secondsRemaining <= 3 ? 0.09 : 0.04;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playRelampagoTickSound(secondsRemaining: number, maxTime: number = 30): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const pack = getSoundPack();
    const now = ctx.currentTime;

    const isEven = secondsRemaining % 2 === 0;
    const progressRatio = Math.max(0, Math.min(1, 1 - (secondsRemaining / maxTime))); // 0 at start, 1 at end

    // Progressive pitch multiplier as time runs out
    const urgencyMultiplier = 1 + Math.pow(progressRatio, 1.8) * 1.25; 

    // Alternate between "TIC" (higher tone) and "TAC" (lower wood-click tone)
    const baseFreq = isEven ? 1080 : 820; // 'TIC' is 1080Hz, 'TAC' is 820Hz
    const freq = baseFreq * urgencyMultiplier;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (pack === 'arcade') {
      osc.type = secondsRemaining <= 5 ? 'square' : (isEven ? 'triangle' : 'sine');
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 0.045);

      const vol = secondsRemaining <= 5 ? 0.12 : (secondsRemaining <= 10 ? 0.08 : 0.05);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);

      // Add intense warning second layer under 5 seconds
      if (secondsRemaining <= 5) {
        const warningOsc = ctx.createOscillator();
        const warningGain = ctx.createGain();
        warningOsc.type = 'sawtooth';
        warningOsc.frequency.setValueAtTime(1400 + (5 - secondsRemaining) * 200, now);
        warningGain.gain.setValueAtTime(0.04, now);
        warningGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        warningOsc.connect(warningGain);
        warningGain.connect(ctx.destination);
        warningOsc.start(now);
        warningOsc.stop(now + 0.03);
      }
    } else if (pack === 'military') {
      osc.type = isEven ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq * 0.9, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, now + 0.035);

      const vol = secondsRemaining <= 5 ? 0.14 : 0.07;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.03);

      const vol = secondsRemaining <= 5 ? 0.09 : 0.04;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    }
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playDefeatSound(): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const pack = getSoundPack();
    const now = ctx.currentTime;

    if (pack === 'arcade') {
      const notes = [311.13, 293.66, 277.18, 261.63];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.1;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    } else if (pack === 'military') {
      const notes = [220.00, 196.00, 174.61, 146.83];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.12;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playRoundStartSound(): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const pack = getSoundPack();
    const now = ctx.currentTime;

    if (pack === 'arcade') {
      const notes = [440.00, 880.00];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.08;
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
      });
    } else if (pack === 'military') {
      const notes = [329.63, 440.00, 587.33];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.06;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}


