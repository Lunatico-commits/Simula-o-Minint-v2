import React from 'react';
import { ShieldCheck, FileText, CheckCircle, Scale, AlertTriangle, ChevronRight } from 'lucide-react';

export const RequirementGuide: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-4 text-slate-900 dark:text-slate-100 space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#16181D] dark:to-[#0F1115] border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center shadow-md dark:shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <ShieldCheck size={24} />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Requisitos do Concurso MININT</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Guia de Admissão para a Polícia Nacional, SIC, SME, SP e Bombeiros
        </p>
      </div>

      {/* General Criteria */}
      <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
          <CheckCircle size={15} className="text-amber-500" />
          <span>Requisitos Gerais de Admissão</span>
        </h3>

        <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-300">
          <li className="flex items-start gap-2 bg-slate-50 dark:bg-[#0A0A0A] p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
            <span className="text-amber-500 font-bold">•</span>
            <span>Nacionalidade Angolana de origem</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 dark:bg-[#0A0A0A] p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
            <span className="text-amber-500 font-bold">•</span>
            <span>Idade compreendida entre os 18 e os 35 anos (conforme a carreira/ramo)</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 dark:bg-[#0A0A0A] p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
            <span className="text-amber-500 font-bold">•</span>
            <span>Altura mínima: 1,65m (Mulheres) e 1,70m (Homens)</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 dark:bg-[#0A0A0A] p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
            <span className="text-amber-500 font-bold">•</span>
            <span>Sanidade mental e robustez física comprovada por Inspecção Médica</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 dark:bg-[#0A0A0A] p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
            <span className="text-amber-500 font-bold">•</span>
            <span>Atestado de Registo Criminal sem antecedentes criminais nem condenações</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 dark:bg-[#0A0A0A] p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
            <span className="text-amber-500 font-bold">•</span>
            <span>Situação militar regularizada (Certificado de Recenseamento ou RDM)</span>
          </li>
        </ul>
      </div>

      {/* Phases of Recruitment */}
      <div className="bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-white/5 rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
          <FileText size={15} className="text-amber-500" />
          <span>Fases da Selecção do Concurso</span>
        </h3>

        <div className="space-y-2 text-xs">
          {[
            { phase: '1.ª Fase', title: 'Inscrição & Validação Documental', desc: 'Verificação da conformidade dos documentos exigidos e perfil.' },
            { phase: '2.ª Fase', title: 'Exame Escrito de Conhecimentos', desc: 'Prova teórica de Legislação MININT, Língua Portuguesa e Cultura Geral.' },
            { phase: '3.ª Fase', title: 'Inspeção Médica & Teste Psicotécnico', desc: 'Avaliação clínica, visão, audição e testes de aptidão psicológica.' },
            { phase: '4.ª Fase', title: 'Testes de Aptidão Física (TAF)', desc: 'Corrida, flexões, abdominais e teste de resistência física.' },
            { phase: '5.ª Fase', title: 'Curso de Formação Básica Policial', desc: 'Regime de internamento no Centro de Formação do MININT.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-[#0A0A0A] p-3 rounded-xl border border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-500 font-bold mb-1">
                <span>{item.title}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-500 font-mono font-bold border border-amber-500/20">{item.phase}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

