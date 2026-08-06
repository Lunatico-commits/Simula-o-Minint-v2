import React, { useState, useEffect } from 'react';
import { UserProfile, MININTBranch, Testimonial } from '../types';
import { PROVINCES_ANGOLA, MININT_BRANCHES } from '../data/branches';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { 
  HelpCircle, ChevronDown, ChevronUp, Star, MessageSquare, Plus, Send, CheckCircle2, Coffee, Shield, Sparkles, Users, Award, MapPin, Heart, FileText, ShieldCheck, Clock
} from 'lucide-react';
import { RequirementGuide } from './RequirementGuide';

interface FaqAndTestimonialsProps {
  profile: UserProfile;
  onOpenSupportModal?: () => void;
  initialSubTab?: 'faq' | 'guide' | 'testimonials';
}

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Mateus Manuel',
    province: 'Luanda',
    branch: 'PNA',
    rating: 5,
    comment: 'Excelente aplicativo! Os simulados de Legislação da PNA e da Constituição ajudaram-me imenso a consolidar os artigos. Consegui melhorar muito o meu tempo de resposta.',
    isVip: true,
    status: 'approved',
    date: 'Hoje',
  },
  {
    id: 't2',
    name: 'Esperança Canguya',
    province: 'Huambo',
    branch: 'SIC',
    rating: 5,
    comment: 'O Duelo 1v1 e o Tutor de IA para explicar os erros tornaram os meus estudos do Concurso do SIC muito mais motivadores. Recomendo a todos os candidatos!',
    isVip: false,
    status: 'approved',
    date: 'Ontem',
  },
  {
    id: 't3',
    name: 'Bernardo Kapapelo',
    province: 'Benguela',
    branch: 'SME',
    rating: 5,
    comment: 'O aplicativo é muito direto e não consome quase dados nenhuns no telemóvel. As perguntas sobre a legislação do SME estão super atualizadas.',
    isVip: true,
    status: 'approved',
    date: 'Há 2 dias',
  },
  {
    id: 't4',
    name: 'Nimi Antonio',
    province: 'Cabinda',
    branch: 'SPCB',
    rating: 5,
    comment: 'A funcionalidade de poder estudar por matérias como Raciocínio Lógico e Cultura Geral facilitou bastante. Já sou Apoiador VIP para ajudar o projeto!',
    isVip: true,
    status: 'approved',
    date: 'Há 3 dias',
  },
  {
    id: 't5',
    name: 'Julieta Ndongala',
    province: 'Huíla',
    branch: 'SP',
    rating: 5,
    comment: 'Muito prático para estudar no telemóvel no caminho do trabalho. Os simulados com tempo cronometrado dão a sensação real do exame de admissão.',
    isVip: false,
    status: 'approved',
    date: 'Há 4 dias',
  },
];

