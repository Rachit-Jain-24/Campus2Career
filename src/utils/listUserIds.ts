import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function listUserDocIds() {
    const usersRef = collection(db, 'students');
    const snapshot = await getDocs(usersRef);
    const ids = snapshot.docs.map(doc => ({ id: doc.id, email: doc.data().email, role: doc.data().role }));
    console.log('User Document IDs:', ids);
    return ids;
}
