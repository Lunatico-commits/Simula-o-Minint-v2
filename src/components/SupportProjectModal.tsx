import React, { useState } from 'react';
import { UserProfile } from '../types';
import { generateReferralCode } from '../utils/referral';
import { Coffee, Copy, Check, Sparkles, X, Smartphone, CreditCard, UserCheck, MessageCircle, ShieldCheck } from 'lucide-react';

interface SupportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export const SupportProjectModal: React.FC<SupportProjectModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const phoneExpress = '939606343';
  const ibanFormatted = 'AO06 0058 0000 0617 3873 1013 8';
  const ibanClean = 'AO06005800000617387310138';
  const accountHolder = 'António Edson Lima Pimentel';

  const userCode = currentProfile.referralCode || generateReferralCode(currentProfile.displayName || 'CANDIDATO');
  const whatsappNumber = '244939606343';
  const rawMessage = `Olá! Já fiz a minha contribuição para o Simulados MININT. O meu Código de Indicação é: ${userCode}. Segue o comprovativo para activação do Selo VIP.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(rawMessage)}`;

  const handleCopy = (textToCopy: string, fieldName: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-5 text-slate-100 shadow-[0_0_35px_rgba(245,158,11,0.25)] relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Header Visual */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Coffee size={30} className="animate-bounce" />
          </div>
          <h3 className="text-lg font-black text-amber-400 uppercase tracking-tight flex items-center justify-center gap-1.5">
            <span>Apoie o Simulados MININT</span>
            <span className="text-base">☕</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed px-2 font-medium">
            Este aplicativo é <strong className="text-emerald-400">100% gratuito</strong> e feito para ajudar os candidatos de Angola. Se o app te está a ajudar nos estudos, considera fazer um apoio voluntário de qualquer valor para nos ajudar a manter o projeto ativo!
          </p>
        </div>

        {/* Payment Details Container */}
        <div className="space-y-3 mb-4">
          {/* Item 1: Express / Unitel Money */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Smartphone size={18} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Multicaixa Express / Unitel Money
                </span>
                <span className="block text-sm font-mono font-bold text-slate-100 tracking-wider">
                  {phoneExpress}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(phoneExpress, 'express')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                copiedField === 'express'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
              }`}
            >
              {copiedField === 'express' ? (
                <>
                  <Check size={14} />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Item 2: IBAN */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                  <CreditCard size={18} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Número de IBAN (Transferência)
                  </span>
                  <span className="block text-xs font-mono font-bold text-amber-300 break-all">
                    {ibanFormatted}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(ibanClean, 'iban')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                  copiedField === 'iban'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                }`}
              >
                {copiedField === 'iban' ? (
                  <>
                    <Check size={14} />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Item 3: Titular */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <UserCheck size={18} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Titular da Conta
                </span>
                <span className="block text-xs font-bold text-slate-100 truncate">
                  {accountHolder}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(accountHolder, 'titular')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                copiedField === 'titular'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
              }`}
            >
              {copiedField === 'titular' ? (
                <>
                  <Check size={14} />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Benefits banner */}
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-300 font-semibold mb-3 text-center flex items-center justify-center gap-1.5">
          <Sparkles size={14} className="shrink-0 text-amber-400" />
          <span>Contribua com qualquer valor e ganhe a insígnia <strong className="text-amber-400">Apoiador VIP 🌟</strong></span>
        </div>

        {/* Informative Notice Box */}
        <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-2xl text-xs text-slate-300 mb-4 flex items-start gap-2.5 shadow-inner">
          <ShieldCheck size={18} className="shrink-0 text-amber-400 mt-0.5" />
          <div className="text-[11.5px] leading-relaxed">
            <span className="text-amber-300 font-bold block mb-0.5">Validação do Comprovativo:</span>
            <span>Após enviar o comprovativo no WhatsApp, o seu Selo VIP Apoiador será ativado após a validação.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 text-center"
          >
            <MessageCircle className="fill-slate-950" size={17} />
            <span>Já fiz a minha contribuição 💬</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
