import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Check, X, Music, Sparkles, Trophy, Award, CheckCircle2, XCircle, Shield, Sliders, Zap } from 'lucide-react';
import { 
  getSoundEnabled, 
  setSoundEnabled, 
  getSoundPack,
  setSoundPack,
  SoundPack,
  playClickSound, 
  playCorrectSound, 
  playIncorrectSound, 
  playQuizCompleteSound, 
  playVictorySound, 
  playDefeatSound,
  playLevelUpSound,
  playRelampagoTickSound
} from '../utils/audio';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOUND_PACKS: Array<{ id: SoundPack; title: string; subtitle: string; icon: React.FC<{ size?: number; className?: string }>; badge: string }> = [
  {
    id: 'arcade',
    title: 'Arcade / Gamificado',
    subtitle: 'Estilo retro com beeps divertidos',
    icon: Sparkles,
    badge: '🕹️ Retro'
  },
  {
    id: 'military',
    title: 'Militar / Concurso',
    subtitle: 'Sons marcantes e solenes',
    icon: Shield,
    badge: '🎖️ Solene'
  },
  {
    id: 'minimalist',
    title: 'Minimalista',
    subtitle: 'Sons curtos e discretos',
    icon: Music,
    badge: '🤫 Discreto'
  }
];

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const [enabled, setEnabled] = useState<boolean>(() => getSoundEnabled());
  const [currentPack, setCurrentPack] = useState<SoundPack>(() => getSoundPack());
  const [activeTesting, setActiveTesting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEnabled(getSoundEnabled());
      setCurrentPack(getSoundPack());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (nextVal: boolean) => {
    setEnabled(nextVal);
    setSoundEnabled(nextVal);
    if (nextVal) {
      playClickSound();
    }
  };

  const handleSelectPack = (pack: SoundPack) => {
    setSoundPack(pack);
    setCurrentPack(pack);
    if (enabled) {
      playCorrectSound();
    }
  };

  const triggerTest = (soundType: string, fn: () => void) => {
    if (!enabled) return;
    setActiveTesting(soundType);
    fn();
    setTimeout(() => {
      setActiveTesting(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Volume2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Efeitos Sonoros (Áudio)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ajusta, personaliza e testa o áudio da plataforma
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Master Toggle Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${enabled ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                  Sons Principais
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {enabled ? 'Sons ativados em toda a plataforma' : 'Todos os efeitos sonoros estão em silêncio'}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleToggle(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                enabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Pacote de Sons Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sliders size={13} className="text-amber-500" />
                Pacote de Sons
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                {SOUND_PACKS.find(p => p.id === currentPack)?.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {SOUND_PACKS.map((pack) => {
                const IconComp = pack.icon;
                const isSelected = currentPack === pack.id;
                return (
                  <button
                    key={pack.id}
                    disabled={!enabled}
                    onClick={() => handleSelectPack(pack.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                      !enabled
                        ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                        : isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        <IconComp size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs block">{pack.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {pack.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                          <Check size={12} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Sound Effects Section */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 block">
              Testar Efeitos Sonoros ({enabled ? 'Ativos' : 'Desativados'})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Correct */}
              <button
                disabled={!enabled}
                onClick={() => triggerTest('correct', playCorrectSound)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  !enabled
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    : activeTesting === 'correct'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Resposta Certa</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Som de confirmação</span>
                  </div>
                </div>
                <Play size={12} className="text-slate-400" />
              </button>

              {/* Incorrect */}
              <button
                disabled={!enabled}
                onClick={() => triggerTest('incorrect', playIncorrectSound)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  !enabled
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    : activeTesting === 'incorrect'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-rose-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Resposta Errada</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Som de aviso</span>
                  </div>
                </div>
                <Play size={12} className="text-slate-400" />
              </button>

              {/* Complete */}
              <button
                disabled={!enabled}
                onClick={() => triggerTest('complete', playQuizCompleteSound)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  !enabled
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    : activeTesting === 'complete'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Fim do Simulado</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Melodia de conclusão</span>
                  </div>
                </div>
                <Play size={12} className="text-slate-400" />
              </button>

              {/* Victory */}
              <button
                disabled={!enabled}
                onClick={() => triggerTest('victory', playVictorySound)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  !enabled
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    : activeTesting === 'victory'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-purple-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Vitória no Duelo</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Fanfarra de vitória</span>
                  </div>
                </div>
                <Play size={12} className="text-slate-400" />
              </button>

              {/* Defeat */}
              <button
                disabled={!enabled}
                onClick={() => triggerTest('defeat', playDefeatSound)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  !enabled
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    : activeTesting === 'defeat'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-rose-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Derrota no Duelo</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Som de derrota</span>
                  </div>
                </div>
                <Play size={12} className="text-slate-400" />
              </button>

              {/* Duelo Relâmpago Tic-Tac */}
              <button
                disabled={!enabled}
                onClick={() => triggerTest('relampago', () => playRelampagoTickSound(4, 30))}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all sm:col-span-2 ${
                  !enabled
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    : activeTesting === 'relampago'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-amber-500 shrink-0 animate-pulse" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Duelo Relâmpago (Tic-Tac)</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Alerta sonoro progressivo de tempo</span>
                  </div>
                </div>
                <Play size={12} className="text-slate-400" />
              </button>

              {/* Level Up */}
              <button
                disabled={!enabled}
                onClick={() => triggerTest('levelup', playLevelUpSound)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all sm:col-span-2 ${
                  !enabled
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    : activeTesting === 'levelup'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-blue-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Subir de Patente / Nível</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Chime de promoção</span>
                  </div>
                </div>
                <Play size={12} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Check size={14} />
            <span>Concluído</span>
          </button>
        </div>
      </div>
    </div>
  );
};

