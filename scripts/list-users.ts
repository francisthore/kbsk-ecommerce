/**
 * List all users in the database
 * Usage: npx tsx scripts/list-users.ts
 */

import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';

async function listUsers() {
  try {
    console.log('\n📋 Listing all users...\n');
    
    const allUsers = await db.select({
      email: users.email,
      name: users.name,
      role: users.role,
      emailVerified: users.emailVerified,
    }).from(users);

    if (allUsers.length === 0) {
      console.log('No users found in database.');
      console.log('\n💡 Register a user first at /register');
    } else {
      console.table(allUsers);
      console.log(`\nTotal users: ${allUsers.length}`);
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
  
  process.exit(0);
}

listUsers();
