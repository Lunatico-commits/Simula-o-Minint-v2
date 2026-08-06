import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SavedAccount } from '../types';

/**
 * Generates a unique referral code based on the user's display name.
 * Example: MININT-MARIA-482
 */
export function generateReferralCode(displayName: string): string {
  const cleanName = (displayName || 'CANDIDATO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .split(' ')[0]
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  const prefix = cleanName.length > 0 ? cleanName : 'CANDIDATO';
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `MININT-${prefix}-${randomNum}`;
}

/**
 * Validates and applies the +5 XP referral reward to the inviter when a new candidate registers.
 */
export async function processReferralReward(
  inputCode: string,
  newCandidateUid: string
): Promise<{ success: boolean; inviterName?: string; error?: string }> {
  if (!inputCode || !inputCode.trim()) {
    return { success: false, error: 'Nenhum código fornecido' };
  }

  const cleanCode = inputCode.trim().toUpperCase();

  try {
    // 1. Search in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', cleanCode));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const inviterDoc = querySnap.docs[0];
      const inviterData = inviterDoc.data();

      // Prevent self-referral
      if (inviterDoc.id === newCandidateUid) {
        return { success: false, error: 'Não pode utilizar o seu próprio código de indicação' };
      }

      // Add +5 XP to inviter and increment referralsCount
      await updateDoc(doc(db, 'users', inviterDoc.id), {
        totalXp: increment(5),
        referralsCount: increment(1),
        updatedAt: new Date().toISOString(),
      });

      // Update local storage saved accounts if the inviter is saved on this device
      updateLocalSavedAccountReferral(inviterDoc.id, 5);

      return {
        success: true,
        inviterName: inviterData.displayName || 'Colega MININT',
      };
    }

    // 2. Check local saved accounts as fallback
    const savedAccountsJson = localStorage.getItem('minint_saved_accounts');
    if (savedAccountsJson) {
      const savedAccounts: SavedAccount[] = JSON.parse(savedAccountsJson);
      const matchedLocal = savedAccounts.find(acc => acc.referralCode?.toUpperCase() === cleanCode);

      if (matchedLocal && matchedLocal.uid !== newCandidateUid) {
        updateLocalSavedAccountReferral(matchedLocal.uid, 5);
        return {
          success: true,
          inviterName: matchedLocal.displayName || 'Colega MININT',
        };
      }
    }

    return { success: false, error: 'Código de indicação não encontrado. Verifique se digitou corretamente.' };
  } catch (error) {
    console.warn('Aviso ao processar recompensa de indicação:', error);
    return { success: false, error: 'Erro ao validar código de indicação' };
  }
}

/**
 * Helper to update saved account XP locally
 */
function updateLocalSavedAccountReferral(uid: string, xpBonus: number) {
  try {
    const savedAccountsJson = localStorage.getItem('minint_saved_accounts');
    if (!savedAccountsJson) return;

    const savedAccounts: SavedAccount[] = JSON.parse(savedAccountsJson);
    const updated = savedAccounts.map(acc => {
      if (acc.uid === uid) {
        return {
          ...acc,
          totalXp: (acc.totalXp || 0) + xpBonus,
        };
      }
      return acc;
    });

    localStorage.setItem('minint_saved_accounts', JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao atualizar contas locais salvas:', e);
  }
}
