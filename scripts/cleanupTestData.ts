import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, getDocs, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCjG36Cav9_UFr41pIGCLa2zv_xiIvP5n8",
  authDomain: "simulados-minint.firebaseapp.com",
  databaseURL: "https://simulados-minint-default-rtdb.firebaseio.com",
  projectId: "simulados-minint",
  storageBucket: "simulados-minint.firebasestorage.app",
  messagingSenderId: "371489175915",
  appId: "1:371489175915:web:3e586300fbd9d0a8c4742e",
  measurementId: "G-FZFZTTCFG7"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = initializeFirestore(app, {});

async function runCleanup() {
  console.log('--- A iniciar limpeza de dados de teste na coleção users ---');
  
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    console.log(`Total de documentos encontrados na coleção 'users': ${snapshot.size}`);

    let deletedCount = 0;
    let preservedCount = 0;
    let resetCount = 0;

    for (const userDoc of snapshot.docs) {
      const data = userDoc.data();
      const docId = userDoc.id;
      const role = data.role || '';
      const emailOrPhone = (data.emailOrPhone || '').toLowerCase();
      const displayName = data.displayName || '';

      const isAdmin = role === 'admin' || emailOrPhone.includes('admin') || displayName.toLowerCase().includes('admin');

      if (isAdmin) {
        console.log(`[PRESERVADO ADMIN] ID: ${docId} | Nome: "${displayName}" | Role: ${role} | Email: ${emailOrPhone}`);
        preservedCount++;
        // Reset league stats for admin while maintaining admin role and total XP/privileges
        await updateDoc(doc(db, 'users', docId), {
          weeklyDuelPoints: 0,
          duelsWon: 0,
          multiplayerDuelsWon: 0,
          duelsPlayed: 0,
          duelLeague: 'bronze',
          updatedAt: new Date().toISOString()
        });
        console.log(`[RESET LIGA ADMIN] Estatísticas de liga resetadas para Bronze com 0 pontos/vitórias.`);
      } else {
        const isFictitious = displayName === 'Candidato MININT' || 
                            displayName.toLowerCase().includes('candidato minint') ||
                            displayName.toLowerCase().includes('teste') ||
                            data.isAnonymous === true ||
                            docId.startsWith('candidato_');

        if (isFictitious) {
          console.log(`[APAGANDO CONTA TESTE] ID: ${docId} | Nome: "${displayName}" | Email: ${emailOrPhone}`);
          await deleteDoc(doc(db, 'users', docId));
          deletedCount++;
        } else {
          // Real user: preserve account, but reset weekly ranking & league progress to Bronze (0 Pts, 0 Wins)
          console.log(`[PRESERVADO UTILIZADOR REAL] ID: ${docId} | Nome: "${displayName}" | Resetando estatísticas de Liga`);
          await updateDoc(doc(db, 'users', docId), {
            weeklyDuelPoints: 0,
            duelsWon: 0,
            multiplayerDuelsWon: 0,
            duelsPlayed: 0,
            duelLeague: 'bronze',
            updatedAt: new Date().toISOString()
          });
          preservedCount++;
          resetCount++;
        }
      }
    }

    console.log('\n--- RESUMO DA LIMPEZA ---');
    console.log(`Contas fictícias eliminadas: ${deletedCount}`);
    console.log(`Contas preservadas (Admin/Reais): ${preservedCount}`);
    console.log(`Rankings de liga resetados: ${resetCount + (preservedCount > 0 ? 1 : 0)}`);
    console.log('----------------------------');
  } catch (err) {
    console.error('Erro durante a limpeza:', err);
  }

  process.exit(0);
}

runCleanup();
