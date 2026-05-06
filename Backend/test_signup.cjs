const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: './.env'});
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function test() {
  console.log("Trying admin.createUser...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test_admin_trigger3@test.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { 
      nama: 'Test',
      full_name: 'Test',
      role: 'warga',
      kecamatan_id: null
    }
  });
  console.log('Result:', { data, error });
}
test();
