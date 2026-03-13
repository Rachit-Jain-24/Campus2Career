import { collection, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { demoAccounts } from '../data/demoAccounts';

export async function seedDemoAccounts() {
  try {
    console.log('Starting demo account seeding...');
    const results = [];
    
    for (const account of demoAccounts) {
      try {
        // Create Firebase Auth user
        let authUser;
        try {
          authUser = await createUserWithEmailAndPassword(
            auth,
            account.email,
            account.password
          );
          console.log(`✅ Created Auth user: ${account.email}`);
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-in-use') {
            console.log(`ℹ️ Auth user already exists: ${account.email}`);
          } else {
            throw authError;
          }
        }

        // Create Firestore document
        const userRef = doc(db, 'users', account.sapId);
        await setDoc(userRef, {
          ...account,
          role: 'student',
          id: account.sapId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log(`✅ Seeded Firestore doc: ${account.name} (${account.sapId})`);
        results.push({ success: true, account: account.name });
      } catch (error) {
        console.error(`❌ Error seeding ${account.name}:`, error);
        results.push({ success: false, account: account.name, error });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Successfully seeded ${successCount}/${demoAccounts.length} accounts!`);
    return { success: true, count: successCount, results };
  } catch (error) {
    console.error('❌ Error seeding demo accounts:', error);
    return { success: false, error };
  }
}

// Helper function to check if demo accounts exist
export async function checkDemoAccountsExist() {
  try {
    const { doc: docRef, getDoc } = await import('firebase/firestore');
    const firstDemoRef = docRef(db, 'users', 'DEMO1001');
    const docSnap = await getDoc(firstDemoRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking demo accounts:', error);
    return false;
  }
}

// Helper to delete existing demo accounts (for re-seeding)
export async function deleteDemoAccounts() {
  try {
    const { doc: docRef, deleteDoc } = await import('firebase/firestore');
    const { deleteUser } = await import('firebase/auth');
    
    for (const account of demoAccounts) {
      try {
        // Delete Firestore document
        const userRef = docRef(db, 'users', account.sapId);
        await deleteDoc(userRef);
        console.log(`Deleted Firestore doc: ${account.sapId}`);
      } catch (error) {
        console.error(`Error deleting ${account.sapId}:`, error);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting demo accounts:', error);
    return { success: false, error };
  }
}
