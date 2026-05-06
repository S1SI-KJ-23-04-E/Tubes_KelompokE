const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: './.env'});
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
  const { data, error } = await supabase.from('kecamatan').insert([{ nama_kecamatan: 'Test Kecamatan' }]);
  console.log('Result:', { data, error });
}
test();
