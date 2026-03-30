const postgres = require('postgres');
const sql = postgres('postgresql://fd_g78z_user:Odcx7nPQsjo4IrYxNW801rCeTjItgFfC@dpg-d6cpk6vpm1nc739c6ucg-a.oregon-postgres.render.com/fd_g78z?sslmode=require');

async function test() {
  console.log('Starting raw connection test to Render...');
  try {
    const res = await sql`SELECT 1 as result`;
    console.log('Success! Result:', res);
  } catch (err) {
    console.error('Connection Failed with Error Details:');
    console.error(err);
  } finally {
    process.exit();
  }
}

test();
