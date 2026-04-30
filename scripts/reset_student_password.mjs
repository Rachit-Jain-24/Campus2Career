
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
const envServer = fs.readFileSync('.env.server', 'utf8');
const serviceRoleKey = envServer.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const envPublic = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envPublic.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword(email, newPassword) {
  console.log(`Attempting to reset password for ${email}...`);

  // Get user ID by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = users.users.find(u => u.email === email);

  if (!user) {
    console.error(`User with email ${email} not found in Supabase Auth.`);
    return;
  }

  // Update password
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (error) {
    console.error('Error updating password:', error);
  } else {
    console.log(`Successfully reset password for ${email} to: ${newPassword}`);
    console.log('You can now log in to the student portal.');
  }
}

const targetEmail = process.argv[2] || 'rachit.jain036@nmims.edu.in';
const targetPass = process.argv[3] || '70572200036';

resetPassword(targetEmail, targetPass);
