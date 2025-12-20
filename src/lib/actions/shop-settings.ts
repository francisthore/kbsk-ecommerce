'use server';

import { db } from '@/lib/db';
import { shopSettings, updateShopSettingsSchema, type UpdateShopSettings } from '@/lib/db/schema/shopSettings';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { DEFAULT_SETTINGS } from '@/lib/constants/shop-settings';

/**
 * Verify admin role for protected actions
 */
async function verifyAdminRole() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return session.user;
}

/**
 * Get shop settings from database
 * If no settings exist, returns defaults
 */
export async function getShopSettings() {
  try {
    const settings = await db.query.shopSettings.findFirst({
      orderBy: (shopSettings, { desc }) => [desc(shopSettings.updatedAt)],
    });

    if (!settings) {
      return {
        success: true,
        data: DEFAULT_SETTINGS,
        isDefault: true,
      };
    }

    return {
      success: true,
      data: {
        ...settings,
        taxRate: parseFloat(settings.taxRate),
        markupRate: parseFloat(settings.markupRate),
        freeShippingThreshold: parseFloat(settings.freeShippingThreshold),
      },
      isDefault: false,
    };
  } catch (error) {
    console.error('Error fetching shop settings:', error);
    return {
      success: false,
      error: 'Failed to fetch shop settings',
      data: DEFAULT_SETTINGS,
      isDefault: true,
    };
  }
}

/**
 * Update shop settings
 * Creates initial settings if none exist
 */
export async function updateShopSettings(data: UpdateShopSettings) {
  try {
    const user = await verifyAdminRole();

    // Validate input
    const validated = updateShopSettingsSchema.parse(data);

    // Check if settings exist
    const existing = await db.query.shopSettings.findFirst({
      orderBy: (shopSettings, { desc }) => [desc(shopSettings.updatedAt)],
    });

    let result;

    if (existing) {
      // Update existing settings
      [result] = await db
        .update(shopSettings)
        .set({
          ...validated,
          taxRate: validated.taxRate?.toString(),
          markupRate: validated.markupRate?.toString(),
          freeShippingThreshold: validated.freeShippingThreshold?.toString(),
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .where(eq(shopSettings.id, existing.id))
        .returning();
    } else {
      // Create initial settings
      [result] = await db
        .insert(shopSettings)
        .values({
          ...DEFAULT_SETTINGS,
          ...validated,
          taxRate: (validated.taxRate ?? 0.15).toString(),
          markupRate: (validated.markupRate ?? 0.30).toString(),
          freeShippingThreshold: (validated.freeShippingThreshold ?? 500).toString(),
          updatedBy: user.id,
        })
        .returning();
    }

    // Revalidate all admin and shop pages
    revalidatePath('/admin');
    revalidatePath('/shop');

    return {
      success: true,
      data: result,
      message: 'Shop settings updated successfully',
    };
  } catch (error) {
    console.error('Error updating shop settings:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to update shop settings',
    };
  }
}

/**
 * Initialize shop settings with defaults if none exist
 * Safe to call multiple times (idempotent)
 */
export async function initializeShopSettings() {
  try {
    const existing = await db.query.shopSettings.findFirst();

    if (existing) {
      return {
        success: true,
        message: 'Shop settings already initialized',
        data: existing,
      };
    }

    const [result] = await db
      .insert(shopSettings)
      .values(DEFAULT_SETTINGS)
      .returning();

    return {
      success: true,
      message: 'Shop settings initialized with defaults',
      data: result,
    };
  } catch (error) {
    console.error('Error initializing shop settings:', error);
    return {
      success: false,
      error: 'Failed to initialize shop settings',
    };
  }
}
