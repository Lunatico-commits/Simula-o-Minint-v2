import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  FileText, 
  BookOpen, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  CreditCard, 
  Search, 
  Lock, 
  Check, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Gift, 
  ShoppingBag, 
  Star, 
  Copy,
  Tag,
  ExternalLink,
  Shield,
  BookMarked
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playCorrectSound } from '../utils/audio';

export interface StudyPDFItem {
  id: string;
  title: string;
  category: 'Legislação MININT' | 'Língua Portuguesa' | 'Cultura Geral & Informática' | 'Combo Especial';
  description: string;
  priceKz: number;
  pages: string;
  rating: number;
  reviewsCount: number;
  highlights: string[];
  isCombo?: boolean;
  colorTheme: {
    bgGrad: string;
    badgeBg: string;
    border: string;
    textAccent: string;
    iconBg: string;
  };
}

export const STUDY_PDFS: StudyPDFItem[] = [
  {
    id: 'pdf_combo_supremo',
    title: '💎 COMBO VIP: Todos os 7 PDFs + Simulados Bónus',
    category: 'Combo Especial',
    description: 'Pacote definitivo e completo para o Concurso do MININT. Inclui todos os 7 manuais de estudo em PDF (Legislação, Português, Cultura Geral & Informática) + Coletânea Especial de 500 Questões Resolvidas.',
    priceKz: 2500,
    pages: '7 Livros em PDF • 326 Páginas no Total',
    rating: 5.0,
    reviewsCount: 148,
    isCombo: true,
    highlights: [
      'Economize +1.400 Kz em relação à compra avulsa',
      'Acesso vitalício e atualizações gratuitas',
      'Legislação Orgânica do MININT + CRA + Código Penal',
      'Português completo com Novo Acordo Ortográfico',
      'Cultura Geral com a Lei 13/24 (21 Províncias) & TICs',
      'Gabarito Comentado de Provas Anteriores'
    ],
    colorTheme: {
      bgGrad: 'from-amber-500/15 via-amber-600/10 to-yellow-500/15 dark:from-amber-500/20 dark:via-amber-900/30 dark:to-yellow-500/20',
      badgeBg: 'bg-amber-500 text-slate-950 font-black shadow-md',
      border: 'border-2 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      textAccent: 'text-amber-500 dark:text-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-500 dark:bg-amber-500/30 dark:text-amber-300'
    }
  },
  {
    id: 'pdf_minint_leis',
    title: 'Lei Orgânica do MININT & Estatuto Unificado',
    category: 'Legislação MININT',
    description: 'Resumo completo e esquematizado do Decreto Presidencial n.º 152/19. Abrange as competências e estruturas da PNA, SIC, SME, SP e SPCB com tabelas comparativas e pontos focais de exames.',
    priceKz: 490,
    pages: '48 Páginas • Esquematizado',
    rating: 4.9,
    reviewsCount: 92,
    highlights: [
      'Decreto Presidencial n.º 152/19 integral',
      'Estrutura detalhada dos 5 ramos do MININT',
      'Requisitos e patentes da carreira policial',
      'Resumo com tabelas para fácil memorização'
    ],
    colorTheme: {
      bgGrad: 'from-blue-500/10 via-slate-800/20 to-blue-600/10',
      badgeBg: 'bg-blue-600 text-white font-bold',
      border: 'border-blue-500/30 dark:border-blue-500/40 hover:border-blue-500',
      textAccent: 'text-blue-500 dark:text-blue-400',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400'
    }
  },
  {
    id: 'pdf_cra_direitos',
    title: 'Constituição da República de Angola (CRA) para Concursos',
    category: 'Legislação MININT',
    description: 'Guia de estudo focado nos Direitos, Liberdades e Garantias Fundamentais (Art. 67.º ao 89.º), Organização do Estado, Defesa Nacional e Princípios de Atuação da Segurança Pública.',
    priceKz: 490,
    pages: '40 Páginas • Foco em Exames',
    rating: 5.0,
    reviewsCount: 84,
    highlights: [
      'Artigos essenciais da CRA comentados',
      'Direitos fundamentais e garantias dos cidadãos',
      'Organização do Estado e Administração Pública',
      'Exercícios de fixação com gabarito'
    ],
    colorTheme: {
      bgGrad: 'from-blue-500/10 via-slate-800/20 to-blue-600/10',
      badgeBg: 'bg-blue-600 text-white font-bold',
      border: 'border-blue-500/30 dark:border-blue-500/40 hover:border-blue-500',
      textAccent: 'text-blue-500 dark:text-blue-400',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400'
    }
  },
  {
    id: 'pdf_codigo_penal',
    title: 'Código Penal & Processo Penal Angolano para a Polícia',
    category: 'Legislação MININT',
    description: 'Manual prático sobre Prisão Preventiva, Flagrante Delito, Crimes Contra a Ordem e Segurança Pública, Atribuições do SIC e limites de atuação dos agentes policiais.',
    priceKz: 490,
    pages: '54 Páginas • Casos Práticos',
    rating: 4.8,
    reviewsCount: 76,
    highlights: [
      'Flagrante Delito e Prisão Preventiva',
      'Crimes contra a segurança pública e Estado',
      'Atribuições específicas do SIC e PNA',
      'Casos práticos e interpretação da lei'
    ],
    colorTheme: {
      bgGrad: 'from-blue-500/10 via-slate-800/20 to-blue-600/10',
      badgeBg: 'bg-blue-600 text-white font-bold',
      border: 'border-blue-500/30 dark:border-blue-500/40 hover:border-blue-500',
      textAccent: 'text-blue-500 dark:text-blue-400',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400'
    }
  },
  {
    id: 'pdf_portugues_gramatica',
    title: 'Gramática & Ortografia da Língua Portuguesa',
    category: 'Língua Portuguesa',
    description: 'Guia completo com regras de Sintaxe, Concordância Verbal e Nominal, Regência, Pontuação, Crase e aplicação prática do Novo Acordo Ortográfico com questões de provas.',
    priceKz: 490,
    pages: '62 Páginas • Resumo + Exercícios',
    rating: 4.9,
    reviewsCount: 110,
    highlights: [
      'Concordância e Regência simplificadas',
      'Regras do Novo Acordo Ortográfico',
      'Pontuação e sintaxe da oração',
      'Mais de 80 exercícios comentados'
    ],
    colorTheme: {
      bgGrad: 'from-emerald-500/10 via-slate-800/20 to-teal-600/10',
      badgeBg: 'bg-emerald-600 text-white font-bold',
      border: 'border-emerald-500/30 dark:border-emerald-500/40 hover:border-emerald-500',
      textAccent: 'text-emerald-500 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400'
    }
  },
  {
    id: 'pdf_portugues_redacao',
    title: 'Interpretação de Texto & Redação Oficial MININT',
    category: 'Língua Portuguesa',
    description: 'Técnicas essenciais de interpretação textual, identificação da ideia central, coesão e coerência, além de modelos prontos de relatórios, autos de notícia e correspondência oficial.',
    priceKz: 490,
    pages: '36 Páginas • Guia de Redação',
    rating: 4.8,
    reviewsCount: 65,
    highlights: [
      'Estratégias de interpretação de textos longos',
      'Modelos de Relatórios e Comunicação Oficial',
      'Coesão, coerência e erros mais frequentes',
      'Guia de conectivos para provas escritas'
    ],
    colorTheme: {
      bgGrad: 'from-emerald-500/10 via-slate-800/20 to-teal-600/10',
      badgeBg: 'bg-emerald-600 text-white font-bold',
      border: 'border-emerald-500/30 dark:border-emerald-500/40 hover:border-emerald-500',
      textAccent: 'text-emerald-500 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400'
    }
  },
  {
    id: 'pdf_cultura_geral_angola',
    title: 'Cultura Geral, História & Geografia de Angola',
    category: 'Cultura Geral & Informática',
    description: 'Material completo contendo a História de Angola, Símbolos Nacionais, datas históricas cruciais, atualidades socioeconómicas e a Nova Divisão Político-Administrativa (Lei n.º 13/24 - 21 Províncias).',
    priceKz: 490,
    pages: '52 Páginas • Mapas e Dados',
    rating: 5.0,
    reviewsCount: 105,
    highlights: [
      'Nova Divisão Político-Administrativa (21 Províncias)',
      'Símbolos Nacionais e História da Independência',
      'Geografia física e recursos naturais de Angola',
      'Atualidades socioeconómicas e políticas do país'
    ],
    colorTheme: {
      bgGrad: 'from-purple-500/10 via-slate-800/20 to-indigo-600/10',
      badgeBg: 'bg-purple-600 text-white font-bold',
      border: 'border-purple-500/30 dark:border-purple-500/40 hover:border-purple-500',
      textAccent: 'text-purple-500 dark:text-purple-400',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400'
    }
  },
  {
    id: 'pdf_informatica_tics',
    title: 'Informática Básica & TICs para Exames Policiais',
    category: 'Cultura Geral & Informática',
    description: 'Resumo prático sobre Sistemas Operativos (Windows), Pacote Microsoft Office (Word, Excel e PowerPoint), Conceitos de Redes de Computadores, Internet e Noções de Cibersegurança.',
    priceKz: 490,
    pages: '44 Páginas • Capturas e Atalhos',
    rating: 4.9,
    reviewsCount: 78,
    highlights: [
      'Atalhos essenciais do Windows e Office',
      'Excel e Word cobrados em concursos públicos',
      'Conceitos de Internet, E-mail e Redes',
      'Boas práticas de Cibersegurança e Antivírus'
    ],
    colorTheme: {
      bgGrad: 'from-purple-500/10 via-slate-800/20 to-indigo-600/10',
      badgeBg: 'bg-purple-600 text-white font-bold',
      border: 'border-purple-500/30 dark:border-purple-500/40 hover:border-purple-500',
      textAccent: 'text-purple-500 dark:text-purple-400',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400'
    }
  }
];