export const FaqAndTestimonials: React.FC<FaqAndTestimonialsProps> = ({
  profile,
  onOpenSupportModal,
  initialSubTab = 'faq',
}) => {
  const [subTab, setSubTab] = useState<'faq' | 'guide' | 'testimonials'>(initialSubTab);

  // FAQ Accordion expanded state (indexes of opened questions)
  const [openFaqIndexes, setOpenFaqIndexes] = useState<number[]>([0, 1]);

  // Testimonials state
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('minint_user_testimonials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...parsed, ...INITIAL_TESTIMONIALS];
      } catch (e) {
        return INITIAL_TESTIMONIALS;
      }
    }
    return INITIAL_TESTIMONIALS;
  });

  // New feedback form modal/state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [fbName, setFbName] = useState(profile.displayName || '');
  const [fbProvince, setFbProvince] = useState(profile.province || 'Luanda');
  const [fbBranch, setFbBranch] = useState<MININTBranch>(profile.branch || 'PNA');
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState('');
  const [fbSubmitted, setFbSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync testimonials from Firestore on mount
  useEffect(() => {
    const fetchRemoteTestimonials = async () => {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(30));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const remote: Testimonial[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            remote.push({
              id: docSnap.id,
              name: data.name || 'Candidato MININT',
              province: data.province || 'Luanda',
              branch: data.branch || 'PNA',
              rating: data.rating || 5,
              comment: data.comment || '',
              isVip: data.isVip || false,
              status: data.status || 'approved',
              date: 'Recente',
            });
          });
          setTestimonialsList((prev) => {
            const ids = new Set(prev.map(t => t.id));
            const newRemote = remote.filter(r => !ids.has(r.id));
            return [...newRemote, ...prev];
          });
        }
      } catch (err) {
        // Fallback to local
      }
    };
    fetchRemoteTestimonials();
  }, []);

  const toggleFaq = (index: number) => {
    if (openFaqIndexes.includes(index)) {
      setOpenFaqIndexes(openFaqIndexes.filter((i) => i !== index));
    } else {
      setOpenFaqIndexes([...openFaqIndexes, index]);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbComment.trim()) return;

    setSubmitting(true);

    const newEntry: Testimonial = {
      id: `fb_${Date.now()}`,
      name: fbName.trim() || 'Candidato MININT',
      province: fbProvince,
      branch: fbBranch,
      rating: fbRating,
      comment: fbComment.trim(),
      isVip: profile.isVipSupporter || false,
      status: 'pending',
      date: 'Agora',
    };

    // 1. Local update
    const updated = [newEntry, ...testimonialsList];
    setTestimonialsList(updated);

    const customOnly = updated.filter((t) => t.id.startsWith('fb_'));
    localStorage.setItem('minint_user_testimonials', JSON.stringify(customOnly));

    // 2. Remote update (Firestore with status: 'pending')
    try {
      await addDoc(collection(db, 'testimonials'), {
        name: newEntry.name,
        province: newEntry.province,
        branch: newEntry.branch,
        rating: newEntry.rating,
        comment: newEntry.comment,
        isVip: newEntry.isVip,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Fallback to local storage for feedback:', err);
    }

    setSubmitting(false);
    setFbSubmitted(true);
    setTimeout(() => {
      setFbSubmitted(false);
      setShowFeedbackModal(false);
      setFbComment('');
    }, 2800);
  };

  const FAQ_ITEMS = [
    {
      q: 'O aplicativo é 100% gratuito?',
      a: 'Sim! O Simulados MININT é 100% gratuito para todos os candidatos em Angola. Pode aceder aos simulados, banco de questões, tutor com Inteligência Artificial e duelos multiplayer sem nenhum custo. A plataforma é mantida através de contribuições voluntárias e anúncios não intrusivos.',
    },
    {
      q: 'Como funcionam os Duelos 1v1 e o Ranking?',
      a: 'Nos Duelos 1v1, disputa partidas rápidas de 5 perguntas contra outros candidatos em tempo real ou bots de treino. Cada resposta correta gera Pontos de Experiência (XP). O acúmulo de XP permite subir nas Patentes Orgânicas do MININT (Agente, Sub-Inspector, Inspector, Superintendente) e disputar as melhores posições do Ranking Semanal.',
    },
    {
      q: 'Quais são os órgãos do MININT contemplados nos simulados?',
      a: 'O aplicativo contempla explicitamente todos os 5 órgãos executivos do Ministério do Interior de Angola: Polícia Nacional de Angola (PNA), Serviço de Investigação Criminal (SIC), Serviço de Migração e Estrangeiros (SME), Serviço Penitenciário (SP) e Serviço de Protecção Civil e Bombeiros (SPCB).',
    },
    {
      q: 'Como posso apoiar a plataforma?',
      a: 'Pode apoiar o projeto com qualquer valor voluntário através de Multicaixa Express (939606343) ou Transferência IBAN. Ao fazer a sua contribuição, recebe a insígnia de Apoiador VIP 🌟 que fica visível no seu perfil e no Ranking!',
      hasDonateBtn: true,
    },
    {
      q: 'Quais são as matérias de estudo disponíveis?',
      a: 'Os simulados cobrem as matérias exigidas nos exames oficiais de admissão do MININT: Legislação Orgânica do MININT & Constituição da República de Angola (CRA), Língua Portuguesa, Cultura Geral & História de Angola, Raciocínio Lógico & Matemática e Direito Penal & Processual.',
    },
  ];

  return (
    <div className="space-y-4 p-3 animate-fadeIn">
      {/* Sub-Header Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-1.5 flex gap-1 text-[11px] font-bold shadow-md">
        <button
          onClick={() => setSubTab('faq')}
          className={`flex-1 py-2 px-1.5 rounded-2xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
            subTab === 'faq'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle size={14} className="shrink-0" />
          <span className="truncate">Dúvidas/FAQ</span>
        </button>

        <button
          onClick={() => setSubTab('guide')}
          className={`flex-1 py-2 px-1.5 rounded-2xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
            subTab === 'guide'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck size={14} className="shrink-0" />
          <span className="truncate">Requisitos</span>
        </button>

        <button
          onClick={() => setSubTab('testimonials')}
          className={`flex-1 py-2 px-1.5 rounded-2xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
            subTab === 'testimonials'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare size={14} className="shrink-0" />
          <span className="truncate">Depoimentos ({testimonialsList.length})</span>
        </button>
      </div>

      {/* TAB 1: REQUISITOS GUIDE */}
      {subTab === 'guide' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-1">
          <RequirementGuide />
        </div>
      )}

      {/* TAB 2: FAQ ACCORDION */}
      {subTab === 'faq' && (
        <div className="space-y-3">
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3.5 text-center space-y-1">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-tight flex items-center justify-center gap-1.5">
              <HelpCircle size={18} />
              <span>Perguntas Frequentes do Concurso</span>
            </h3>
            <p className="text-xs text-slate-300">
              Esclareça as suas dúvidas principais sobre o funcionamento do aplicativo e a preparação para o MININT Angola.
            </p>
          </div>

          <div className="space-y-2">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndexes.includes(idx);
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-2 font-bold text-xs text-slate-100 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <span className="leading-snug">{item.q}</span>
                    <div className="p-1 rounded-lg bg-slate-800 text-amber-400 shrink-0">
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-300 border-t border-slate-800/60 leading-relaxed animate-fadeIn">
                      <p>{item.a}</p>
                      {item.hasDonateBtn && onOpenSupportModal && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={onOpenSupportModal}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                          >
                            <Coffee size={14} />
                            <span>Apoiar o Projeto ☕</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DEPOIMENTOS DOS CANDIDATOS */}
      {subTab === 'testimonials' && (
        <div className="space-y-3">
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-tight flex items-center gap-1.5">
                <Users size={18} />
                <span>O Que Dizem os Candidatos</span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Avaliações reais de candidatos de várias províncias de Angola.
              </p>
            </div>

            <button
              onClick={() => setShowFeedbackModal(true)}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-all shadow-md cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>Deixar Feedback</span>
            </button>
          </div>

          {/* Testimonials Grid / List */}
          <div className="space-y-2.5">
            {testimonialsList
              .filter((item) => !item.status || item.status === 'approved' || item.status === 'pending')
              .map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs space-y-2 hover:border-amber-500/30 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black flex items-center justify-center shrink-0">
                      {item.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-100 truncate">{item.name}</span>
                        {item.isVip && (
                          <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black flex items-center gap-0.5">
                            <Sparkles size={8} className="fill-amber-400" />
                            <span>VIP 🌟</span>
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                            <Clock size={8} />
                            <span>Pendente de Aprovação</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {item.province} • Órgão: <strong className="text-amber-400">{item.branch}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  "{item.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEEDBACK SUBMISSION MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-5 text-slate-100 shadow-[0_0_35px_rgba(245,158,11,0.25)] relative my-auto">
            <h3 className="text-base font-black text-amber-400 uppercase tracking-tight flex items-center gap-2 mb-1">
              <MessageSquare size={18} />
              <span>Enviar Feedback do Candidato</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              A sua opinião ajuda-nos a melhorar os simulados para os concursos do MININT em toda Angola!
            </p>

            {fbSubmitted ? (
              <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-2 animate-bounce">
                <CheckCircle2 className="mx-auto text-amber-400" size={36} />
                <h4 className="text-sm font-bold text-amber-300">Depoimento Submetido com Sucesso!</h4>
                <p className="text-xs text-slate-300">
                  O seu depoimento foi enviado e está <strong>aguardando aprovação pelo administrador</strong> para ser publicado.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Seu Nome / Apelido *</label>
                  <input
                    type="text"
                    required
                    value={fbName}
                    onChange={(e) => setFbName(e.target.value)}
                    placeholder="Ex: Manuel Silva"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Província *</label>
                    <select
                      value={fbProvince}
                      onChange={(e) => setFbProvince(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 font-semibold"
                    >
                      {PROVINCES_ANGOLA.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Órgão Alvo *</label>
                    <select
                      value={fbBranch}
                      onChange={(e) => setFbBranch(e.target.value as MININTBranch)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 font-semibold"
                    >
                      <option value="PNA">PNA (Polícia)</option>
                      <option value="SIC">SIC (Investigação)</option>
                      <option value="SME">SME (Migração)</option>
                      <option value="SP">SP (Penitenciário)</option>
                      <option value="SPCB">SPCB (Bombeiros)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Classificação (1 a 5 estrelas)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFbRating(star)}
                        className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          fbRating >= star
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-slate-950 border-slate-800 text-slate-600'
                        }`}
                      >
                        <Star size={18} className={fbRating >= star ? 'fill-amber-400' : ''} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Sua Opinião / Mensagem *</label>
                  <textarea
                    required
                    value={fbComment}
                    onChange={(e) => setFbComment(e.target.value)}
                    rows={3}
                    placeholder="Escreva como o aplicativo te está a ajudar no concurso do MININT..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>{submitting ? 'A Enviar...' : 'Publicar Feedback'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
