import { supabase } from '../lib/supabase';

/**
 * Creates a system admin account for accessing the admin panel via Supabase Auth.
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
        // Step 1: Create Supabase Auth account
        let userId = adminSapId;
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword,
        });

        if (signUpError) {
            if (signUpError.message?.toLowerCase().includes('already registered')) {
                console.log('ℹ️  Auth account already exists, updating profile only');
            } else {
                throw signUpError;
            }
        } else if (signUpData.user) {
            userId = signUpData.user.id;
            console.log('✅ Created Supabase Auth account');
        }

        // Step 2: Upsert admin profile in 'admins' table
        const adminProfile = {
            id: userId,
            sap_id: adminSapId,
            email: adminEmail,
            name: 'System Administrator',
            role: 'system_admin',
            phone: '9999999999',
            department: 'Administration',
            designation: 'System Administrator',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { error: upsertError } = await supabase
            .from('admins')
            .upsert(adminProfile, { onConflict: 'email' });

        if (upsertError) throw upsertError;
        console.log('✅ Created admin profile in Supabase');

        console.log('\n' + '='.repeat(60));
        console.log('✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\nLogin Credentials:');
        console.log(`Email:    ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('\nAdmin Login URL:');
        console.log('http://localhost:5174/login/admin');
        console.log('='.repeat(60) + '\n');

        return {
            success: true,
            email: adminEmail,
            password: adminPassword,
        };

    } catch (error: any) {
        console.error('\n❌ Error creating admin account:', error.message);
        throw error;
    }
}
