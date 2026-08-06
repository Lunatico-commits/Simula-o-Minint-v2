import React, { useState, useEffect, useRef } from 'react';
import { askMININTAITutor } from '../services/apiService';
import { Sparkles, Send, Bot, User, BookOpen, ShieldCheck, Scale, RefreshCw, Mic, MicOff, AlertCircle, Volume2 } from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

export const AIChatTutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'tutor',
      text: 'Saudações, candidato! Sou o seu Tutor Virtual especialista no Concurso Público do Ministério do Interior de Angola (MININT).\n\nEm que posso ajudar hoje? Pode perguntar sobre os requisitos de admissão, leis dos ramos (PNA, SIC, SME, SP, SPCB), dicas de Língua Portuguesa ou resolução de dúvidas de exames anteriores! Também pode usar a sua voz tocando no microfone! 🎙️',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('O seu navegador não suporta reconhecimento de voz. Tente utilizar o Google Chrome.');
      setSpeechSupported(false);
      return;
    }

    try {
      setSpeechError(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = 'pt-AO'; // Português de Angola com fallback automático
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputQuery(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Acesso ao microfone negado. Por favor, permita o microfone nas definições do navegador.');
        } else if (event.error === 'no-speech') {
          setSpeechError('Nenhuma fala detetada. Tente falar mais perto do microfone.');
        } else if (event.error !== 'aborted') {
          setSpeechError('Erro no reconhecimento de voz. Tente novamente.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setSpeechError('Erro ao ativar o microfone. Verifique as permissões.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const quickPrompts = [
    'Quais são os requisitos gerais para o concurso do MININT?',
    'Diferença entre as atribuições da PNA e do SIC',
    'Qual a idade e altura mínima para o concurso?',
    'Dicas de estudo para Língua Portuguesa no concurso',
    'O que diz o Decreto Presidencial 152/19?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || loading) return;

    if (isListening) {
      stopListening();
    }

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    // Format chat history for Gemini API
    const history = messages
      .filter((m) => m.id !== 'init')
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: m.text,
      }));

    const replyText = await askMININTAITutor(text, history);

    const tutorMsg: ChatMessage = {
      id: `t_${Date.now()}`,
      sender: 'tutor',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, tutorMsg]);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 text-slate-900 dark:text-slate-100 flex flex-col h-[calc(100vh-140px)]">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#16181D] dark:to-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-center shadow-md dark:shadow-2xl mb-3 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-1 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Sparkles size={20} />
        </div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Tutor de IA • Preparação MININT</h2>
        <p className="text-[10px] text-slate-600 dark:text-slate-400">
          Tire dúvidas sobre Legislação, Língua Portuguesa, Informática Básica e Conteúdo Geral do Concurso.
        </p>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 text-[11px] shrink-0 no-scrollbar">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0F1115] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-300 whitespace-nowrap transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-2xl p-4 overflow-y-auto space-y-3.5 mb-3 shadow-inner">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                m.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-100 dark:bg-[#16181D] border border-amber-500/30 text-amber-600 dark:text-amber-500'
              }`}
            >
              {m.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
            </div>

            <div
              className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-semibold rounded-tr-none'
                  : 'bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-tl-none whitespace-pre-line shadow-sm'
              }`}
            >
              <p>{m.text}</p>
              <span
                className={`block text-[9px] mt-1 text-right font-mono ${
                  m.sender === 'user' ? 'text-slate-950/80 font-bold' : 'text-slate-500'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#16181D] border border-amber-500/30 text-amber-500 flex items-center justify-center text-xs animate-spin">
              <Sparkles size={15} />
            </div>
            <div className="bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 rounded-xl p-3 text-xs flex items-center gap-2 shadow-sm">
              <RefreshCw size={14} className="animate-spin text-amber-500" />
              <span>O Tutor IA está a consultar a legislação de Angola...</span>
            </div>
          </div>
        )}
      </div>

      {/* Speech Error Banner */}
      {speechError && (
        <div className="mb-2 p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-[11px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-rose-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Listening Banner Status */}
      {isListening && (
        <div className="mb-2 p-2.5 bg-amber-500/15 border border-amber-500/40 text-amber-400 rounded-xl text-xs flex items-center justify-between gap-2 shadow-md animate-pulse">
          <div className="flex items-center gap-2 font-bold">
            <Volume2 size={16} className="text-amber-400 animate-bounce" />
            <span>🎙️ A ouvir a sua pergunta em Português... Fale agora!</span>
          </div>
          <button
            type="button"
            onClick={stopListening}
            className="text-[10px] bg-rose-600 hover:bg-rose-500 text-white font-black px-2 py-1 rounded-md uppercase tracking-wider cursor-pointer"
          >
            Parar
          </button>
        </div>
      )}

      {/* Input Field with Mic Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2 shrink-0 items-center"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isListening
                ? 'A gravar a sua voz...'
                : 'Escreva ou use o microfone para perguntar...'
            }
            className={`w-full bg-white dark:bg-[#0F1115] border rounded-xl pl-4 pr-11 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-medium shadow-sm transition-all ${
              isListening ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-200 dark:border-white/10'
            }`}
          />

          {/* Microphone Button Inside Input Field */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={!speechSupported || loading}
            title={
              !speechSupported
                ? 'Reconhecimento de voz não suportado neste navegador'
                : isListening
                ? 'Parar gravação'
                : 'Ativar ditado por voz (SpeechToText)'
            }
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_12px_rgba(225,29,72,0.8)]'
                : speechSupported
                ? 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/10'
                : 'text-slate-600 cursor-not-allowed opacity-40'
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="w-12 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-black flex items-center justify-center font-bold shadow-lg shadow-amber-600/20 disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

