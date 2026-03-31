import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Creates a system admin account for accessing the admin panel
 * Default credentials:
 * Email: admin@nmims.edu.in
 * Password: admin123
 */

export async function createAdminAccount() {
    const adminEmail = 'admin@nmims.edu.in';
    const adminPassword = 'admin123';
    const adminSapId = 'ADMIN001';

    console.log('\n🔐 Creating System Admin Account...\n');

    try {
        // Step 1: Create Firebase Auth account
        let userId = adminSapId;
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                adminEmail,
                adminPassword
            );
            userId = userCredential.user.uid;
            console.log('✅ Created Firebase Auth account');
        } catch (authError: any) {
            if (authError.code === 'auth/email-already-in-use') {
                console.log('ℹ️  Auth account already exists, updating Firestore only');
            } else {
                throw authError;
            }
        }

        // Step 2: Create Firestore admin profile
        const adminProfile = {
            id: userId,
            sapId: adminSapId,
            email: adminEmail,
            name: 'System Administrator',
            role: 'admin',
            adminRole: 'system_admin',
            phone: '9999999999',
            department: 'Administration',
            designation: 'System Administrator',
            permissions: ['all'],
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await setDoc(doc(db, 'users', adminSapId), adminProfile);
        console.log('✅ Created Firestore admin profile');

        console.log('\n' + '='.repeat(60));
        console.log('✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\nLogin Credentials:');
        console.log(`Email:    ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('\nAdmin Login URL:');
        console.log('http://localhost:5174/admin/login');
        console.log('='.repeat(60) + '\n');

        return {
            success: true,
            email: adminEmail,
            password: adminPassword
        };

    } catch (error: any) {
        console.error('\n❌ Error creating admin account:', error.message);
        throw error;
    }
}

// Run if executed directly
if (require.main === module) {
    createAdminAccount()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
