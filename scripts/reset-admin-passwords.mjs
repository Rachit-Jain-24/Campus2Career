/**
 * Reset passwords for ALL existing admin accounts in Supabase
 * 
 * Run:
 *   node scripts/reset-admin-passwords.mjs
 * 
 * Requires .env.server in project root:
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
 * 
 * Get service role key from:
 *   Supabase Dashboard → Settings → API → service_role (secret)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load service role key from .env.server
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
try {
  const envServer = readFileSync(join(__dirname, '../.env.server'), 'utf8');
  for (const line of envServer.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k?.trim() === 'SUPABASE_SERVICE_ROLE_KEY') {
      serviceRoleKey = v.join('=').trim();
    }
  }
} catch { /* use process.env fallback */ }

if (!serviceRoleKey) {
  console.error('\n❌  SUPABASE_SERVICE_ROLE_KEY not found.');
  console.error('    Create .env.server in project root:');
  console.error('    SUPABASE_SERVICE_ROLE_KEY=your_key_here\n');
  console.error('    Get it: Supabase Dashboard → Settings → API → service_role\n');
  process.exit(1);
}

const SUPABASE_URL = 'https://ljwnoaekevrymieukgxy.supabase.co';
const NEW_PASSWORD  = 'admin@1324';

const supabase = createClient(SUPABASE_URL, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log('\n🔐  Campus2Career — Admin Password Reset');
  console.log(`    New password: ${NEW_PASSWORD}\n`);
  console.log('─'.repeat(60));

  // 1. Fetch all rows from the admins table
  const { data: adminRows, error: fetchErr } = await supabase
    .from('admins')
    .select('id, email, name, role')
    .eq('is_active', true);

  if (fetchErr) {
    console.error('\n❌  Could not fetch admins table:', fetchErr.message);
    process.exit(1);
  }

  if (!adminRows || adminRows.length === 0) {
    console.error('\n❌  No admin rows found in the admins table.');
    process.exit(1);
  }

  console.log(`\n    Found ${adminRows.length} admin account(s):\n`);

  let successCount = 0;

  for (const admin of adminRows) {
    process.stdout.write(`    [${(admin.role || 'unknown').padEnd(18)}] ${admin.email} ... `);

    const { error } = await supabase.auth.admin.updateUserById(admin.id, {
      password: NEW_PASSWORD,
      email_confirm: true,
    });

    if (error) {
      console.log(`❌  ${error.message}`);
    } else {
      console.log('✅  password updated');
      successCount++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`✅  Done — ${successCount}/${adminRows.length} passwords reset`);
  console.log('═'.repeat(60));
  console.log('\n  Login URL: https://campus2career-assistant.web.app/login/admin');
  console.log(`  Password:  ${NEW_PASSWORD}\n`);
  console.log('  Accounts reset:');
  for (const a of adminRows) {
    console.log(`    ${a.email.padEnd(40)} [${a.role}]`);
  }
  console.log('\n' + '═'.repeat(60) + '\n');
}

run().catch(err => {
  console.error('\n❌  Fatal error:', err.message);
  process.exit(1);
});
