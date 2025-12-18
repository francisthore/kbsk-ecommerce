/**
 * Script to create the first admin user
 * Run with: npx tsx scripts/create-admin.mjs
 */

import { db } from '../src/lib/db/index.js';
import { users } from '../src/lib/db/schema/index.js';
import { eq } from 'drizzle-orm';

async function createAdmin() {
  console.log('\n🔐 Admin User Creation Script\n');
  
  // Get email from command line argument
  const email = process.argv[2];
  
  if (!email || !email.includes('@')) {
    console.error('❌ Invalid email address');
    console.log('\nUsage: npx tsx scripts/create-admin.mjs user@example.com');
    process.exit(1);
  }

  try {
    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email.trim()));
    const user = existingUsers[0];

    if (!user) {
      console.error(`❌ User with email "${email}" not found.`);
      console.log('\n💡 The user must first register through the normal signup process.');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`✅ User "${email}" is already an admin!`);
      process.exit(0);
    }

    // Update user to admin
    await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email.trim()));

    console.log(`\n✅ SUCCESS! User "${email}" is now an admin.`);
    console.log('\n🚀 You can now access the admin panel at: /admin');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
