/**
 * Utilitário de segurança e validação de scripts de anúncios (Adsterra, Google AdSense, etc.)
 * Previne XSS, redirecionamentos maliciosos, roubo de cookies/localStorage e injeções no DOM.
 */

export interface AdValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedScript?: string;
}

// Padrões de código potencialmente maliciosos ou perigosos
const DANGEROUS_PATTERNS: { pattern: RegExp; description: string }[] = [
  { pattern: /document\.cookie/i, description: 'Acesso a cookies de sessão (document.cookie)' },
  { pattern: /localStorage/i, description: 'Leitura/Escrita no localStorage' },
  { pattern: /sessionStorage/i, description: 'Leitura/Escrita no sessionStorage' },
  { pattern: /window\.location/i, description: 'Redirecionamento não autorizado (window.location)' },
  { pattern: /top\.location/i, description: 'Redirecionamento do topo da página (top.location)' },
  { pattern: /parent\.location/i, description: 'Redirecionamento do caixilho pai (parent.location)' },
  { pattern: /location\.href\s*=/i, description: 'Redirecionamento de URL (location.href)' },
  { pattern: /location\.replace\s*\(/i, description: 'Substituição de URL (location.replace)' },
  { pattern: /eval\s*\(/i, description: 'Execução dinâmica de código (eval)' },
  { pattern: /new\s+Function\s*\(/i, description: 'Construtor de Função dinâmica (new Function)' },
  { pattern: /javascript:/i, description: 'Esquema de URL JavaScript perigoso (javascript:)' },
  { pattern: /data:text\/html/i, description: 'URI de Dados HTML perigosa (data:text/html)' },
  { pattern: /<img[^>]+onerror/i, description: 'Injeção de evento onerror em imagem' },
  { pattern: /<svg[^>]+onload/i, description: 'Injeção de evento onload em SVG' },
  { pattern: /onload\s*=/i, description: 'Injeção de manipulador inline (onload=)' },
  { pattern: /onerror\s*=/i, description: 'Injeção de manipulador inline (onerror=)' },
];

/**
 * Valida uma chave de anúncio de rede de parceiros
 */
export function validateAdsterraKey(key: string): AdValidationResult {
  const trimmed = key.trim();
  if (!trimmed) return { isValid: true };

  if (!/^[a-zA-Z0-9_-]{10,64}$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'A Key deve conter apenas caracteres alfanuméricos válidos (sem espaços ou tags HTML).'
    };
  }

  return { isValid: true };
}

/**
 * Valida um script HTML/JS de anúncio antes de guardar (Google AdSense, Banners customizados, etc.)
 */
export function validateAdScript(script: string): AdValidationResult {
  const trimmed = script.trim();
  if (!trimmed) return { isValid: true };

  // 1. Verificar presença de padrões perigosos
  for (const item of DANGEROUS_PATTERNS) {
    if (item.pattern.test(trimmed)) {
      return {
        isValid: false,
        error: `Script rejeitado por segurança: detetada instrução perigosa (${item.description}).`
      };
    }
  }

  // 2. Verificar estrutura básica de anúncio (<script...>, <ins...>, <iframe>, adsbygoogle, etc.)
  const lower = trimmed.toLowerCase();
  const hasScriptTag = lower.includes('<script');
  const hasIframeTag = lower.includes('<iframe');
  const hasInsTag = lower.includes('<ins');
  const hasAdsense = lower.includes('adsbygoogle') || lower.includes('ca-pub-');
  const hasAtOptions = lower.includes('atoptions');

  if (!hasScriptTag && !hasIframeTag && !hasInsTag && !hasAdsense && !hasAtOptions) {
    return {
      isValid: false,
      error: 'O código inserido não contém uma estrutura de anúncio válida (ex: tags <script>, <ins> ou <iframe> do Google AdSense).'
    };
  }

  return { isValid: true, sanitizedScript: trimmed };
}

/**
 * Injeta com segurança o script de anúncios num elemento container do DOM
 */
export function safeInjectAdScript(container: HTMLDivElement, codeToRun: string): void {
  if (!container) return;
  container.innerHTML = '';

  if (!codeToRun || !codeToRun.trim()) return;

  // Validação em tempo de execução antes de injetar
  const validation = validateAdScript(codeToRun);
  if (!validation.isValid) {
    console.warn('Script de anúncios bloqueado por segurança ao tentar injetar no DOM:', validation.error);
    return;
  }

  try {
    const tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = codeToRun;

    // Remove elementos com atributos de manipuladores inline de eventos
    const allElements = tempWrapper.querySelectorAll('*');
    allElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.toLowerCase().startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
    });

    // Anexa nós que não sejam script
    Array.from(tempWrapper.childNodes).forEach((node) => {
      if (node.nodeName !== 'SCRIPT') {
        container.appendChild(node.cloneNode(true));
      }
    });

    // Re-cria nós <script> com verificação estrita de atributos
    const scriptElements = tempWrapper.querySelectorAll('script');
    scriptElements.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        const attrName = attr.name.toLowerCase();
        // Não permitir atributos de eventos inline no script
        if (!attrName.startsWith('on')) {
          newScript.setAttribute(attr.name, attr.value);
        }
      });

      if (oldScript.innerHTML) {
        // Validação extra do conteúdo interno do script
        const innerValidation = validateAdScript(oldScript.innerHTML);
        if (innerValidation.isValid) {
          newScript.innerHTML = oldScript.innerHTML;
        } else {
          console.warn('Conteúdo do script bloqueado:', innerValidation.error);
          return;
        }
      }

      container.appendChild(newScript);
    });
  } catch (err) {
    console.error('Erro ao injetar de forma segura o script de anúncios:', err);
  }
}

