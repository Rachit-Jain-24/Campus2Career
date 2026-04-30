
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load keys
const envServer = fs.readFileSync('.env.server', 'utf8');
const serviceRoleKey = envServer.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const envPublic = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envPublic.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function repairUser(email, password, sapId) {
    console.log(`Starting repair for ${email}...`);

    // 1. Check if user exists in Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    let user = users.find(u => u.email === email);

    if (user) {
        console.log(`User found. Force updating password...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password });
        if (updateError) throw updateError;
    } else {
        console.log(`User not found. Creating new auth user...`);
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });
        if (createError) throw createError;
        user = createData.user;
    }

    // 2. Link to Student Profile
    console.log(`Linking Auth User ${user.id} to Student profile ${sapId}...`);
    const { error: dbError } = await supabase
        .from('students')
        .update({ id: user.id })
        .eq('sap_id', sapId);

    if (dbError) {
        console.log(`Warning: Could not link profile (maybe it doesn't exist yet): ${dbError.message}`);
    } else {
        console.log(`Successfully linked profile!`);
    }

    console.log(`\nREPAIR COMPLETE!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Please login now.`);
}

repairUser('rachit.jain036@nmims.edu.in', '70572200036', '70572200036');
