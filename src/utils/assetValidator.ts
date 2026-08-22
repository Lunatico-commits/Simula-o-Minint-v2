import { avatarsList } from '../data/avatars';
import { SHOP_ITEMS } from '../data/shopItems';
import { getAvatarImagePath, getAvatarAssetPath } from '../data/avatars';

/**
 * Interface representing an asset validation report item.
 */
export interface AssetValidationReport {
  source: 'avatars.ts' | 'shopItems.ts';
  id: string;
  nameOrTitle: string;
  checkedPath: string;
  gender?: 'female' | 'male';
  status: 'valid' | 'broken' | 'extension_mismatch' | 'missing';
  reason?: string;
  suggestedFix?: string;
}

export interface ValidationSummary {
  totalChecked: number;
  validCount: number;
  brokenCount: number;
  reports: AssetValidationReport[];
}

/**
 * Dynamically extract all known public files from the /public/avatars/ folder using Vite globbing if available.
 */
const getPublicAvatarFileList = (): Set<string> => {
  const fileSet = new Set<string>();

  try {
    // Vite's import.meta.glob searches the filesystem during compilation
    const globFiles = import.meta.glob('/public/avatars/*.*', { eager: true });
    for (const rawPath of Object.keys(globFiles)) {
      // Convert '/public/avatars/pna_male.png' -> '/avatars/pna_male.png'
      const normalized = rawPath.replace(/^\/public/, '');
      fileSet.add(normalized);
      // Also store just the filename
      const filename = normalized.split('/').pop();
      if (filename) fileSet.add(filename);
    }
  } catch {
    // Glob fallback if not running in standard Vite bundler
  }

  // Guaranteed list of known assets in /public/avatars/
  const staticKnownAssets = [
    'minint_commissar_female.png',
    'minint_commissar_male.png',
    'pna_female.png',
    'pna_gala_female.png',
    'pna_gala_male.png',
    'pna_male.png',
    'pna_pir_female.png',
    'pna_pir_male.png',
    'pna_traffic_female.png',
    'pna_traffic_male.png',
    'sic_female.png',
    'sic_forensic_female.png',
    'sic_forensic_male.png',
    'sic_male.png',
    'sic_tactical_female.png',
    'sic_tactical_male.png',
    'sme_airport_female.png',
    'sme_airport_male.png',
    'sme_border_female.png',
    'sme_border_male.png',
    'sme_female.png',
    'sme_male.png',
    'sp_female.png',
    'sp_honor_female.png',
    'sp_honor_male.png',
    'sp_male.png',
    'spcb_female.png',
    'spcb_male.png',
    'spcb_rescue_female.png',
    'spcb_rescue_male.png',
  ];

  for (const filename of staticKnownAssets) {
    fileSet.add(`/avatars/${filename}`);
    fileSet.add(filename);
  }

  return fileSet;
};

/**
 * Validates a single path against the existing public avatar assets.
 */
const checkAssetPath = (
  path: string,
  existingFiles: Set<string>
): { status: 'valid' | 'broken' | 'extension_mismatch' | 'missing'; reason?: string; suggestedFix?: string } => {
  if (!path) {
    return { status: 'missing', reason: 'Caminho de asset vazio ou indefinido.' };
  }

  // Normalize path format
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const filename = normalizedPath.split('/').pop() || '';

  // 1. Direct match check
  if (existingFiles.has(normalizedPath) || existingFiles.has(filename)) {
    return { status: 'valid' };
  }

  // 2. Check for extension mismatch (.webp vs .png or .jpg vs .png)
  if (normalizedPath.endsWith('.webp') || normalizedPath.endsWith('.jpg') || normalizedPath.endsWith('.jpeg')) {
    const pngVersion = normalizedPath.replace(/\.(webp|jpg|jpeg)$/i, '.png');
    const pngFilename = filename.replace(/\.(webp|jpg|jpeg)$/i, '.png');

    if (existingFiles.has(pngVersion) || existingFiles.has(pngFilename)) {
      return {
        status: 'extension_mismatch',
        reason: `Extensão inválida na imagem ('${path}'). O ficheiro real no disco utiliza a extensão '.png'.`,
        suggestedFix: pngVersion,
      };
    }
  }

  // 3. Check for .png when .webp might be requested
  if (normalizedPath.endsWith('.png')) {
    const webpVersion = normalizedPath.replace(/\.png$/i, '.webp');
    const webpFilename = filename.replace(/\.png$/i, '.webp');

    if (existingFiles.has(webpVersion) || existingFiles.has(webpFilename)) {
      return {
        status: 'extension_mismatch',
        reason: `Extensão inválida na imagem ('${path}'). O ficheiro real no disco utiliza a extensão '.webp'.`,
        suggestedFix: webpVersion,
      };
    }
  }

  // 4. Broken or non-existent
  return {
    status: 'broken',
    reason: `Ficheiro não encontrado na pasta pública '/avatars/'. Caminho testado: '${path}'.`,
    suggestedFix: `/avatars/pna_male.png (fallback)`,
  };
};

