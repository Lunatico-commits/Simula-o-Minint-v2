import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, X, Scale, Lock, Info, ExternalLink } from 'lucide-react';

type LegalTab = 'terms' | 'privacy';

export const Footer: React.FC = () => {
  const [activeLegalModal, setActiveLegalModal] = useState<LegalTab | null>(null);

  return (
    <>
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#07090C]/90 backdrop-blur-md px-4 py-4 text-center text-xs text-slate-500 dark:text-slate-400 font-sans transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          {/* Copyright notice */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              © 2026 Simulados MININT Angola.
            </span>
            <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Todos os direitos reservados.
            </span>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveLegalModal('terms')}
              className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
            >
              <FileText size={14} className="text-slate-400 dark:text-slate-500" />
              <span>Termos de Utilização</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            <button
              onClick={() => setActiveLegalModal('privacy')}
              className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
            >
              <ShieldCheck size={14} className="text-slate-400 dark:text-slate-500" />
              <span>Política de Privacidade</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modal de Termos de Utilização e Política de Privacidade */}
      <AnimatePresence>
        {activeLegalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    activeLegalModal === 'terms'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {activeLegalModal === 'terms' ? <Scale size={20} /> : <Lock size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                      {activeLegalModal === 'terms' ? 'Termos de Utilização' : 'Política de Privacidade'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Simulados MININT Angola • Informação Legal
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveLegalModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sub-tabs inside modal */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 p-1.5 px-4 gap-2">
                <button
                  onClick={() => setActiveLegalModal('terms')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeLegalModal === 'terms'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText size={14} />
                  <span>Termos de Utilização</span>
                </button>
                <button
                  onClick={() => setActiveLegalModal('privacy')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeLegalModal === 'privacy'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck size={14} />
                  <span>Política de Privacidade</span>
                </button>
              </div>

              {/* Modal Body / Scrollable Content */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {activeLegalModal === 'terms' ? (
                  <>
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                      <Info size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block mb-0.5">Aviso de Isenção Geral & Independência</strong>
                        Esta plataforma é um guia pedagógico independente desenvolvido exclusivamente para auxílio no estudo pessoal dos candidatos.
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        1. Natureza do Serviço e Ausência de Vínculo Institucional
                      </h4>
                      <p>
                        A plataforma <strong>Simulados MININT Angola</strong> é um recurso educativo e instrutivo independente para preparação dos candidatos aos exames de admissão do Ministério do Interior (MININT) e seus respetivos órgãos executivos:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 font-medium text-slate-700 dark:text-slate-300">
                        <li>Polícia Nacional de Angola (PNA)</li>
                        <li>Serviço de Investigação Criminal (SIC)</li>
                        <li>Serviço de Migração e Estrangeiros (SME)</li>
                        <li>Serviço Penitenciário (SP)</li>
                        <li>Serviço de Protecção Civil e Bombeiros (SPCB)</li>
                      </ul>
                      <p className="text-slate-500 dark:text-slate-400">
                        Não mantemos qualquer vínculo institucional direto, representação, patrocínio ou parceria oficial com o Ministério do Interior da República de Angola nem com nenhum dos seus órgãos.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        2. Finalidade Pedagógica e Conteúdos dos Simulados
                      </h4>
                      <p>
                        Todas as questões, simulados, gabaritos explicativos e materiais disponibilizados visam exclusivamente a preparação teórica e prática do candidato, baseados na legislação angolana pública em vigor (Constituição da República de Angola, Lei Geral do Trabalho, Códigos Penais e Estatutos Orgânicos do MININT).
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        3. Responsabilidade do Utilizador
                      </h4>
                      <p>
                        O resultado obtido nos simulados serve como métrica de autoavaliação e não garante aprovação ou contratação em concursos públicos oficiais do Estado Angolano, cuja responsabilidade de seleção pertence unicamente aos júris oficiais de cada concurso.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
                      <Lock size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block mb-0.5">Proteção e Privacidade dos Seus Dados</strong>
                        Os seus dados de progresso e estatísticas são mantidos de forma segura para assegurar a melhor experiência de aprendizagem.
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        1. Dados Recolhidos e Armazenamento
                      </h4>
                      <p>
                        Recolhemos e guardamos dados estritamente necessários para o acompanhamento da sua evolução pedagógica, tais como:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 font-medium text-slate-700 dark:text-slate-300">
                        <li>Informações de perfil (Nome/Cognome, Ramo de Preferência e Nível Académico)</li>
                        <li>Histórico de resolução de questões, taxas de acerto e estatísticas por matéria</li>
                        <li>Conquistas destravadas, sequência de estudos (Streak) e pontuações</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        2. Finalidade e Utilização dos Dados
                      </h4>
                      <p>
                        Os dados são utilizados unicamente para personalizar os simulados, apresentar gráficos de desempenho no dashboard, calcular os rankings de candidatos e permitir duelos interativos.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        3. Compromisso de Segurança e Não Partilha
                      </h4>
                      <p>
                        Respeitamos integralmente a privacidade dos utilizadores nos termos da legislação angolana aplicável sobre proteção de dados. As informações do utilizador jamais serão vendidas ou partilhadas com terceiros não autorizados.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer / Action */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end">
                <button
                  onClick={() => setActiveLegalModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Entendido / Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
