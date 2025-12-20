import { db } from '@/lib/db';
import { shopSettings } from '@/lib/db/schema/shopSettings';
import { DEFAULT_SETTINGS } from '@/lib/constants/shop-settings';

/**
 * Seed script for shop settings
 * Populates the shop_settings table with default values from DEFAULT_SETTINGS
 * Run: npx tsx scripts/seed-shop-settings.ts
 */

async function seedShopSettings() {
  try {
    console.log('🌱 Starting shop settings seed...\n');

    // Check if settings already exist
    const existing = await db.query.shopSettings.findFirst();

    if (existing) {
      console.log('⚠️  Shop settings already exist in the database!');
      console.log(`   Current shop name: ${existing.shopName}`);
      console.log(`   Last updated: ${existing.updatedAt}\n`);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        readline.question('Do you want to reset to defaults? (yes/no): ', async (answer: string) => {
          readline.close();
          
          if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            console.log('\n🔄 Resetting to default settings...');
            
            await db
              .update(shopSettings)
              .set({
                ...DEFAULT_SETTINGS,
                updatedAt: new Date(),
              })
              .where(db.$with(shopSettings).id.eq(existing.id));

            console.log('✅ Shop settings reset to defaults!\n');
            await displaySettings();
          } else {
            console.log('\n❌ Seed cancelled. Existing settings preserved.\n');
          }
          resolve(undefined);
        });
      });
    }

    // Insert default settings
    console.log('📝 Inserting default shop settings...');
    
    const [inserted] = await db
      .insert(shopSettings)
      .values(DEFAULT_SETTINGS)
      .returning();

    console.log('✅ Shop settings seeded successfully!\n');
    
    // Display the seeded settings
    await displaySettings();

  } catch (error) {
    console.error('❌ Error seeding shop settings:', error);
    process.exit(1);
  }
}

async function displaySettings() {
  const settings = await db.query.shopSettings.findFirst();
  
  if (!settings) {
    console.log('No settings found in database.');
    return;
  }

  console.log('📊 Current Shop Settings:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🏪 Shop Name:           ${settings.shopName}`);
  console.log(`🌍 Country:             ${settings.shopCountry}`);
  console.log(`⏰ Timezone:            ${settings.shopTimezone}`);
  console.log('');
  console.log(`💰 Currency:            ${settings.currencySymbol} ${settings.currencyCode} (${settings.currencyLocale})`);
  console.log(`📊 VAT Rate:            ${(parseFloat(settings.taxRate) * 100).toFixed(2)}%`);
  console.log(`📈 Markup Rate:         ${(parseFloat(settings.markupRate) * 100).toFixed(2)}%`);
  console.log(`🚚 Free Shipping:       ${settings.currencySymbol}${settings.freeShippingThreshold}`);
  console.log('');
  console.log(`📧 Business Email:      ${settings.businessEmail || 'Not set'}`);
  console.log(`📞 Business Phone:      ${settings.businessPhone || 'Not set'}`);
  console.log(`🏢 Registration No:     ${settings.businessRegistrationNumber || 'Not set'}`);
  console.log(`🆔 VAT Number:          ${settings.vatNumber || 'Not set'}`);
  console.log('');
  console.log('⚙️  Features:');
  console.log(`   Guest Checkout:      ${settings.enableGuestCheckout ? '✅' : '❌'}`);
  console.log(`   Wishlist:            ${settings.enableWishlist ? '✅' : '❌'}`);
  console.log(`   Reviews:             ${settings.enableReviews ? '✅' : '❌'}`);
  console.log(`   Quote Requests:      ${settings.enableQuotes ? '✅' : '❌'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run the seed
seedShopSettings()
  .then(() => {
    console.log('🎉 Shop settings seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
