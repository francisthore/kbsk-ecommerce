/**
 * Simple script to promote a user to admin
 * Usage: npx tsx scripts/make-admin.ts your@email.com
 */

import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ Please provide an email address');
    console.log('\nUsage: npx tsx scripts/make-admin.ts user@example.com');
    process.exit(1);
  }

  try {
    console.log(`\n🔍 Looking for user: ${email}`);
    
    const result = await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      console.log(`\n❌ No user found with email: ${email}`);
      console.log('💡 Make sure the user has registered first');
    } else {
      console.log(`\n✅ Success! ${email} is now an admin`);
      console.log('🚀 They can access /admin now');
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
  
  process.exit(0);
}

makeAdmin();
