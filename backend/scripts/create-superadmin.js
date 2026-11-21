require('dotenv').config({path: 'backend/.env'});
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Nov52002#',
  database: process.env.DB_NAME || 'vemtap',
});

async function main() {
  await client.connect();
  const email = 'admin@vemtap.com';
  const plainPassword = 'SuperAdmin2026!';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existing = await client.query('SELECT id, email FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    const id = existing.rows[0].id;
    await client.query(`
      UPDATE users
      SET password = $1,
          role = 'SUPER_ADMIN',
          status = 'Active',
          "emailVerified" = true,
          "isPasswordChanged" = true,
          "firstName" = 'Super',
          "lastName" = 'Admin',
          "authProvider" = 'LOCAL',
          "twoFactorEnabled" = false,
          "updatedAt" = NOW()
      WHERE id = $2
    `, [hashedPassword, id]);
    console.log(`Updated admin user: ${email} (id: ${id})`);
  } else {
    const newId = crypto.randomUUID();
    await client.query(`
      INSERT INTO users (
        id, email, password, role, status, "emailVerified", "isPasswordChanged",
        "firstName", "lastName", "authProvider", "twoFactorEnabled", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, 'SUPER_ADMIN', 'Active', true, true,
        'Super', 'Admin', 'LOCAL', false, NOW(), NOW()
      )
    `, [newId, email, hashedPassword]);
    console.log(`Created admin user: ${email} (id: ${newId})`);
  }

  // Verify by querying back
  const check = await client.query('SELECT id, email, role, status, "emailVerified", "authProvider" FROM users WHERE email = $1', [email]);
  console.log('Verification:', check.rows[0]);

  await client.end();
}

main().catch(e => {
  console.error('Error creating superadmin:', e);
  process.exit(1);
});
