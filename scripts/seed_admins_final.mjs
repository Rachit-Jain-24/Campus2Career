
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Configuration
const SUPABASE_URL = 'https://ljwnoaekevrymieukgxy.supabase.co';
const NEW_PASSWORD = 'admin@1324';

// Load service role key
const envServer = readFileSync('.env.server', 'utf8');
const serviceRoleKey = envServer.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const adminsToCreate = [
  { email: 'sysadmin@nmims.edu', name: 'System Administrator', role: 'system_admin' },
  { email: 'dean@nmims.edu', name: 'Dean (STME)', role: 'dean' },
  { email: 'director@nmims.edu', name: 'Director (NMIMS)', role: 'director' },
  { email: 'programchair@nmims.edu', name: 'Program Chair', role: 'program_chair' },
  { email: 'faculty@nmims.edu', name: 'Faculty Member', role: 'faculty' },
  { email: 'placement@nmims.edu', name: 'Placement Officer', role: 'placement_officer' }
];

async function run() {
  console.log('\n🚀  Campus2Career — Final Admin Seeding');
  console.log('─'.repeat(60));

  // 1. Fetch all Auth users to delete any matches to our target list
  console.log('🧹  Cleaning up Auth and Database accounts...');
  const { data: authUsers, error: authListErr } = await supabase.auth.admin.listUsers();
  
  if (authListErr) {
    console.error('❌  Error listing auth users:', authListErr.message);
  } else if (authUsers.users) {
    const targetEmails = adminsToCreate.map(a => a.email);
    for (const user of authUsers.users) {
      if (targetEmails.includes(user.email)) {
        process.stdout.write(`    Deleting Auth user: ${user.email} ... `);
        await supabase.auth.admin.deleteUser(user.id);
        console.log('✅');
      }
    }
  }

  // Also delete any users currently in the admins table (extra safety)
  const { data: dbAdmins } = await supabase.from('admins').select('id');
  if (dbAdmins) {
    for (const a of dbAdmins) {
      await supabase.auth.admin.deleteUser(a.id).catch(() => {});
    }
  }

  // 2. Clear the public.admins table
  console.log('\n🗑️  Clearing admins table...');
  const { error: clearErr } = await supabase
    .from('admins')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (clearErr) {
    console.error('❌  Error clearing table:', clearErr.message);
  }

  // 3. Create new admins
  console.log('\n🏗️  Creating new admin roles...');
  for (const adminData of adminsToCreate) {
    process.stdout.write(`    Creating [${adminData.role.padEnd(18)}] ${adminData.email} ... `);
    
    // Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: NEW_PASSWORD,
      email_confirm: true,
      user_metadata: { role: adminData.role, name: adminData.name }
    });

    if (authError) {
      console.log(`❌ Auth Error: ${authError.message}`);
      continue;
    }

    // Create DB Entry
    const { error: dbError } = await supabase
      .from('admins')
      .insert({
        id: authData.user.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role
      });

    if (dbError) {
      console.log(`❌ DB Error: ${dbError.message}`);
    } else {
      console.log('✅');
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🏁  Admin Seeding Complete!');
  console.log('═'.repeat(60));
  console.log(`\n  Password for ALL accounts: ${NEW_PASSWORD}\n`);
}

run().catch(err => {
  console.error('\n❌  Fatal error:', err.message);
  process.exit(1);
});
