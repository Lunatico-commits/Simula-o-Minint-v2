import React, { useState } from 'react';
import { Megaphone, X, Check, Code, Key, ShieldCheck, AlertCircle } from 'lucide-react';
import { validateAdScript, validateAdsterraKey, syncAdSenseToHead } from '../lib/adSanitizer';

interface AdConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const AdConfigModal: React.FC<AdConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [adScript, setAdScript] = useState(() => {
    return localStorage.getItem('minint_ad_script') || '';
  });
  const [adsterraKey, setAdsterraKey] = useState(() => {
    return localStorage.getItem('minint_adsterra_key') || '';
  });
  const [activeTab, setActiveTab] = useState<'script' | 'key'>('script');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setValidationError(null);

    if (adsterraKey.trim()) {
      const keyVal = validateAdsterraKey(adsterraKey);
      if (!keyVal.isValid) {
        setValidationError(keyVal.error || 'Key do Adsterra inválida.');
        return;
      }
    }

    if (adScript.trim()) {
      const scriptVal = validateAdScript(adScript);
      if (!scriptVal.isValid) {
        setValidationError(scriptVal.error || 'Script bloqueado por segurança.');
        return;
      }
    }

    localStorage.setItem('minint_ad_script', adScript.trim());
    localStorage.setItem('minint_adsterra_key', adsterraKey.trim());

    if (adScript.trim()) {
      syncAdSenseToHead(adScript.trim());
    }

    setSavedSuccess(true);

    if (onSaved) onSaved();

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setAdScript('');
    setAdsterraKey('');
    setValidationError(null);
    localStorage.removeItem('minint_ad_script');
    localStorage.removeItem('minint_adsterra_key');
    if (onSaved) onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 text-slate-100 shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Megaphone size={24} />
          </div>
          <h3 className="text-base font-bold text-amber-400 uppercase tracking-tight">
            Configurar Anúncios de Monetização
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Adsterra • Google AdSense • Banners 320x50, Social Bar & Popunders
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('script')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'script'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code size={14} />
            <span>Script HTML/JS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('key')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'key'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key size={14} />
            <span>Key Adsterra</span>
          </button>
        </div>

        {validationError && (
          <div className="p-3 mb-4 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Aviso de Segurança:</p>
              <p className="text-[11px] text-rose-200 leading-tight">{validationError}</p>
            </div>
          </div>
        )}

        {activeTab === 'script' ? (
          <div className="space-y-2 mb-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cole aqui o Código do Script da sua Rede de Anúncios:
            </label>
            <textarea
              value={adScript}
              onChange={(e) => setAdScript(e.target.value)}
              placeholder={`<!-- Exemplo Adsterra ou Google Adsense -->\n<script type="text/javascript">\n  atOptions = {\n    'key' : '0123456789abcdef0123456789abcdef',\n    'format' : 'iframe',\n    'height' : 50,\n    'width' : 320,\n    'params' : {}\n  };\n</script>\n<script type="text/javascript" src="//www.highperformanceformat.com/0123456789abcdef0123456789abcdef/invoke.js"></script>`}
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 shadow-inner"
            />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              * Suporta scripts dinâmicos de Banners 320x50, Social Bar e Popunders do Adsterra ou Adsense.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Adsterra Direct Banner Key (32-caracteres):
              </label>
              <input
                type="text"
                value={adsterraKey}
                onChange={(e) => setAdsterraKey(e.target.value)}
                placeholder="Ex: 0123456789abcdef0123456789abcdef"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 shadow-inner"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              Ao introduzir a sua Key do Adsterra, o sistema vai gerar automaticamente o invocation script oficial 320x50 para monetizar as visualizações e cliques dos candidatos.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
          >
            Limpar
          </button>
          <div className="flex-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check size={14} className="text-slate-950" />
                  <span>Guardado!</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Activar Anúncios Reais</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
