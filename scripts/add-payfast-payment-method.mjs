/**
 * Payfast Integration - Database Migration Script
 * 
 * This script adds 'payfast' to the payment_method enum in PostgreSQL
 * Run this before using the Payfast integration
 * 
 * Usage:
 *   node scripts/add-payfast-payment-method.mjs
 */

import 'dotenv/config';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function main() {
  console.log('🔄 Starting Payfast database migration...\n');

  const client = postgres(connectionString, { max: 1 });

  try {
    // Check if 'payfast' already exists in the enum
    console.log('Checking if payfast payment method already exists...');
    
    const checkResult = await client`
      SELECT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'payfast'
        AND enumtypid = (
          SELECT oid
          FROM pg_type
          WHERE typname = 'payment_method'
        )
      ) as exists;
    `;

    const exists = checkResult[0]?.exists;

    if (exists) {
      console.log('✅ Payment method "payfast" already exists in the database');
      console.log('   No changes needed.\n');
    } else {
      // Add 'payfast' to the payment_method enum
      console.log('Adding "payfast" to payment_method enum...');
      
      await client`
        ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'payfast';
      `;

      console.log('✅ Successfully added "payfast" to payment_method enum\n');
    }

    // Verify the change
    console.log('Verifying payment methods...');
    const paymentMethods = await client`
      SELECT enumlabel as method
      FROM pg_enum
      WHERE enumtypid = (
        SELECT oid
        FROM pg_type
        WHERE typname = 'payment_method'
      )
      ORDER BY enumsortorder;
    `;

    console.log('\n📋 Available payment methods:');
    paymentMethods.forEach(({ method }) => {
      console.log(`   - ${method}`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Configure Payfast environment variables');
    console.log('   2. Test the integration in sandbox mode');
    console.log('   3. See PAYFAST_INTEGRATION_GUIDE.md for details');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