interface StudyMaterialsViewProps {
  profile: UserProfile;
}

export const StudyMaterialsView: React.FC<StudyMaterialsViewProps> = ({ profile }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Purchased PDF tracking stored locally
  const [purchasedPdfs, setPurchasedPdfs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('minint_purchased_pdfs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal State
  const [selectedPdfForPurchase, setSelectedPdfForPurchase] = useState<StudyPDFItem | null>(null);
  const [paymentStep, setPaymentStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<'express' | 'referencia'>('express');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [studentPhone, setStudentPhone] = useState<string>('');
  const [studentName, setStudentName] = useState<string>(profile.displayName || '');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('minint_purchased_pdfs', JSON.stringify(purchasedPdfs));
    } catch (err) {
      console.warn('Erro ao guardar PDFs adquiridos:', err);
    }
  }, [purchasedPdfs]);

  const categories = [
    'Todos',
    'Legislação MININT',
    'Língua Portuguesa',
    'Cultura Geral & Informática',
    'Combo Especial'
  ];

  const filteredPdfs = STUDY_PDFS.filter((pdf) => {
    const matchesCategory =
      selectedCategory === 'Todos' || pdf.category === selectedCategory;
    const matchesSearch =
      pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenPurchaseModal = (pdf: StudyPDFItem) => {
    playClickSound();
    setSelectedPdfForPurchase(pdf);
    setPaymentStep(1);
    setPaymentMethod('express');
    setStudentName(profile.displayName || '');
  };

  const handleCloseModal = () => {
    playClickSound();
    setSelectedPdfForPurchase(null);
    setPaymentStep(1);
    setIsProcessingPayment(false);
  };

  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail.trim() || !studentPhone.trim()) {
      alert('Por favor, preencha o seu e-mail e número de contacto.');
      return;
    }
    playClickSound();
    setPaymentStep(2);
  };

  const handleSimulatePayment = () => {
    playClickSound();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      playCorrectSound();
      if (selectedPdfForPurchase) {
        if (selectedPdfForPurchase.isCombo) {
          // Add all PDFs to purchased list
          const allIds = STUDY_PDFS.map((p) => p.id);
          setPurchasedPdfs((prev) => Array.from(new Set([...prev, ...allIds])));
        } else {
          setPurchasedPdfs((prev) => Array.from(new Set([...prev, selectedPdfForPurchase.id])));
        }
      }
      setPaymentStep(3);
    }, 1800);
  };

  const handleTriggerPdfDownload = (pdf: StudyPDFItem) => {
    playClickSound();
    // Generate a simple simulated PDF text file blob for download
    const content = `===========================================================
MININT ANGOLA - MATERIAL OFICIAL DE ESTUDO DE ELITE
===========================================================
Título: ${pdf.title}
Categoria: ${pdf.category}
Formato: Documento PDF Digital de Alta Resolução
Candidato Registado: ${studentName || profile.displayName || 'Candidato MININT'}
Identificador de Aquisição: MININT-PDF-${Math.floor(100000 + Math.random() * 900000)}
Data de Emissão: ${new Date().toLocaleDateString('pt-AO')}
===========================================================

RESUMO DO CONTEÚDO E PONTOS CHAVE DE ESTUDO:
${pdf.highlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

INSTRUÇÕES PARA O CANDIDATO:
1. Recomendamos a leitura diária deste material juntamente com a realização dos Simulados Práticos na Aplicação Oficial MININT Angola.
2. Guarde este ficheiro na sua pasta de estudos para consulta offline.
3. Dúvidas sobre o conteúdo podem ser esclarecidas diretamente no módulo "Tutor IA" da aplicação.

Bons estudos e rumo à aprovação no Concurso do Ministério do Interior de Angola!
===========================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdf.id}_${pdf.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyReference = (text: string) => {
    navigator.clipboard.writeText(text);
    playClickSound();
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="w-full space-y-5 px-3 py-2 sm:px-4">
      {/* Banner Superior & Header da Secção */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-5 sm:p-6 text-white shadow-xl border border-amber-500/30">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <BookMarked size={14} className="text-amber-400" />
              <span>Manuais de Estudo em PDF</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              Materiais & PDFs de Estudo 📚
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Conteúdos atualizados para o Concurso do MININT em Angola (PNA, SIC, SME, SP e SPCB). Manuais em PDF prontos para download imediato.
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shrink-0 sm:w-48 text-center sm:text-right space-y-1">
            <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Preço Fixo Acessível</div>
            <div className="text-lg font-black text-amber-400">490 Kz <span className="text-xs font-normal text-slate-300">/ PDF</span></div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center sm:justify-end gap-1">
              <CheckCircle2 size={12} />
              <span>Acesso Vitalício em PDF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Filtros e Barra de Pesquisa */}
      <div className="space-y-3">
        {/* Barra de Busca */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar PDF por título, legislação ou matéria..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tabs de Categorias */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md scale-102'
                    : 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'Combo Especial' ? '💎 ' + cat : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid do Catálogo com Cartões de PDFs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPdfs.map((pdf) => {
          const isPurchased = purchasedPdfs.includes(pdf.id);

          return (
            <div
              key={pdf.id}
              className={`relative flex flex-col justify-between rounded-2xl bg-gradient-to-b ${pdf.colorTheme.bgGrad} bg-white dark:bg-slate-900 p-4 sm:p-5 transition-all duration-200 hover:shadow-lg ${pdf.colorTheme.border} ${
                pdf.isCombo ? 'md:col-span-2' : ''
              }`}
            >
              {/* Badge da Categoria & Preço */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs uppercase tracking-wider ${pdf.colorTheme.badgeBg}`}>
                    {pdf.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-amber-400 text-xs font-bold gap-1 bg-slate-950/40 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>{pdf.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({pdf.reviewsCount})</span>
                    </div>

                    <div className={`px-2.5 py-1 rounded-lg font-black text-xs sm:text-sm shadow-xs ${
                      pdf.isCombo 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950' 
                        : 'bg-slate-900 text-amber-400 border border-amber-500/30'
                    }`}>
                      {pdf.priceKz.toLocaleString('pt-AO')} Kz
                    </div>
                  </div>
                </div>

                {/* Título & Descrição */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                    {pdf.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pdf.description}
                  </p>
                </div>

                {/* Lista de Pontos Fortes / Destaques */}
                <div className="bg-slate-950/5 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider flex items-center justify-between">
                    <span>{pdf.pages}</span>
                    <span className="text-amber-500">PDF Alta Resolução</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-700 dark:text-slate-200">
                    {pdf.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check size={13} className={`shrink-0 mt-0.5 ${pdf.colorTheme.textAccent}`} />
                        <span className="line-clamp-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botão de Ação (Comprar / Baixar) */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Download Imediato</span>
                </div>

                {isPurchased ? (
                  <button
                    onClick={() => handleTriggerPdfDownload(pdf)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Baixar PDF 📥</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenPurchaseModal(pdf)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer ${
                      pdf.isCombo
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    <ShoppingBag size={15} />
                    <span>Comprar e Baixar ({pdf.priceKz.toLocaleString('pt-AO')} Kz)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPdfs.length === 0 && (
        <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
          <BookOpen size={32} className="mx-auto text-slate-500" />
          <h4 className="font-bold text-slate-200">Nenhum PDF encontrado</h4>
          <p className="text-xs text-slate-400">Tente alterar os termos da pesquisa ou selecionar a categoria "Todos".</p>
        </div>
      )}

      {/* MODAL DE PAGAMENTO SIMULADO */}
      <AnimatePresence>
        {selectedPdfForPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
            >
              {/* Header do Modal */}
              <div className="p-4 sm:p-5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-100">
                      Adquirir Material em PDF
                    </h3>
                    <p className="text-[11px] text-amber-400 font-medium">
                      Simulação de Pagamento Segura
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Corpo do Modal (Passos 1, 2, 3) */}
              <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
                {/* Resumo do Item Selecionado */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block font-bold">
                      {selectedPdfForPurchase.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-200 line-clamp-1">
                      {selectedPdfForPurchase.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 block">{selectedPdfForPurchase.pages}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">Total a Pagar</span>
                    <span className="text-base font-black text-amber-400">
                      {selectedPdfForPurchase.priceKz.toLocaleString('pt-AO')} Kz
                    </span>
                  </div>
                </div>

                {/* PASSO 1: Seleção de Método & Dados de Contacto */}
                {paymentStep === 1 && (
                  <form onSubmit={handleProceedToStep2} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">
                        Opções de Pagamento em Angola 🇦🇴
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setPaymentMethod('express');
                          }}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            paymentMethod === 'express'
                              ? 'border-amber-500 bg-amber-500/10 text-slate-100 ring-1 ring-amber-500/50'
                              : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Smartphone size={18} className={paymentMethod === 'express' ? 'text-amber-400' : ''} />
                            {paymentMethod === 'express' && <CheckCircle2 size={16} className="text-amber-400" />}
                          </div>
                          <div className="mt-2">
                            <span className="text-xs font-bold block text-slate-200">Multicaixa Express</span>
                            <span className="text-[10px] text-slate-400">Pagamento instantâneo via telemóvel</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setPaymentMethod('referencia');
                          }}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            paymentMethod === 'referencia'
                              ? 'border-amber-500 bg-amber-500/10 text-slate-100 ring-1 ring-amber-500/50'
                              : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <CreditCard size={18} className={paymentMethod === 'referencia' ? 'text-amber-400' : ''} />
                            {paymentMethod === 'referencia' && <CheckCircle2 size={16} className="text-amber-400" />}
                          </div>
                          <div className="mt-2">
                            <span className="text-xs font-bold block text-slate-200">Referência Multicaixa / Express</span>
                            <span className="text-[10px] text-slate-400">Entidade e Referência de Pagamento</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold text-slate-300 block">
                        Dados de Envio e Identificação do Aluno
                      </label>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Nome do Candidato</label>
                          <input
                            type="text"
                            required
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Seu Nome Completo"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">E-mail para Receção</label>
                            <input
                              type="email"
                              required
                              value={studentEmail}
                              onChange={(e) => setStudentEmail(e.target.value)}
                              placeholder="aluno@exemplo.com"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Telemóvel / WhatsApp</label>
                            <input
                              type="tel"
                              required
                              value={studentPhone}
                              onChange={(e) => setStudentPhone(e.target.value)}
                              placeholder="923 000 000"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        <span>Avançar para Instruções de Pagamento</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </form>
                )}

                {/* PASSO 2: Instruções do Pagamento */}
                {paymentStep === 2 && (
                  <div className="space-y-4">
                    {paymentMethod === 'express' ? (
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                          <Smartphone size={16} />
                          <span>Pagamento Instantâneo via Multicaixa Express</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Foi gerado um pedido de pagamento para o número <strong className="text-amber-300">{studentPhone}</strong> no valor de <strong className="text-amber-300">{selectedPdfForPurchase.priceKz.toLocaleString('pt-AO')} Kz</strong>.
                        </p>
                        <div className="p-3 bg-amber-500/10 rounded-lg text-[11px] text-amber-200/90 space-y-1">
                          <div className="font-bold">Passos no seu telemóvel:</div>
                          <div>1. Abra o aplicativo Multicaixa Express.</div>
                          <div>2. Confirme a notificação pendente de pagamento do MININT.</div>
                          <div>3. Clique em "Confirmar Pagamento Simulado" abaixo para concluir a transferência.</div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-3">
                        <div className="flex items-center justify-between text-amber-400 font-bold text-xs">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} />
                            <span>Dados de Referência Multicaixa</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Validade: 24 Horas</span>
                        </div>

                        <div className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                          <div className="flex items-center justify-between py-1 border-b border-slate-800">
                            <span className="text-slate-400">Entidade:</span>
                            <span className="font-mono font-bold text-slate-100">00812</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-800">
                            <span className="text-slate-400">Referência:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-400 text-sm">948 201 490</span>
                              <button
                                onClick={() => handleCopyReference('948201490')}
                                className="text-slate-400 hover:text-amber-400 p-1 cursor-pointer"
                                title="Copiar Referência"
                              >
                                <Copy size={13} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-400">Montante Total:</span>
                            <span className="font-bold text-amber-400">
                              {selectedPdfForPurchase.priceKz.toLocaleString('pt-AO')} Kz
                            </span>
                          </div>
                        </div>

                        {copiedRef && (
                          <div className="text-[10px] text-emerald-400 font-bold text-center">
                            ✓ Referência copiada para a área de transferência!
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setPaymentStep(1)}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                      >
                        Voltar
                      </button>

                      <button
                        type="button"
                        disabled={isProcessingPayment}
                        onClick={handleSimulatePayment}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {isProcessingPayment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>A Processar Pagamento...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Simular Conclusão de Compra</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* PASSO 3: Sucesso e Download Imadiato */}
                {paymentStep === 3 && (
                  <div className="space-y-4 text-center py-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/40">
                      <CheckCircle2 size={14} />
                      <span>Estado: Pago</span>
                    </div>

                    <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                      <CheckCircle2 size={32} />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-100">
                        🎉 Compra Efetuada com Sucesso!
                      </h3>
                      <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                        O seu material <strong className="text-amber-400">{selectedPdfForPurchase.title}</strong> está pronto e disponível para transferência imediata.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5 text-left">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Check size={14} />
                        <span>Cópias e Ligação Enviadas por E-mail</span>
                      </div>
                      <p className="text-slate-400 text-[10px] leading-normal">
                        Enviámos uma cópia da ligação de download e o recibo de compra para o seu e-mail: <strong className="text-slate-200">{studentEmail}</strong>.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleTriggerPdfDownload(selectedPdfForPurchase)}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                      >
                        <Download size={16} />
                        <span>Baixar PDF Agora 📥</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        Fechar e Continuar a Estudar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