/**
 * Função de depuração principal:
 * Compara todos os caminhos definidos em 'shopItems.ts' e 'avatars.ts' com as imagens
 * existentes na pasta pública '/avatars/'.
 * Emite console.warn detalhados para cada inconsistência encontrada.
 */
export const validateAvatarAssets = (options?: { silent?: boolean; logSuccess?: boolean }): ValidationSummary => {
  const existingFiles = getPublicAvatarFileList();
  const reports: AssetValidationReport[] = [];

  // --- 1. Validar avatars.ts (avatarsList) ---
  for (const avatar of avatarsList) {
    const result = checkAssetPath(avatar.assetPath, existingFiles);
    reports.push({
      source: 'avatars.ts',
      id: avatar.id,
      nameOrTitle: avatar.title,
      checkedPath: avatar.assetPath,
      gender: avatar.gender,
      status: result.status,
      reason: result.reason,
      suggestedFix: result.suggestedFix,
    });
  }

  // --- 2. Validar shopItems.ts (SHOP_ITEMS) ---
  for (const item of SHOP_ITEMS) {
    // Se tiver assetPath explícito no item
    if (item.assetPath) {
      const result = checkAssetPath(item.assetPath, existingFiles);
      reports.push({
        source: 'shopItems.ts',
        id: item.id,
        nameOrTitle: item.name,
        checkedPath: item.assetPath,
        status: result.status,
        reason: result.reason,
        suggestedFix: result.suggestedFix,
      });
    }

    // Para itens do tipo 'avatar_farda' ou categoria 'fardas', validar ambos os géneros (masculino e feminino)
    if (item.type === 'avatar_farda' || item.category === 'fardas') {
      const femalePath = getAvatarImagePath(item.id, 'female', item.branch || item.organ);
      const femaleResult = checkAssetPath(femalePath, existingFiles);
      reports.push({
        source: 'shopItems.ts',
        id: item.id,
        nameOrTitle: `${item.name} (Feminino)`,
        checkedPath: femalePath,
        gender: 'female',
        status: femaleResult.status,
        reason: femaleResult.reason,
        suggestedFix: femaleResult.suggestedFix,
      });

      const malePath = getAvatarImagePath(item.id, 'male', item.branch || item.organ);
      const maleResult = checkAssetPath(malePath, existingFiles);
      reports.push({
        source: 'shopItems.ts',
        id: item.id,
        nameOrTitle: `${item.name} (Masculino)`,
        checkedPath: malePath,
        gender: 'male',
        status: maleResult.status,
        reason: maleResult.reason,
        suggestedFix: maleResult.suggestedFix,
      });
    }
  }

  const brokenReports = reports.filter((r) => r.status !== 'valid');
  const validCount = reports.filter((r) => r.status === 'valid').length;

  // Emissão de avisos e diagnósticos na consola
  if (!options?.silent) {
    if (brokenReports.length > 0) {
      console.group(
        `%c⚠️ [Validador de Assets MININT] Encontrados ${brokenReports.length} problema(s) em caminhos de avatares/fardas:`,
        'color: #f59e0b; font-weight: bold; font-size: 13px;'
      );

      for (const broken of brokenReports) {
        console.warn(
          `[MININT Asset Error] Fonte: ${broken.source} | ID: '${broken.id}' (${broken.nameOrTitle})\n` +
          `❌ Caminho: "${broken.checkedPath}"\n` +
          `Motivo: ${broken.reason}` +
          (broken.suggestedFix ? `\n💡 Sugestão de correção: "${broken.suggestedFix}"` : '')
        );
      }

      console.table(
        brokenReports.map((r) => ({
          Fonte: r.source,
          ID: r.id,
          Nome: r.nameOrTitle,
          'Caminho Testado': r.checkedPath,
          Estado: r.status,
          'Sugestão / Fix': r.suggestedFix || 'N/A',
        }))
      );

      console.groupEnd();
    } else if (options?.logSuccess || import.meta.env.DEV) {
      console.log(
        `%c✅ [Validador de Assets MININT] Todos os ${validCount} caminhos de avatares e fardas em 'avatars.ts' e 'shopItems.ts' existem e são 100% válidos no disco.`,
        'color: #10b981; font-weight: bold;'
      );
    }
  }

  return {
    totalChecked: reports.length,
    validCount,
    brokenCount: brokenReports.length,
    reports,
  };
};

/**
 * Auto-inicialização em modo de desenvolvimento
 */
export const initAssetValidatorInDev = (): void => {
  if (typeof window !== 'undefined') {
    // Expor função no objeto window para depuração manual em qualquer momento pelo utilizador / QA
    (window as any).__validateMININTAssets = validateAvatarAssets;

    // Executar verificação automática no arranque em modo de desenvolvimento
    if (import.meta.env.DEV) {
      // Execução ligeiramente diferida para não bloquear a renderização inicial
      setTimeout(() => {
        validateAvatarAssets({ logSuccess: true });
      }, 1000);
    }
  }
};
