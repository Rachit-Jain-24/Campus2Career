import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.server'), override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.server');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanup() {
  const email = 'ram@gmail.com';
  const sapId = '70572200099';
  
  console.log(`Cleaning up test data for Email: ${email} and SAP ID: ${sapId}...`);
  
  // 1. Delete from students table
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .delete()
    .eq('sap_id', sapId)
    .select();
    
  if (studentError) {
    console.error('Error deleting student row:', studentError.message);
  } else {
    console.log(`Deleted ${studentData.length} row(s) from public.students.`);
  }

  // 2. Delete from auth.users (Find user by email first)
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing auth users:', listError.message);
    return;
  }
  
  const userToDelete = users.find(u => u.email === email);
  
  if (userToDelete) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userToDelete.id);
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError.message);
    } else {
      console.log(`Successfully deleted auth user: ${email}`);
    }
  } else {
    console.log(`Auth user ${email} not found.`);
  }
  
  console.log('Cleanup complete! You can now register this student again.');
}

cleanup();