/**
 * Injeta/sincroniza o script do AdSense configurado no Painel de Admin diretamente no <head> do documento DOM.
 * Garante que qualquer script inserido pelo Painel de Admin seja renderizado no cabeçalho (<head>) para aprovação do Google AdSense.
 */
export function syncAdSenseToHead(scriptCode?: string): void {
  if (typeof document === 'undefined' || !document.head) return;

  const codeToInject = (
    scriptCode !== undefined
      ? scriptCode
      : (localStorage.getItem('minint_adsense_code') || localStorage.getItem('minint_ad_script') || '')
  ).trim();

  if (!codeToInject) return;

  // Validação em tempo de execução do script de AdSense
  const validation = validateAdScript(codeToInject);
  if (!validation.isValid) {
    console.warn('Script de AdSense bloqueado por segurança ao tentar sincronizar no <head>:', validation.error);
    return;
  }

  try {
    const tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = codeToInject;

    const scriptElements = tempWrapper.querySelectorAll('script');
    scriptElements.forEach((oldScript) => {
      const src = oldScript.getAttribute('src');
      const innerContent = oldScript.innerHTML.trim();

      // Se possui atribuição src, verifica se já existe no <head>
      if (src) {
        const existingSrcScript = Array.from(document.head.querySelectorAll('script')).find(
          (s) => s.getAttribute('src') === src
        );
        if (existingSrcScript) return; // Já injetado no <head>
      }

      const newScript = document.createElement('script');
      newScript.setAttribute('data-admin-adsense-head', 'true');

      Array.from(oldScript.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (!name.startsWith('on')) {
          newScript.setAttribute(attr.name, attr.value);
        }
      });

      if (innerContent) {
        const innerVal = validateAdScript(innerContent);
        if (innerVal.isValid) {
          newScript.innerHTML = innerContent;
        } else {
          return;
        }
      }

      document.head.appendChild(newScript);
    });
  } catch (err) {
    console.error('Erro ao sincronizar script do AdSense no <head>:', err);
  }
}

// Execução automática ao carregar o módulo no browser
if (typeof window !== 'undefined') {
  try {
    syncAdSenseToHead();
  } catch (e) {
    // ignorar
  }
}

